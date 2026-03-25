# Simulated Chat Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the demo chat from 4 responses to ~35 across 6 categories with scored keyword matching, contextual follow-ups, and two new chart types.

**Architecture:** Extract response data into `responses.js`, scoring logic into `matchResponse.js`, and keep `App.js` focused on UI. Add area and stacked-bar chart types to `ChartBlock`.

**Tech Stack:** React 18, Recharts 2.10 (AreaChart, Area added), pure CSS-in-JS inline styles.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/responses.js` | Create | All 35 response objects + 1 default + lookup helper |
| `src/matchResponse.js` | Create | Scoring engine — single exported function |
| `src/App.js` | Modify | Remove old RESPONSES/getResponse, add imports, extend ChartBlock, add follow-ups UI |

---

### Task 1: Create the scoring engine (`matchResponse.js`)

**Files:**
- Create: `src/matchResponse.js`

- [ ] **Step 1: Create `matchResponse.js` with the scoring function**

```js
// src/matchResponse.js

export default function matchResponse(input, responses) {
  const q = input.toLowerCase();
  let bestScore = 0;
  let bestResponse = null;

  for (const response of responses) {
    let score = 0;
    let matchCount = 0;

    for (const [term, weight] of Object.entries(response.keywords)) {
      if (q.includes(term.toLowerCase())) {
        score += weight;
        matchCount++;
      }
    }

    // Bonus for multi-keyword matches (3+)
    if (matchCount >= 3) {
      score *= 1.5;
    }

    // First match wins ties (> not >=)
    if (score > bestScore) {
      bestScore = score;
      bestResponse = response;
    }
  }

  return bestResponse;
}
```

- [ ] **Step 2: Verify the file was created correctly**

Run: `node -e "const m = require('./src/matchResponse.js'); console.log(typeof m.default || typeof m)"`

This will error because of ESM — that's expected. Just verify the file exists and has no syntax errors:

Run: `node --check src/matchResponse.js || echo 'Note: ESM module, syntax check may not work with CJS. File will be validated when app runs.'`

- [ ] **Step 3: Commit**

```bash
git add src/matchResponse.js
git commit -m "feat: add scored keyword matching engine"
```

---

### Task 2: Create the responses data file — migrated responses + default

**Files:**
- Create: `src/responses.js`

Start with the 4 migrated existing responses and the default, to keep this task focused. New responses are added in Task 3.

- [ ] **Step 1: Create `responses.js` with migrated responses and helpers**

```js
// src/responses.js

export const RESPONSES = [
  // === Migrated Existing Responses ===
  {
    id: 'top-toys-current',
    category: 'time-travel',
    label: "What are the top toys this quarter?",
    keywords: {
      'toy': 2, 'popular': 2, 'top': 2, 'this quarter': 3, 'q4 2025': 3, 'current': 1
    },
    text: "Based on 25 years of data, here are the top toys for Q4 2025. LEGO leads with 68% popularity, up 12% from last quarter!",
    chart: {
      type: 'bar',
      title: 'Top Toys Q4 2025 — Popularity %',
      dataKey: 'value',
      data: [
        { name: 'LEGO', value: 68 },
        { name: 'Hot Wheels', value: 62 },
        { name: 'Squishmallows', value: 59 },
        { name: 'Barbie', value: 54 },
        { name: 'Nerf', value: 48 },
      ]
    },
    followUps: ['lego-history', 'decade-toys', 'holiday-spike']
  },
  {
    id: 'snack-trend-current',
    category: 'time-travel',
    label: "Show me healthy snack trends",
    keywords: {
      'snack': 3, 'food': 2, 'healthy': 2, 'trend': 1, 'eating': 1
    },
    text: "Healthy snacks are trending strongly with +15% YoY growth. Here's the popularity trend over the last 4 quarters:",
    chart: {
      type: 'line',
      title: 'Healthy Snack Popularity (% of respondents)',
      dataKey: 'value',
      data: [
        { name: 'Q1 2025', value: 41 },
        { name: 'Q2 2025', value: 45 },
        { name: 'Q3 2025', value: 49 },
        { name: 'Q4 2025', value: 56 },
      ]
    },
    followUps: ['healthy-snacks-deep', 'decade-snacks', 'age-snacks']
  },
  {
    id: 'gender-current',
    category: 'age',
    label: "Compare boys vs girls preferences",
    keywords: {
      'gender': 3, 'boy': 2, 'girl': 2, 'boys': 2, 'girls': 2, 'male': 1, 'female': 1
    },
    text: "The gender gap for LEGO has been narrowing significantly. Girls' interest has grown from 42% to 65% over three years, while boys' remained relatively stable.",
    chart: {
      type: 'grouped-bar',
      title: 'LEGO Popularity by Gender',
      bars: [
        { key: 'boys', color: '#60a5fa' },
        { key: 'girls', color: '#f472b6' },
      ],
      data: [
        { name: 'Q4 2022', boys: 78, girls: 42 },
        { name: 'Q4 2023', boys: 75, girls: 51 },
        { name: 'Q4 2024', boys: 72, girls: 59 },
        { name: 'Q4 2025', boys: 70, girls: 65 },
      ]
    },
    followUps: ['lego-history', 'age-toys', 'regional-toys']
  },
  {
    id: 'quarter-comparison',
    category: 'time-travel',
    label: "What changed from last quarter?",
    keywords: {
      'quarter': 3, 'changed': 2, 'last': 1, 'compare': 1, 'q3': 2, 'difference': 1
    },
    text: "Comparing Q3 vs Q4 2025 across top products — LEGO had the biggest jump (+12%), while Barbie and Nerf both dipped slightly.",
    chart: {
      type: 'grouped-bar',
      title: 'Q3 vs Q4 2025 Popularity %',
      bars: [
        { key: 'Q3 2025', color: '#94a3b8' },
        { key: 'Q4 2025', color: '#00D4BB' },
      ],
      data: [
        { name: 'LEGO', 'Q3 2025': 56, 'Q4 2025': 68 },
        { name: 'Hot Wheels', 'Q3 2025': 60, 'Q4 2025': 62 },
        { name: 'Squishmallows', 'Q3 2025': 55, 'Q4 2025': 59 },
        { name: 'Barbie', 'Q3 2025': 57, 'Q4 2025': 54 },
        { name: 'Nerf', 'Q3 2025': 52, 'Q4 2025': 48 },
      ]
    },
    followUps: ['seasonal-toys', 'decade-toys', 'regional-toys']
  },
];

// Default response when nothing matches
export const DEFAULT_RESPONSE = {
  id: 'default',
  text: "I can help you explore 25 years of kids' market research! Try asking about toy trends, snack preferences, regional differences, age groups, or seasonal patterns.",
  followUps: ['top-toys-current', 'lego-history', 'regional-toys', 'age-toys', 'holiday-spike']
};

// Lookup helper: find a response by ID
export function getResponseById(id) {
  return RESPONSES.find(r => r.id === id) || null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/responses.js
git commit -m "feat: add responses data file with migrated responses and default"
```

---

### Task 3: Add all new responses to `responses.js`

**Files:**
- Modify: `src/responses.js`

Add the remaining 31 responses. Insert them into the `RESPONSES` array before the closing `];`. Each response needs: id, category, **label** (short question-style text, max ~45 chars, used on follow-up buttons), keywords (with weights), text, chart config (with realistic simulated data), and followUps (2-3 IDs cross-category).

**Important:** Every response MUST include a `label` field. This is a short question like `"How has LEGO changed over 25 years?"` that appears on follow-up suggestion buttons. Add it right after `category` for consistency.

- [ ] **Step 1: Add time-travel responses (7 new)**

Insert these into the `RESPONSES` array after the migrated responses:

```js
  // === Time-Travel Queries ===
  {
    id: 'top-toys-2000s',
    category: 'time-travel',
    keywords: { '2000': 3, 'early': 1, '2001': 2, '2002': 2, '2003': 2, 'millennium': 2, 'turn of': 1 },
    text: "In the early 2000s, the toy landscape was dominated by action figures and licensed properties. Hot Wheels and Barbie were the undisputed leaders, with LEGO starting its comeback after near-bankruptcy in 2003.",
    chart: {
      type: 'bar',
      title: 'Top Toys Early 2000s — Popularity %',
      dataKey: 'value',
      data: [
        { name: 'Hot Wheels', value: 71 },
        { name: 'Barbie', value: 68 },
        { name: 'GI Joe', value: 55 },
        { name: 'LEGO', value: 42 },
        { name: 'Bratz', value: 38 },
      ]
    },
    followUps: ['decade-brand-dominance', 'barbie-history', 'hot-wheels-history']
  },
  {
    id: 'top-toys-2005',
    category: 'time-travel',
    keywords: { '2005': 3, '2006': 2, '2004': 2, 'mid 2000s': 2 },
    text: "By 2005, licensed toys were king — Star Wars Episode III drove action figure sales. Bratz challenged Barbie's dominance, and early video game toys (Webkinz) started appearing in our data.",
    chart: {
      type: 'bar',
      title: 'Top Toys 2005 — Popularity %',
      dataKey: 'value',
      data: [
        { name: 'Barbie', value: 62 },
        { name: 'Hot Wheels', value: 58 },
        { name: 'Bratz', value: 52 },
        { name: 'LEGO Star Wars', value: 49 },
        { name: 'Webkinz', value: 35 },
      ]
    },
    followUps: ['barbie-history', 'decade-toys', 'age-toys']
  },
  {
    id: 'top-toys-2010',
    category: 'time-travel',
    keywords: { '2010': 3, '2011': 2, '2009': 2, 'late 2000s': 1 },
    text: "2010 marked LEGO's resurgence — the LEGO Movie partnership was in early planning, and Ninjago launched. Skylanders pioneered toys-to-life, and Nerf expanded with the N-Strike Elite line.",
    chart: {
      type: 'bar',
      title: 'Top Toys 2010 — Popularity %',
      dataKey: 'value',
      data: [
        { name: 'LEGO', value: 58 },
        { name: 'Nerf', value: 54 },
        { name: 'Hot Wheels', value: 52 },
        { name: 'Barbie', value: 48 },
        { name: 'Skylanders', value: 41 },
      ]
    },
    followUps: ['lego-history', 'nerf-history', 'decade-screen-time']
  },
  {
    id: 'top-toys-2015',
    category: 'time-travel',
    keywords: { '2015': 3, '2016': 2, '2014': 2, 'mid 2010s': 2 },
    text: "2015 was peak licensed-toy era. Star Wars: The Force Awakens drove massive Q4 sales. Shopkins had an unexpected surge among 6-9 year olds, and Hatchimals created artificial scarcity buzz.",
    chart: {
      type: 'bar',
      title: 'Top Toys 2015 — Popularity %',
      dataKey: 'value',
      data: [
        { name: 'LEGO', value: 65 },
        { name: 'Star Wars Toys', value: 58 },
        { name: 'Nerf', value: 53 },
        { name: 'Shopkins', value: 47 },
        { name: 'Barbie', value: 44 },
      ]
    },
    followUps: ['decade-brand-dominance', 'seasonal-toys', 'age-toys']
  },
  {
    id: 'top-toys-2020',
    category: 'time-travel',
    keywords: { '2020': 3, 'pandemic': 3, 'covid': 2, '2021': 2, 'lockdown': 2 },
    text: "The pandemic reshaped toy preferences dramatically. Creative/building toys surged as kids stayed home. LEGO hit all-time highs, board games returned, and outdoor toys like Nerf saw a dip as indoor play dominated.",
    chart: {
      type: 'bar',
      title: 'Top Toys 2020 (Pandemic Year) — Popularity %',
      dataKey: 'value',
      data: [
        { name: 'LEGO', value: 74 },
        { name: 'Board Games', value: 61 },
        { name: 'Squishmallows', value: 48 },
        { name: 'Hot Wheels', value: 45 },
        { name: 'Nerf', value: 38 },
      ]
    },
    followUps: ['squishmallows-rise', 'lego-history', 'age-trends-over-time']
  },
  {
    id: 'snack-trends-2010s',
    category: 'time-travel',
    keywords: { 'snack': 2, '2010': 2, '2012': 2, '2013': 2, '2014': 2, '2015': 1, 'early 2010s': 2 },
    text: "Snack preferences in the early 2010s were still dominated by traditional choices. Goldfish crackers and fruit snacks led, but we started seeing the first signs of the healthy snack shift around 2013.",
    chart: {
      type: 'line',
      title: 'Snack Preference Shift 2010-2015 (% choosing healthy option)',
      dataKey: 'value',
      data: [
        { name: '2010', value: 18 },
        { name: '2011', value: 20 },
        { name: '2012', value: 22 },
        { name: '2013', value: 26 },
        { name: '2014', value: 29 },
        { name: '2015', value: 33 },
      ]
    },
    followUps: ['healthy-snacks-deep', 'decade-snacks', 'age-snacks']
  },
  {
    id: 'snack-trends-2020s',
    category: 'time-travel',
    keywords: { 'snack': 2, 'recent': 2, '2022': 2, '2023': 2, '2024': 2, 'latest': 1 },
    text: "Recent snack trends show an acceleration of health-conscious choices. Plant-based options went from novelty to mainstream, and kids are increasingly influenced by social media food trends (TikTok recipes).",
    chart: {
      type: 'line',
      title: 'Snack Trends 2020-2025 (% choosing healthy option)',
      dataKey: 'value',
      data: [
        { name: '2020', value: 38 },
        { name: '2021', value: 40 },
        { name: '2022', value: 44 },
        { name: '2023', value: 48 },
        { name: '2024', value: 52 },
        { name: '2025', value: 56 },
      ]
    },
    followUps: ['candy-deep', 'regional-snacks', 'age-snacks']
  },
```

- [ ] **Step 2: Add decade comparison responses (5 new)**

```js
  // === Decade Comparisons ===
  {
    id: 'decade-toys',
    category: 'decade',
    keywords: { 'decade': 3, 'compare': 2, 'across': 1, 'evolution': 2, '2000s vs': 2, 'over time': 2, '25 years': 2, 'changed': 1 },
    text: "Toy preferences have shifted dramatically across decades. The 2000s were about licensed action figures, the 2010s saw the rise of building toys and collectibles, and the 2020s are defined by nostalgia brands and social-media-driven crazes.",
    chart: {
      type: 'grouped-bar',
      title: 'Top Toy Category by Decade — Avg Popularity %',
      bars: [
        { key: '2000s', color: '#94a3b8' },
        { key: '2010s', color: '#60a5fa' },
        { key: '2020s', color: '#00D4BB' },
      ],
      data: [
        { name: 'Building', '2000s': 35, '2010s': 55, '2020s': 68 },
        { name: 'Action Figures', '2000s': 62, '2010s': 45, '2020s': 32 },
        { name: 'Dolls', '2000s': 58, '2010s': 44, '2020s': 48 },
        { name: 'Vehicles', '2000s': 55, '2010s': 52, '2020s': 50 },
        { name: 'Plush', '2000s': 28, '2010s': 35, '2020s': 59 },
      ]
    },
    followUps: ['decade-brand-dominance', 'top-toys-2020', 'seasonal-toys']
  },
  {
    id: 'decade-snacks',
    category: 'decade',
    keywords: { 'snack': 2, 'decade': 2, 'evolved': 2, 'snack history': 3, 'food decade': 2, 'eating changed': 2 },
    text: "Kids' snack preferences have undergone a massive transformation. The 2000s were peak junk food, the 2010s saw gradual health awareness, and the 2020s show health-conscious choices becoming the norm rather than the exception.",
    chart: {
      type: 'area',
      title: 'Healthy Snack Preference Over 25 Years (%)',
      dataKey: 'value',
      data: [
        { name: '2000', value: 12 },
        { name: '2005', value: 15 },
        { name: '2010', value: 18 },
        { name: '2015', value: 33 },
        { name: '2020', value: 38 },
        { name: '2025', value: 56 },
      ]
    },
    followUps: ['healthy-snacks-deep', 'age-snacks', 'regional-snacks']
  },
  {
    id: 'decade-screen-time',
    category: 'decade',
    keywords: { 'screen': 3, 'digital': 2, 'tablet': 2, 'phone': 1, 'technology': 2, 'tech': 1, 'video game': 2 },
    text: "Screen time has reshaped how kids interact with toys. Pre-2010, physical play dominated. The tablet era (2012+) shifted preferences toward toys with digital tie-ins, and by 2020, unboxing videos and influencer reviews directly drive purchase decisions.",
    chart: {
      type: 'area',
      title: 'Digital Influence on Toy Purchase Decisions (%)',
      dataKey: 'value',
      data: [
        { name: '2000', value: 8 },
        { name: '2005', value: 12 },
        { name: '2010', value: 22 },
        { name: '2015', value: 45 },
        { name: '2020', value: 67 },
        { name: '2025', value: 78 },
      ]
    },
    followUps: ['age-screen-influence', 'top-toys-2020', 'age-trends-over-time']
  },
  {
    id: 'decade-brand-dominance',
    category: 'decade',
    keywords: { 'brand': 3, 'dominat': 2, 'market leader': 2, 'who led': 2, 'biggest brand': 2 },
    text: "Brand dominance has shifted significantly. Barbie/Mattel ruled the 2000s, LEGO surged in the 2010s after its near-death experience, and the 2020s show a more fragmented market with plush/collectible brands gaining ground.",
    chart: {
      type: 'stacked-bar',
      title: 'Toy Market Share by Brand (%)',
      bars: [
        { key: 'LEGO', color: '#00D4BB' },
        { key: 'Barbie', color: '#f472b6' },
        { key: 'Hot Wheels', color: '#60a5fa' },
        { key: 'Nerf', color: '#fbbf24' },
        { key: 'Other', color: '#94a3b8' },
      ],
      data: [
        { name: '2000s', LEGO: 15, Barbie: 25, 'Hot Wheels': 20, Nerf: 10, Other: 30 },
        { name: '2010s', LEGO: 25, Barbie: 18, 'Hot Wheels': 17, Nerf: 12, Other: 28 },
        { name: '2020s', LEGO: 28, Barbie: 16, 'Hot Wheels': 14, Nerf: 10, Other: 32 },
      ]
    },
    followUps: ['lego-history', 'barbie-history', 'decade-market-share']
  },
  {
    id: 'decade-market-share',
    category: 'decade',
    keywords: { 'market share': 3, 'share': 2, 'market': 1, 'pie': 1, 'split': 1, 'distribution': 2 },
    text: "The toy market has become increasingly fragmented. In the 2000s, the top 3 brands held 60% of mindshare. By the 2020s, that dropped to 48% as niche brands and viral products captured attention through social media.",
    chart: {
      type: 'stacked-bar',
      title: 'Top 3 vs Rest — Market Mindshare %',
      bars: [
        { key: 'Top 3 Brands', color: '#00D4BB' },
        { key: 'Next 5', color: '#60a5fa' },
        { key: 'Long Tail', color: '#94a3b8' },
      ],
      data: [
        { name: '2000', 'Top 3 Brands': 60, 'Next 5': 25, 'Long Tail': 15 },
        { name: '2005', 'Top 3 Brands': 58, 'Next 5': 26, 'Long Tail': 16 },
        { name: '2010', 'Top 3 Brands': 55, 'Next 5': 27, 'Long Tail': 18 },
        { name: '2015', 'Top 3 Brands': 52, 'Next 5': 26, 'Long Tail': 22 },
        { name: '2020', 'Top 3 Brands': 50, 'Next 5': 24, 'Long Tail': 26 },
        { name: '2025', 'Top 3 Brands': 48, 'Next 5': 22, 'Long Tail': 30 },
      ]
    },
    followUps: ['decade-brand-dominance', 'squishmallows-rise', 'top-toys-current']
  },
```

- [ ] **Step 3: Add product deep-dive responses (7 new)**

```js
  // === Product Deep-Dives ===
  {
    id: 'lego-history',
    category: 'product',
    keywords: { 'lego': 3, 'history': 2, 'over time': 2, 'years': 1, 'brand': 1, 'story': 1 },
    text: "LEGO's 25-year journey in our data is remarkable. Near bankruptcy in 2003 (42% popularity), they pivoted to licensed sets and movies. By 2010 they were back on top, and they've held the #1 or #2 spot since 2015.",
    chart: {
      type: 'area',
      title: 'LEGO Popularity 2000-2025 (%)',
      dataKey: 'value',
      data: [
        { name: '2000', value: 45 },
        { name: '2003', value: 42 },
        { name: '2005', value: 49 },
        { name: '2008', value: 52 },
        { name: '2010', value: 58 },
        { name: '2013', value: 62 },
        { name: '2015', value: 65 },
        { name: '2018', value: 64 },
        { name: '2020', value: 74 },
        { name: '2023', value: 66 },
        { name: '2025', value: 68 },
      ]
    },
    followUps: ['lego-regional', 'gender-current', 'squishmallows-rise']
  },
  {
    id: 'barbie-history',
    category: 'product',
    keywords: { 'barbie': 3, 'mattel': 2, 'doll': 2, 'barbie history': 3 },
    text: "Barbie's story is one of reinvention. Dominant in the 2000s (68%), she faced the Bratz challenge, declined through the 2010s, then made a stunning comeback with the 2023 movie driving a 15% popularity spike.",
    chart: {
      type: 'area',
      title: 'Barbie Popularity 2000-2025 (%)',
      dataKey: 'value',
      data: [
        { name: '2000', value: 68 },
        { name: '2003', value: 60 },
        { name: '2005', value: 62 },
        { name: '2008', value: 50 },
        { name: '2010', value: 48 },
        { name: '2013', value: 42 },
        { name: '2015', value: 44 },
        { name: '2018', value: 46 },
        { name: '2020', value: 43 },
        { name: '2023', value: 58 },
        { name: '2025', value: 54 },
      ]
    },
    followUps: ['gender-current', 'decade-brand-dominance', 'top-toys-2005']
  },
  {
    id: 'squishmallows-rise',
    category: 'product',
    keywords: { 'squishmallow': 3, 'squish': 3, 'plush': 2, 'stuffed': 1, 'new brand': 2, 'rise': 1, 'appear': 2 },
    text: "Squishmallows are the breakout story of the 2020s. Launched in 2017 with barely a blip (8% awareness), they went viral on TikTok in 2020 and rocketed to 59% popularity by 2025 — the fastest growth we've ever tracked.",
    chart: {
      type: 'line',
      title: 'Squishmallows Awareness & Popularity (%)',
      dataKey: 'value',
      data: [
        { name: '2017', value: 8 },
        { name: '2018', value: 12 },
        { name: '2019', value: 18 },
        { name: '2020', value: 48 },
        { name: '2021', value: 52 },
        { name: '2022', value: 55 },
        { name: '2023', value: 57 },
        { name: '2024', value: 58 },
        { name: '2025', value: 59 },
      ]
    },
    followUps: ['decade-market-share', 'age-toys', 'regional-toys']
  },
  {
    id: 'hot-wheels-history',
    category: 'product',
    keywords: { 'hot wheels': 3, 'car': 2, 'vehicle': 2, 'hot wheels history': 3, 'matchbox': 1 },
    text: "Hot Wheels has been remarkably consistent over 25 years — always in the top 5, never #1. Their sweet spot is the 5-9 age range. The brand dipped slightly in the 2010s as digital play grew, but collector culture keeps them steady.",
    chart: {
      type: 'area',
      title: 'Hot Wheels Popularity 2000-2025 (%)',
      dataKey: 'value',
      data: [
        { name: '2000', value: 65 },
        { name: '2003', value: 63 },
        { name: '2005', value: 58 },
        { name: '2008', value: 55 },
        { name: '2010', value: 52 },
        { name: '2013', value: 50 },
        { name: '2015', value: 51 },
        { name: '2018', value: 54 },
        { name: '2020', value: 45 },
        { name: '2023', value: 60 },
        { name: '2025', value: 62 },
      ]
    },
    followUps: ['age-toys', 'decade-toys', 'regional-toys']
  },
  {
    id: 'nerf-history',
    category: 'product',
    keywords: { 'nerf': 3, 'blaster': 2, 'nerf gun': 3, 'nerf history': 3, 'outdoor': 1 },
    text: "Nerf's trajectory mirrors outdoor play trends. Strong in the 2000s-2010s, they peaked with the Elite line around 2015. The pandemic caused a sharp dip (indoor play dominated), but they've stabilized as outdoor activities returned.",
    chart: {
      type: 'area',
      title: 'Nerf Popularity 2000-2025 (%)',
      dataKey: 'value',
      data: [
        { name: '2000', value: 45 },
        { name: '2003', value: 48 },
        { name: '2005', value: 50 },
        { name: '2008', value: 52 },
        { name: '2010', value: 54 },
        { name: '2013', value: 56 },
        { name: '2015', value: 53 },
        { name: '2018', value: 50 },
        { name: '2020', value: 38 },
        { name: '2023', value: 46 },
        { name: '2025', value: 48 },
      ]
    },
    followUps: ['seasonal-toys', 'age-toys', 'top-toys-2015']
  },
  {
    id: 'healthy-snacks-deep',
    category: 'product',
    keywords: { 'healthy': 2, 'snack': 2, 'deep dive': 2, 'organic': 2, 'fruit': 1, 'vegetable': 1, 'health': 2 },
    text: "The healthy snack revolution started slowly. In 2000, only 12% of kids preferred healthy options. School nutrition programs (2010+) and parent awareness drove gradual adoption. The real inflection point was 2018 when 'healthy' stopped meaning 'boring' — brands like KIND Kids and Annie's made it cool.",
    chart: {
      type: 'area',
      title: 'Healthy Snack Preference — 25 Year Trend (%)',
      dataKey: 'value',
      data: [
        { name: '2000', value: 12 },
        { name: '2003', value: 13 },
        { name: '2005', value: 15 },
        { name: '2008', value: 17 },
        { name: '2010', value: 18 },
        { name: '2013', value: 26 },
        { name: '2015', value: 33 },
        { name: '2018', value: 38 },
        { name: '2020', value: 38 },
        { name: '2023', value: 50 },
        { name: '2025', value: 56 },
      ]
    },
    followUps: ['candy-deep', 'age-snacks', 'regional-snacks']
  },
  {
    id: 'candy-deep',
    category: 'product',
    keywords: { 'candy': 3, 'chocolate': 2, 'sugar': 2, 'sweet': 2, 'gummy': 2, 'junk food': 2 },
    text: "Candy hasn't disappeared — it's evolved. Traditional chocolate bars declined 20% over 25 years, but sour candy and gummy variants actually grew. Kids still love sweets; they just prefer 'fun' formats over classic chocolate bars.",
    chart: {
      type: 'line',
      title: 'Candy Format Preferences Over Time (%)',
      dataKey: 'value',
      data: [
        { name: '2000', value: 72 },
        { name: '2005', value: 68 },
        { name: '2010', value: 62 },
        { name: '2015', value: 55 },
        { name: '2020', value: 50 },
        { name: '2025', value: 48 },
      ]
    },
    followUps: ['healthy-snacks-deep', 'decade-snacks', 'age-snacks']
  },
```

- [ ] **Step 4: Add regional breakdown responses (4 new)**

```js
  // === Regional Breakdowns ===
  {
    id: 'regional-toys',
    category: 'regional',
    keywords: { 'region': 3, 'coast': 2, 'geographic': 2, 'state': 1, 'area': 1, 'where': 1, 'location': 1 },
    text: "Toy preferences vary significantly by region. The West Coast trends toward creative/building toys, the Southeast favors outdoor play (Nerf dominates), and the Northeast shows strongest preference for educational brands.",
    chart: {
      type: 'grouped-bar',
      title: 'Top Toy Preference by Region — Q4 2025 (%)',
      bars: [
        { key: 'West', color: '#00D4BB' },
        { key: 'Southeast', color: '#f472b6' },
        { key: 'Northeast', color: '#60a5fa' },
        { key: 'Midwest', color: '#fbbf24' },
      ],
      data: [
        { name: 'LEGO', West: 72, Southeast: 60, Northeast: 70, Midwest: 65 },
        { name: 'Nerf', West: 42, Southeast: 62, Northeast: 45, Midwest: 55 },
        { name: 'Squishmallows', West: 65, Southeast: 55, Northeast: 58, Midwest: 52 },
      ]
    },
    followUps: ['west-coast-anomaly', 'lego-regional', 'age-toys']
  },
  {
    id: 'regional-snacks',
    category: 'regional',
    keywords: { 'region': 2, 'snack': 2, 'snack region': 3, 'coast snack': 2, 'food region': 2 },
    text: "Snack preferences show strong regional patterns. West Coast kids lead in healthy snack adoption (68%), while the Southeast still favors traditional snacks. The gap has been narrowing over the last 5 years though.",
    chart: {
      type: 'grouped-bar',
      title: 'Healthy Snack Preference by Region (%)',
      bars: [
        { key: 'West', color: '#00D4BB' },
        { key: 'Southeast', color: '#f472b6' },
        { key: 'Northeast', color: '#60a5fa' },
        { key: 'Midwest', color: '#fbbf24' },
      ],
      data: [
        { name: '2015', West: 42, Southeast: 22, Northeast: 35, Midwest: 28 },
        { name: '2020', West: 52, Southeast: 30, Northeast: 42, Midwest: 35 },
        { name: '2025', West: 68, Southeast: 45, Northeast: 58, Midwest: 50 },
      ]
    },
    followUps: ['healthy-snacks-deep', 'west-coast-anomaly', 'decade-snacks']
  },
  {
    id: 'lego-regional',
    category: 'regional',
    keywords: { 'lego': 2, 'region': 2, 'lego region': 3, 'lego coast': 3, 'lego area': 2 },
    text: "LEGO's regional performance reveals an interesting story. The West Coast has historically been their strongest market, which makes the recent 35% drop there particularly alarming. Northeast and Midwest remain stable.",
    chart: {
      type: 'grouped-bar',
      title: 'LEGO Popularity by Region (%)',
      bars: [
        { key: '2023', color: '#94a3b8' },
        { key: '2024', color: '#60a5fa' },
        { key: '2025', color: '#00D4BB' },
      ],
      data: [
        { name: 'West', '2023': 75, '2024': 70, '2025': 48 },
        { name: 'Northeast', '2023': 68, '2024': 69, '2025': 70 },
        { name: 'Southeast', '2023': 60, '2024': 61, '2025': 62 },
        { name: 'Midwest', '2023': 64, '2024': 65, '2025': 66 },
      ]
    },
    followUps: ['west-coast-anomaly', 'lego-history', 'gender-current']
  },
  {
    id: 'west-coast-anomaly',
    category: 'regional',
    keywords: { 'west coast': 3, 'anomaly': 3, 'drop': 2, 'decline': 2, 'west': 2, 'california': 2, 'unusual': 1 },
    text: "The West Coast LEGO anomaly is our most-discussed finding. A 35% drop in Q4 2025 in a historically strong market. Our analysis points to a new local competitor (BuildBlox) that launched aggressively in California and Oregon with influencer partnerships.",
    chart: {
      type: 'line',
      title: 'LEGO West Coast Popularity — Quarterly Trend (%)',
      dataKey: 'value',
      data: [
        { name: 'Q1 2024', value: 72 },
        { name: 'Q2 2024', value: 70 },
        { name: 'Q3 2024', value: 68 },
        { name: 'Q4 2024', value: 65 },
        { name: 'Q1 2025', value: 58 },
        { name: 'Q2 2025', value: 52 },
        { name: 'Q3 2025', value: 50 },
        { name: 'Q4 2025', value: 48 },
      ]
    },
    followUps: ['lego-regional', 'lego-history', 'decade-market-share']
  },
```

- [ ] **Step 5: Add age group responses (4 new)**

```js
  // === Age Group Analysis ===
  {
    id: 'age-toys',
    category: 'age',
    keywords: { 'age': 3, 'age group': 3, 'old': 1, 'young': 1, 'year old': 2, 'kids age': 2 },
    text: "Age dramatically shapes toy preferences. 4-6 year olds gravitate toward plush and imaginative play, 7-9 year olds prefer building and action, and 10-12 year olds increasingly favor tech-connected toys and collectibles.",
    chart: {
      type: 'grouped-bar',
      title: 'Top Toy Preference by Age Group — Q4 2025 (%)',
      bars: [
        { key: '4-6 yrs', color: '#f472b6' },
        { key: '7-9 yrs', color: '#60a5fa' },
        { key: '10-12 yrs', color: '#00D4BB' },
      ],
      data: [
        { name: 'LEGO', '4-6 yrs': 45, '7-9 yrs': 72, '10-12 yrs': 65 },
        { name: 'Squishmallows', '4-6 yrs': 70, '7-9 yrs': 58, '10-12 yrs': 42 },
        { name: 'Nerf', '4-6 yrs': 25, '7-9 yrs': 55, '10-12 yrs': 60 },
        { name: 'Hot Wheels', '4-6 yrs': 55, '7-9 yrs': 68, '10-12 yrs': 50 },
      ]
    },
    followUps: ['age-trends-over-time', 'gender-current', 'seasonal-toys']
  },
  {
    id: 'age-snacks',
    category: 'age',
    keywords: { 'age': 2, 'snack': 2, 'snack age': 3, 'kids eat': 2, 'food age': 2 },
    text: "Snack preferences by age tell a surprising story. Younger kids (4-6) actually show higher healthy snack preference than tweens (10-12) — likely driven by parental control. The 10-12 group, with more autonomy, gravitates toward candy and chips.",
    chart: {
      type: 'grouped-bar',
      title: 'Healthy Snack Preference by Age Group (%)',
      bars: [
        { key: '4-6 yrs', color: '#f472b6' },
        { key: '7-9 yrs', color: '#60a5fa' },
        { key: '10-12 yrs', color: '#00D4BB' },
      ],
      data: [
        { name: '2015', '4-6 yrs': 40, '7-9 yrs': 32, '10-12 yrs': 25 },
        { name: '2020', '4-6 yrs': 48, '7-9 yrs': 38, '10-12 yrs': 30 },
        { name: '2025', '4-6 yrs': 65, '7-9 yrs': 55, '10-12 yrs': 42 },
      ]
    },
    followUps: ['healthy-snacks-deep', 'regional-snacks', 'age-trends-over-time']
  },
  {
    id: 'age-screen-influence',
    category: 'age',
    keywords: { 'screen': 2, 'age': 2, 'screen age': 3, 'screen time age': 3, 'digital age': 2, 'influence': 1 },
    text: "Screen influence on toy purchasing varies dramatically by age. 10-12 year olds are most influenced by YouTube/TikTok (82%), while 4-6 year olds are still primarily influenced by in-store displays and parent choices.",
    chart: {
      type: 'stacked-bar',
      title: 'Purchase Influence by Age Group (%)',
      bars: [
        { key: 'Social Media', color: '#00D4BB' },
        { key: 'TV Ads', color: '#60a5fa' },
        { key: 'In-Store', color: '#f472b6' },
        { key: 'Parent/Friend', color: '#94a3b8' },
      ],
      data: [
        { name: '4-6 yrs', 'Social Media': 15, 'TV Ads': 25, 'In-Store': 35, 'Parent/Friend': 25 },
        { name: '7-9 yrs', 'Social Media': 45, 'TV Ads': 20, 'In-Store': 20, 'Parent/Friend': 15 },
        { name: '10-12 yrs', 'Social Media': 62, 'TV Ads': 12, 'In-Store': 12, 'Parent/Friend': 14 },
      ]
    },
    followUps: ['decade-screen-time', 'age-toys', 'top-toys-2020']
  },
  {
    id: 'age-trends-over-time',
    category: 'age',
    keywords: { 'age shift': 3, 'age change': 2, 'age trend': 3, 'growing up': 2, 'age preference': 2, 'getting older': 1 },
    text: "The 'age compression' trend is real — kids are aging out of traditional toys earlier. In 2000, the average age of toy engagement was 10. By 2025, it's dropped to 8. Tweens now prefer electronics, gaming, and social media over physical toys.",
    chart: {
      type: 'area',
      title: 'Average Age of Active Toy Engagement',
      dataKey: 'value',
      data: [
        { name: '2000', value: 10.2 },
        { name: '2005', value: 9.8 },
        { name: '2010', value: 9.4 },
        { name: '2015', value: 9.0 },
        { name: '2020', value: 8.5 },
        { name: '2025', value: 8.1 },
      ]
    },
    followUps: ['decade-screen-time', 'age-screen-influence', 'decade-toys']
  },
```

- [ ] **Step 6: Add seasonal/holiday responses (4 new)**

```js
  // === Seasonal / Holiday Patterns ===
  {
    id: 'holiday-spike',
    category: 'seasonal',
    keywords: { 'holiday': 3, 'christmas': 3, 'spike': 2, 'season': 1, 'gift': 2, 'december': 2, 'black friday': 2 },
    text: "The holiday spike is massive and consistent. Q4 accounts for 45% of annual toy interest, and it's grown from 38% in 2000 as holiday marketing starts earlier each year. LEGO and collectibles see the biggest Q4 lifts.",
    chart: {
      type: 'grouped-bar',
      title: 'Q4 Holiday Spike — Popularity Lift vs Q3 (%)',
      bars: [
        { key: '2015', color: '#94a3b8' },
        { key: '2020', color: '#60a5fa' },
        { key: '2025', color: '#00D4BB' },
      ],
      data: [
        { name: 'LEGO', '2015': 18, '2020': 25, '2025': 22 },
        { name: 'Barbie', '2015': 12, '2020': 8, '2025': 10 },
        { name: 'Nerf', '2015': 15, '2020': 5, '2025': 12 },
        { name: 'Squishmallows', '2015': 0, '2020': 20, '2025': 15 },
      ]
    },
    followUps: ['q4-vs-rest', 'seasonal-toys', 'top-toys-current']
  },
  {
    id: 'seasonal-toys',
    category: 'seasonal',
    keywords: { 'seasonal': 3, 'pattern': 2, 'cycle': 2, 'quarterly': 2, 'spring': 1, 'summer': 1, 'winter': 1 },
    text: "Toy preferences follow clear seasonal patterns. Outdoor toys (Nerf, bikes) peak in Q2-Q3. Building/creative toys peak in Q4 (holiday gifts) and Q1 (indoor winter play). Collectibles are remarkably steady year-round.",
    chart: {
      type: 'line',
      title: '2025 Quarterly Popularity Patterns (%)',
      dataKey: 'value',
      data: [
        { name: 'Q1', value: 58 },
        { name: 'Q2', value: 52 },
        { name: 'Q3', value: 55 },
        { name: 'Q4', value: 68 },
      ]
    },
    followUps: ['holiday-spike', 'back-to-school', 'quarter-comparison']
  },
  {
    id: 'back-to-school',
    category: 'seasonal',
    keywords: { 'back to school': 3, 'school': 2, 'september': 2, 'fall': 1, 'august': 1, 'q3': 1 },
    text: "Back-to-school season (Aug-Sep) creates a unique shift. Educational toys and STEM kits spike 30%, while pure-play toys dip. Interestingly, snack preferences also shift — lunchbox-friendly items surge as parents prep for the school year.",
    chart: {
      type: 'bar',
      title: 'Back-to-School Category Spikes — Aug/Sep vs July (%)',
      dataKey: 'value',
      data: [
        { name: 'STEM Kits', value: 35 },
        { name: 'Art Supplies', value: 28 },
        { name: 'Educational', value: 30 },
        { name: 'Lunchbox Snacks', value: 42 },
        { name: 'Action Toys', value: -8 },
      ]
    },
    followUps: ['age-toys', 'healthy-snacks-deep', 'seasonal-toys']
  },
  {
    id: 'q4-vs-rest',
    category: 'seasonal',
    keywords: { 'q4 effect': 3, 'holiday effect': 2, 'q4 vs': 2, 'q4 big': 2, 'how big': 1 },
    text: "The Q4 effect has been growing over 25 years. In 2000, Q4 represented 38% of annual toy mindshare. By 2025, it's 45% — driven by earlier holiday marketing, Black Friday culture, and social media gift guides amplifying seasonal demand.",
    chart: {
      type: 'stacked-bar',
      title: 'Annual Toy Mindshare by Quarter (%)',
      bars: [
        { key: 'Q1', color: '#94a3b8' },
        { key: 'Q2', color: '#60a5fa' },
        { key: 'Q3', color: '#f472b6' },
        { key: 'Q4', color: '#00D4BB' },
      ],
      data: [
        { name: '2000', Q1: 22, Q2: 20, Q3: 20, Q4: 38 },
        { name: '2005', Q1: 21, Q2: 19, Q3: 20, Q4: 40 },
        { name: '2010', Q1: 20, Q2: 19, Q3: 19, Q4: 42 },
        { name: '2015', Q1: 19, Q2: 18, Q3: 19, Q4: 44 },
        { name: '2020', Q1: 20, Q2: 18, Q3: 18, Q4: 44 },
        { name: '2025', Q1: 19, Q2: 18, Q3: 18, Q4: 45 },
      ]
    },
    followUps: ['holiday-spike', 'decade-toys', 'back-to-school']
  },
```

- [ ] **Step 7: Verify all response IDs referenced in followUps exist**

Manually check: every ID in a `followUps` array must match an `id` field in another response or in `DEFAULT_RESPONSE.followUps`. List of all IDs that should exist:

`top-toys-current`, `snack-trend-current`, `gender-current`, `quarter-comparison`, `top-toys-2000s`, `top-toys-2005`, `top-toys-2010`, `top-toys-2015`, `top-toys-2020`, `snack-trends-2010s`, `snack-trends-2020s`, `decade-toys`, `decade-snacks`, `decade-screen-time`, `decade-brand-dominance`, `decade-market-share`, `lego-history`, `barbie-history`, `squishmallows-rise`, `hot-wheels-history`, `nerf-history`, `healthy-snacks-deep`, `candy-deep`, `regional-toys`, `regional-snacks`, `lego-regional`, `west-coast-anomaly`, `age-toys`, `age-snacks`, `age-screen-influence`, `age-trends-over-time`, `holiday-spike`, `seasonal-toys`, `back-to-school`, `q4-vs-rest`

- [ ] **Step 8: Commit**

```bash
git add src/responses.js
git commit -m "feat: add 31 new responses across 6 categories with chart data and follow-ups"
```

---

### Task 4: Extend ChartBlock with area and stacked-bar chart types

**Files:**
- Modify: `src/App.js:1-6` (imports)
- Modify: `src/App.js:87-139` (ChartBlock component)

- [ ] **Step 1: Add AreaChart import to App.js**

Update the Recharts import at the top of `src/App.js` (line 3-6):

```js
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
  AreaChart, Area
} from 'recharts';
```

- [ ] **Step 2: Add area chart branch to ChartBlock**

In the `ChartBlock` component, after the `line` branch (after line 124), add the area chart branch. The full return becomes a chain: `bar` → `line` → `area` → `stacked-bar` → `grouped-bar` (default).

Replace the entire `ResponsiveContainer` section in `ChartBlock` with:

```jsx
<ResponsiveContainer width="100%" height={180}>
  {chart.type === 'bar' ? (
    <BarChart data={chart.data} margin={margin}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
      <XAxis dataKey="name" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={tooltipStyle} />
      <Bar dataKey={chart.dataKey} fill="#00D4BB" radius={[4, 4, 0, 0]} />
    </BarChart>
  ) : chart.type === 'line' ? (
    <LineChart data={chart.data} margin={margin}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
      <XAxis dataKey="name" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={tooltipStyle} />
      <Line type="monotone" dataKey={chart.dataKey} stroke="#00D4BB" strokeWidth={2} dot={{ fill: '#00D4BB', r: 4 }} />
    </LineChart>
  ) : chart.type === 'area' ? (
    <AreaChart data={chart.data} margin={margin}>
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#00D4BB" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#00D4BB" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
      <XAxis dataKey="name" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={tooltipStyle} />
      <Area type="monotone" dataKey={chart.dataKey} stroke="#00D4BB" strokeWidth={2} fill="url(#areaGradient)" dot={{ fill: '#00D4BB', r: 4 }} />
    </AreaChart>
  ) : chart.type === 'stacked-bar' ? (
    <BarChart data={chart.data} margin={margin}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
      <XAxis dataKey="name" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: '11px', color: textColor }} />
      {chart.bars.map(b => (
        <Bar key={b.key} dataKey={b.key} fill={b.color} stackId="stack" radius={[0, 0, 0, 0]} />
      ))}
    </BarChart>
  ) : (
    <BarChart data={chart.data} margin={margin}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
      <XAxis dataKey="name" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: '11px', color: textColor }} />
      {chart.bars.map(b => (
        <Bar key={b.key} dataKey={b.key} fill={b.color} radius={[4, 4, 0, 0]} />
      ))}
    </BarChart>
  )}
</ResponsiveContainer>
```

- [ ] **Step 3: Verify the app compiles**

Run: `cd "/Users/michaelwilt/Documents/1 Projects/kidsay-tool-demo" && npx react-scripts build 2>&1 | tail -5`

Expected: Build succeeds (warnings about unused imports are OK at this point since we haven't wired up responses.js yet).

- [ ] **Step 4: Commit**

```bash
git add src/App.js
git commit -m "feat: add area chart and stacked-bar chart types to ChartBlock"
```

---

### Task 5: Wire up App.js — replace old responses with new system

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Remove old RESPONSES and getResponse from App.js**

Delete lines 8-85 (the `RESPONSES` object and `getResponse` function).

- [ ] **Step 2: Add imports for new modules**

After the Recharts import, add:

```js
import { RESPONSES, DEFAULT_RESPONSE, getResponseById } from './responses';
import matchResponse from './matchResponse';
```

- [ ] **Step 3: Update handleSend to use the scoring engine**

Replace the `handleSend` function with:

```js
const handleSend = (text) => {
  const msgText = text || input;
  if (!msgText.trim() || streamingIndex !== null) return;
  const response = matchResponse(msgText, RESPONSES) || DEFAULT_RESPONSE;
  const userMsg = { role: 'user', text: msgText, displayText: msgText, streaming: false };
  const assistantMsg = { role: 'assistant', text: response.text, chart: response.chart, followUps: response.followUps, displayText: '', streaming: true };
  setMessages(prev => {
    const updated = [...prev, userMsg, assistantMsg];
    setStreamingIndex(updated.length - 1);
    setStreamingPos(0);
    return updated;
  });
  setInput('');
};
```

Note: `handleSend` now accepts an optional `text` parameter for follow-up button clicks.

- [ ] **Step 4: Update initial suggested questions**

Replace the current 4 suggested questions (around line 304) with the new 5:

```js
{[
  'What are the top toys this quarter?',
  'How have toy trends changed over 25 years?',
  "Tell me about LEGO's history",
  'How do regions compare?',
  'What spikes during the holidays?'
].map((question, i) => (
  <button
    key={i}
    onClick={() => { setInput(question); setTimeout(() => handleSend(question), 0); }}
    style={{ padding: '10px 14px', background: t.suggestBg, border: `1px solid ${t.suggestBorder}`, borderRadius: '10px', fontSize: '12px', cursor: 'pointer', textAlign: 'left', color: t.suggestText, transition: tr }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#00E5CC'}
    onMouseLeave={e => e.currentTarget.style.borderColor = t.suggestBorder}
  >
    {question}
  </button>
))}
```

Note: suggestion buttons now trigger `handleSend` directly instead of just setting input.

- [ ] **Step 5: Add follow-up suggestion buttons inside assistant messages**

In the message rendering section (inside the `messages.map`), after the `ChartBlock` render and before the closing `</div>` of the message bubble, add:

```jsx
{!msg.streaming && msg.followUps && msg.followUps.length > 0 && (
  <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
    {msg.followUps.map(id => {
      const followUp = getResponseById(id);
      if (!followUp) return null;
      // Derive a short label from the response text (first sentence, max 50 chars)
      const label = followUp.text.split('.')[0].slice(0, 50) + (followUp.text.split('.')[0].length > 50 ? '...' : '');
      return (
        <button
          key={id}
          onClick={() => handleSend(label)}
          style={{
            padding: '6px 12px',
            background: darkMode ? 'rgba(0,212,187,0.1)' : 'rgba(0,212,187,0.08)',
            border: `1px solid ${darkMode ? 'rgba(0,212,187,0.3)' : 'rgba(0,212,187,0.2)'}`,
            borderRadius: '8px',
            fontSize: '11px',
            cursor: 'pointer',
            color: '#00D4BB',
            transition: tr
          }}
          onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(0,212,187,0.2)' : 'rgba(0,212,187,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = darkMode ? 'rgba(0,212,187,0.1)' : 'rgba(0,212,187,0.08)'}
        >
          {label}
        </button>
      );
    })}
  </div>
)}
```

Wait — using the first sentence of the response text as a button label will be confusing. Follow-up buttons should show a **question** the user might ask, not the answer. Let's store a `followUpLabel` on each response or derive better labels.

Better approach: The `label` field was already added to each response in Tasks 2-3. Follow-up buttons should bypass the scorer and look up the target response directly by ID to avoid fragile keyword re-matching.

Update the follow-up rendering to use direct ID lookup:

```jsx
{!msg.streaming && msg.followUps && msg.followUps.length > 0 && (
  <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
    {msg.followUps.map(id => {
      const followUp = getResponseById(id);
      if (!followUp) return null;
      return (
        <button
          key={id}
          onClick={() => handleFollowUp(followUp)}
          style={{
            padding: '6px 12px',
            background: darkMode ? 'rgba(0,212,187,0.1)' : 'rgba(0,212,187,0.08)',
            border: `1px solid ${darkMode ? 'rgba(0,212,187,0.3)' : 'rgba(0,212,187,0.2)'}`,
            borderRadius: '8px',
            fontSize: '11px',
            cursor: 'pointer',
            color: '#00D4BB',
            transition: tr
          }}
          onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(0,212,187,0.2)' : 'rgba(0,212,187,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = darkMode ? 'rgba(0,212,187,0.1)' : 'rgba(0,212,187,0.08)'}
        >
          {followUp.label}
        </button>
      );
    })}
  </div>
)}
```

Also add a `handleFollowUp` function that bypasses the scorer:

```js
const handleFollowUp = (response) => {
  if (streamingIndex !== null) return;
  const userMsg = { role: 'user', text: response.label, displayText: response.label, streaming: false };
  const assistantMsg = { role: 'assistant', text: response.text, chart: response.chart, followUps: response.followUps, displayText: '', streaming: true };
  setMessages(prev => {
    const updated = [...prev, userMsg, assistantMsg];
    setStreamingIndex(updated.length - 1);
    setStreamingPos(0);
    return updated;
  });
};
```

- [ ] **Step 6: Verify the app compiles and runs**

Run: `cd "/Users/michaelwilt/Documents/1 Projects/kidsay-tool-demo" && npx react-scripts build 2>&1 | tail -10`

Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.js src/responses.js
git commit -m "feat: wire up scoring engine, follow-up suggestions, and new starter questions"
```

---

### Task 6: Manual smoke test and polish

**Files:**
- Possibly modify: `src/App.js`, `src/responses.js`

- [ ] **Step 1: Start dev server**

Run: `cd "/Users/michaelwilt/Documents/1 Projects/kidsay-tool-demo" && npm start`

- [ ] **Step 2: Test each category**

Open http://localhost:3000 and verify:

1. Initial 5 suggested questions appear
2. Click "What are the top toys this quarter?" — response streams, chart renders, follow-up buttons appear
3. Click a follow-up button — new response loads correctly
4. Type "What were the top toys in 2005?" — time-travel response appears with bar chart
5. Type "Tell me about LEGO" — product deep-dive with area chart
6. Type "How do regions compare?" — regional grouped-bar chart
7. Type "Snack preferences by age" — age group grouped-bar chart
8. Type "What about the holiday effect?" — seasonal stacked-bar chart
9. Type something random (e.g., "hello") — default response with follow-up suggestions
10. Toggle dark/light mode — all charts respect theme
11. Check mobile responsive (resize browser to ~375px width)

- [ ] **Step 3: Fix any issues found during testing**

Address any rendering bugs, scoring mismatches, or missing follow-up links.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "polish: fix issues found during smoke testing"
```

(Only if changes were needed.)
