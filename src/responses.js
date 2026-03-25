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
