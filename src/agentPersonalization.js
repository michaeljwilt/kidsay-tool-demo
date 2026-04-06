// src/agentPersonalization.js
// Personalization engine — generates config-aware content for the dashboard

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


function fillTemplate(template, config) {
  const cat = randomFrom(config.categories || ['Toys']);
  const region = randomFrom(config.regions || ['National']);
  const age = randomFrom(config.ageGroups || ['Kids']).split(' ')[0];
  return template
    .replace(/\{category\}/g, cat)
    .replace(/\{region\}/g, region)
    .replace(/\{ageGroup\}/g, age)
    .replace(/\{quarter\}/g, 'Q4 2025');
}

function scoreItem(item, config) {
  let score = 0;
  if (item.category && config.categories?.some(c => c.toLowerCase() === item.category.toLowerCase())) score += 2;
  if (item.region && config.regions?.includes(item.region)) score++;
  if (item.ageGroup && config.ageGroups?.some(a => a.startsWith(item.ageGroup))) score++;
  if (item.alertType && config.alerts?.includes(item.alertType)) score++;
  if (!item.category && !item.region && !item.ageGroup) score += 1; // universal items get baseline
  return score;
}

function filterByConfig(pool, config) {
  return pool
    .map(item => ({ ...item, _score: scoreItem(item, config) }))
    .filter(item => item._score > 0)
    .sort((a, b) => b._score - a._score);
}

// ── Activity Templates ───────────────────────────────────────────────────────

const ACTIVITY_TEMPLATES = [
  // Weekly scan events
  { template: 'Ran weekly {category} forecast model for {region}', type: 'scan', category: 'Toys', day: 'Mon' },
  { template: 'Ran weekly {category} forecast model for {region}', type: 'scan', category: 'Snacks', day: 'Mon' },
  { template: 'Updated {ageGroup} preference projections through Q2 \'26', type: 'scan', day: 'Mon' },
  { template: 'Reprocessed 104 quarters of historical data for {region}', type: 'scan', day: 'Tue' },
  { template: 'Recalibrated seasonal models for {category}', type: 'scan', alertType: 'seasonal', day: 'Tue' },
  { template: 'Generated QoQ forecast deltas for {ageGroup} segments', type: 'scan', alertType: 'qoq', day: 'Wed' },

  // Trend discoveries
  { template: 'Forecast: Healthy snacks projected +15% next quarter for {ageGroup}', type: 'trend', category: 'Snacks', alertType: 'trends', day: 'Wed' },
  { template: 'Forecast: Building sets on track to overtake action figures in {region}', type: 'trend', category: 'Toys', alertType: 'trends', day: 'Thu' },
  { template: 'Forecast: Organic beverages accelerating — projected +22% by Q2 \'26', type: 'trend', category: 'Snacks', alertType: 'trends', day: 'Thu' },
  { template: 'Forecast: Outdoor play expected +18% heading into summer', type: 'trend', category: 'Toys', alertType: 'trends', day: 'Fri' },
  { template: 'Forecast: Collectibles projected fastest-growing segment next quarter', type: 'trend', category: 'Toys', alertType: 'trends', day: 'Fri' },

  // Anomaly projections
  { template: 'Model flagged: LEGO projected continued decline in {region} — watch list', type: 'anomaly', category: 'Toys', alertType: 'anomalies', day: 'Thu' },
  { template: 'Model flagged: Barbie expected 4th consecutive QoQ drop', type: 'anomaly', category: 'Toys', alertType: 'anomalies', day: 'Fri' },

  // Completes
  { template: 'Weekly forecast report ready: {category} outlook for {region}', type: 'complete', day: 'Fri' },
  { template: 'Weekly summary: 8 new forecasts generated for {ageGroup} segment', type: 'complete', day: 'Sat' },
];

// ── Alert Templates ──────────────────────────────────────────────────────────

const ALERT_POOL = [
  // Growth forecasts (green)
  { severity: 'up', icon: '📈', title: 'Growth Forecast', body: 'Healthy snacks projected +15% next quarter among {ageGroup}', category: 'Snacks', alertType: 'trends',
    spark: [41, 44, 47, 49, 53, 56],
    ml: { model: 'ARIMA + XGBoost Ensemble', confidence: 89, r2: 0.94, mae: 1.8, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['5 consecutive quarters of growth', 'Health-conscious purchasing up 22% YoY among parents', 'Correlated with school wellness program expansion'] } },
  { severity: 'up', icon: '📈', title: 'Growth Forecast', body: 'Building sets expected to overtake action figures in {region} by Q2 \'26', category: 'Toys', alertType: 'trends',
    spark: [38, 42, 48, 51, 57, 62],
    ml: { model: 'Prophet + LightGBM', confidence: 84, r2: 0.91, mae: 2.3, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['STEM education spending +18% driving demand', 'Building sets outpacing action figures for 4 quarters', 'Social media engagement 3.1× higher for building content'] } },
  { severity: 'up', icon: '📈', title: 'Growth Forecast', body: 'Outdoor play projected +22% heading into summer season', category: 'Toys', alertType: 'trends',
    spark: [35, 38, 40, 44, 50, 57],
    ml: { model: 'Seasonal ARIMA', confidence: 91, r2: 0.96, mae: 1.2, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['Strong seasonal pattern — 25-year avg summer lift of 19%', 'Post-pandemic outdoor play remains elevated', 'New product launches up 35% vs prior year'] } },
  { severity: 'up', icon: '📈', title: 'Growth Forecast', body: 'Organic beverages on track for +18% by Q2 \'26 among {ageGroup}', category: 'Snacks', alertType: 'trends',
    spark: [22, 26, 30, 35, 41, 48],
    ml: { model: 'XGBoost Regressor', confidence: 86, r2: 0.92, mae: 2.1, trainRange: 'Q1 \'05 – Q4 \'25', trainSize: '80 quarters',
      factors: ['Exponential growth curve detected (doubling every 8 quarters)', 'Organic label preference +31% among surveyed parents', 'Retail shelf space allocation up 2.4× since \'22'] } },
  { severity: 'up', icon: '📈', title: 'Growth Forecast', body: 'Collectibles projected fastest-growing segment — +28% by mid-\'26', category: 'Toys', alertType: 'trends',
    spark: [25, 30, 36, 44, 52, 64],
    ml: { model: 'ARIMA + XGBoost Ensemble', confidence: 82, r2: 0.89, mae: 3.1, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['Unboxing content views +140% YoY driving awareness', 'Repeat purchase rate highest of any category (3.2×)', 'New IP launches (Pokémon, Mini Brands) expanding TAM'] } },
  { severity: 'up', icon: '📈', title: 'Growth Forecast', body: 'Lunchbox items expected to hit record demand for {ageGroup} next quarter', category: 'Snacks', alertType: 'trends',
    spark: [30, 33, 38, 44, 51, 58],
    ml: { model: 'Prophet + LightGBM', confidence: 88, r2: 0.93, mae: 1.9, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['Back-to-school period amplifies Q3 demand historically', 'Portion-pack format growing 2× faster than bulk', 'Parent survey: 68% plan to increase lunchbox spending'] } },
  { severity: 'up', icon: '📈', title: 'Recovery Signal', body: 'Hot Wheels models project rebound +14% in {region} by Q1 \'26', category: 'Toys', alertType: 'trends',
    spark: [40, 42, 45, 50, 56, 62],
    ml: { model: 'XGBoost Regressor', confidence: 78, r2: 0.87, mae: 2.8, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['New movie tie-in releasing Q4 \'25 (historically +20% lift)', 'Price reductions narrowing gap with competitors', 'Inventory restocking signals from top 3 retailers'] } },

  // Risk forecasts (amber)
  { severity: 'warn', icon: '⚠️', title: 'Risk Forecast', body: 'LEGO projected continued decline in {region} — down 12% by Q2 \'26', category: 'Toys', alertType: 'anomalies', region: 'West Coast',
    spark: [68, 65, 62, 58, 52, 48],
    ml: { model: 'ARIMA + XGBoost Ensemble', confidence: 85, r2: 0.93, mae: 2.0, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['4 consecutive quarters of decline in West Coast', 'Price sensitivity index rose 18% in region', 'Competitor (MEGA) gained 6 pts market share locally'] } },
  { severity: 'warn', icon: '⚠️', title: 'Risk Forecast', body: 'Barbie expected 4th consecutive QoQ drop — models show -8% next quarter', category: 'Toys', alertType: 'anomalies',
    spark: [65, 62, 60, 58, 55, 52],
    ml: { model: 'Prophet + LightGBM', confidence: 87, r2: 0.94, mae: 1.6, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['Post-movie demand normalization (typical 3–5 quarter cooldown)', 'No major product refresh scheduled until Q3 \'26', 'Interest shifting to collectibles in target demo'] } },
  { severity: 'warn', icon: '⚠️', title: 'Risk Forecast', body: '{category} engagement for {ageGroup} projected to soften next quarter', alertType: 'anomalies',
    spark: [60, 58, 55, 52, 49, 45],
    ml: { model: 'XGBoost Regressor', confidence: 76, r2: 0.85, mae: 3.2, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['Screen time competing for attention — up 12% YoY in segment', 'Category saturation detected (new SKU impact declining)', 'Historical pattern: softening typical after 6+ quarters of growth'] } },

  // Seasonal forecasts (teal)
  { severity: 'new', icon: '🔮', title: 'Seasonal Forecast', body: 'Holiday toy spike projected — LEGO expected to lead in {region}', category: 'Toys', alertType: 'seasonal',
    spark: [42, 51, 65, 78, 88, 95],
    ml: { model: 'Seasonal ARIMA', confidence: 94, r2: 0.97, mae: 1.1, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['25-year seasonal pattern: Q4 averages 2.3× baseline for toys', 'LEGO holiday ad spend confirmed +15% vs last year', 'Pre-order data from retailers running 8% ahead of \'24'] } },
  { severity: 'new', icon: '🔮', title: 'Seasonal Forecast', body: 'Back-to-school snack surge expected for {ageGroup} in Q3', category: 'Snacks', alertType: 'seasonal',
    spark: [38, 40, 44, 52, 50, 47],
    ml: { model: 'Seasonal ARIMA', confidence: 92, r2: 0.95, mae: 1.4, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['Back-to-school lift averages +18% across 20 years of data', 'Enrollment projections up 2% for target age group', 'Retailer promotional calendars loaded 12% heavier in Q3'] } },
  { severity: 'new', icon: '🔮', title: 'Seasonal Forecast', body: 'Q4 toy spending projected 2.3× average in {region}', category: 'Toys', alertType: 'seasonal',
    spark: [42, 48, 58, 72, 85, 95],
    ml: { model: 'ARIMA + XGBoost Ensemble', confidence: 93, r2: 0.96, mae: 1.3, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['Q4 multiplier stable at 2.1–2.5× for 15+ years', 'Consumer confidence index trending positive', 'Early Black Friday data showing +11% toy searches YoY'] } },
  { severity: 'up', icon: '🔮', title: 'Seasonal Forecast', body: 'Healthy snacks on track for record Q1 \'26 among {ageGroup}', category: 'Snacks', alertType: 'seasonal',
    spark: [49, 52, 55, 58, 62, 67],
    ml: { model: 'Prophet + LightGBM', confidence: 87, r2: 0.92, mae: 2.0, trainRange: 'Q1 \'05 – Q4 \'25', trainSize: '80 quarters',
      factors: ['New Year health resolutions drive 12% avg Q1 lift', 'Healthy snack shelf space expanding in major retailers', 'Survey: 74% of parents plan to increase healthy snack purchases'] } },

  // Projected milestones (green)
  { severity: 'up', icon: '🎯', title: 'Projected Milestone', body: 'Building sets on pace to surpass action figures in {region} by mid-\'26', category: 'Toys',
    spark: [45, 48, 52, 55, 58, 63],
    ml: { model: 'ARIMA + XGBoost Ensemble', confidence: 81, r2: 0.90, mae: 2.5, trainRange: 'Q1 \'00 – Q4 \'25', trainSize: '104 quarters',
      factors: ['Gap narrowing by ~2 pts/quarter for 6 consecutive quarters', 'Building sets benefit from both STEM trend and gifting occasions', 'Action figures losing share to digital/app-connected toys'] } },
  { severity: 'up', icon: '🎯', title: 'Projected Milestone', body: 'Healthy snacks projected to become #1 category for {ageGroup} by Q2 \'26', category: 'Snacks',
    spark: [44, 47, 50, 54, 58, 63],
    ml: { model: 'XGBoost Regressor', confidence: 83, r2: 0.91, mae: 2.2, trainRange: 'Q1 \'05 – Q4 \'25', trainSize: '80 quarters',
      factors: ['Healthy snacks closing 3 pt gap vs indulgent (currently trailing by 4)', 'School nutrition policy changes expanding addressable occasions', 'Parent willingness-to-pay premium for healthy options at all-time high'] } },
];

// ── Suggestion Templates ─────────────────────────────────────────────────────

const SUGGESTION_POOL = [
  // Toys
  { text: 'What are the top toys for {ageGroup} this quarter?', category: 'Toys' },
  { text: 'How have toy trends changed over 25 years?', category: 'Toys' },
  { text: "Tell me about LEGO's history", category: 'Toys' },
  { text: 'Show me the biggest toy movers this quarter', category: 'Toys' },
  { text: 'What toys are trending up fastest?', category: 'Toys' },
  { text: 'How do toy preferences differ by region?', category: 'Toys' },
  { text: 'Compare boys vs girls toy preferences', category: 'Toys' },
  { text: 'What spikes during the holidays?', category: 'Toys', alertType: 'seasonal' },
  { text: 'Which toys declined the most this quarter?', category: 'Toys', alertType: 'qoq' },

  // Snacks
  { text: 'Show me healthy snack trends', category: 'Snacks' },
  { text: 'What snacks are popular with {ageGroup}?', category: 'Snacks' },
  { text: 'How do snack preferences differ by region?', category: 'Snacks' },
  { text: 'What are the top snack brands this quarter?', category: 'Snacks' },
  { text: 'Show me beverage trends over the past year', category: 'Snacks' },
  { text: 'How have snack trends changed by decade?', category: 'Snacks' },

  // Universal
  { text: 'How do regions compare?', },
  { text: 'Show me trends for the {region} region', },
  { text: 'What changed from last quarter?', alertType: 'qoq' },
  { text: 'Are there any seasonal patterns?', alertType: 'seasonal' },
];

// ── Mini Chart Configs ───────────────────────────────────────────────────────

const MINI_CHART_POOL = [
  {
    title: 'Top Toys — Popularity %',
    category: 'Toys',
    chartType: 'bar',
    dataKey: 'value',
    data: [
      { name: 'LEGO', value: 68 },
      { name: 'Hot Wheels', value: 62 },
      { name: 'Squish.', value: 59 },
      { name: 'Barbie', value: 54 },
    ],
    metric: 'LEGO leads',
    delta: '+12% QoQ',
  },
  {
    title: 'Healthy Snack Trend',
    category: 'Snacks',
    chartType: 'line',
    dataKey: 'value',
    data: [
      { name: 'Q1', value: 41 },
      { name: 'Q2', value: 45 },
      { name: 'Q3', value: 49 },
      { name: 'Q4', value: 56 },
    ],
    metric: '+15% YoY',
    delta: 'Accelerating',
  },
  {
    title: 'QoQ Product Changes',
    category: 'Toys',
    alertType: 'qoq',
    chartType: 'bar',
    dataKey: 'change',
    data: [
      { name: 'LEGO', change: 12 },
      { name: 'Hot Wheels', change: 4 },
      { name: 'Squish.', change: 7 },
      { name: 'Barbie', change: -5 },
    ],
    metric: 'Q3 → Q4',
    delta: 'LEGO +12%',
  },
  {
    title: 'Regional {category}',
    chartType: 'bar',
    dataKey: 'value',
    data: [
      { name: 'NE', value: 72 },
      { name: 'SE', value: 58 },
      { name: 'MW', value: 65 },
      { name: 'SW', value: 49 },
      { name: 'WC', value: 71 },
    ],
    metric: 'NE leads',
    delta: 'SW underperforms',
  },
  {
    title: 'Snack Category Mix',
    category: 'Snacks',
    chartType: 'bar',
    dataKey: 'value',
    data: [
      { name: 'Healthy', value: 56 },
      { name: 'Indulge', value: 44 },
      { name: 'Bev.', value: 38 },
      { name: 'Lunch', value: 31 },
    ],
    metric: 'Healthy leads',
    delta: '+8% QoQ',
  },
  {
    title: 'Age Group Interest',
    chartType: 'bar',
    dataKey: 'value',
    data: [
      { name: '0–3', value: 45 },
      { name: '4–7', value: 72 },
      { name: '8–12', value: 68 },
      { name: '13+', value: 41 },
    ],
    metric: '4–7 peak',
    delta: 'Tweens steady',
  },
  {
    title: 'Holiday Toy Spike',
    category: 'Toys',
    alertType: 'seasonal',
    chartType: 'line',
    dataKey: 'value',
    data: [
      { name: 'Sep', value: 42 },
      { name: 'Oct', value: 51 },
      { name: 'Nov', value: 78 },
      { name: 'Dec', value: 95 },
    ],
    metric: 'Q4 peak',
    delta: '2.3× avg',
  },
  {
    title: 'Snack Seasonality',
    category: 'Snacks',
    alertType: 'seasonal',
    chartType: 'line',
    dataKey: 'value',
    data: [
      { name: 'Q1', value: 38 },
      { name: 'Q2', value: 44 },
      { name: 'Q3', value: 52 },
      { name: 'Q4', value: 47 },
    ],
    metric: 'Back-to-school peak',
    delta: 'Q3 +18%',
  },
];

// ── Exports ──────────────────────────────────────────────────────────────────

export function getPersonalizedActivities(config) {
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const filtered = filterByConfig(ACTIVITY_TEMPLATES, config);
  return filtered
    .sort((a, b) => dayOrder.indexOf(b.day || 'Mon') - dayOrder.indexOf(a.day || 'Mon'))
    .map(item => ({
      ...item,
      text: fillTemplate(item.template, config),
      day: item.day || 'Mon',
    }));
}

function buildChartData(spark, forecast) {
  if (!spark) return null;
  const labels = ['Q3 \'24', 'Q4 \'24', 'Q1 \'25', 'Q2 \'25', 'Q3 \'25', 'Q4 \'25'];
  const data = spark.map((v, i) => ({ name: labels[i], actual: v }));
  // Project 2 forecast quarters based on recent trend
  const last = spark[spark.length - 1];
  const prev = spark[spark.length - 2];
  const delta = last - prev;
  const f1 = Math.round(last + delta * 1.1);
  const f2 = Math.round(last + delta * 2.0);
  // Last actual point also gets forecast value so line connects
  data[data.length - 1].projected = last;
  data.push({ name: 'Q1 \'26', projected: f1 });
  data.push({ name: 'Q2 \'26', projected: f2 });
  return data;
}

export function getPersonalizedAlerts(config) {
  const filtered = filterByConfig(ALERT_POOL, config);
  const timestamps = ['Just now', '2m ago', '5m ago', '12m ago', '24m ago', '1h ago'];
  return filtered.map((item, i) => ({
    severity: item.severity,
    icon: item.icon,
    title: item.title,
    body: fillTemplate(item.body, config),
    time: timestamps[i] || timestamps[timestamps.length - 1],
    ...(item.spark ? { spark: item.spark, chartData: buildChartData(item.spark, item.forecast) } : {}),
    ...(item.forecast ? { forecast: true } : {}),
    ...(item.ml ? { ml: item.ml } : {}),
  }));
}

export function getPersonalizedSuggestions(config) {
  const filtered = filterByConfig(SUGGESTION_POOL, config);
  return filtered.map(item => fillTemplate(item.text, config));
}

export function getPersonalizedMiniCharts(config) {
  const filtered = filterByConfig(MINI_CHART_POOL, config);
  return filtered.map(item => ({
    ...item,
    title: fillTemplate(item.title, config),
  }));
}
