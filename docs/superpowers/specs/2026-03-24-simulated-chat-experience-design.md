# Simulated Chat Experience — 25 Years of Kids Data

## Overview

Expand the KidSay Analytics AI demo chat from 4 hardcoded responses to ~35 responses across 6 categories, with scored multi-keyword matching and contextual follow-up suggestions. All data is simulated — zero API tokens used.

## Goals

- Let users explore 25 years of kids market research data through natural chat interaction
- Make the demo feel deep and discoverable via contextual follow-up suggestions
- Keep the architecture clean by separating data from UI

## Architecture

### File Structure

```
src/
  responses.js      — 35 response objects (data only)
  matchResponse.js  — scoring engine
  App.js            — UI (slimmed down, imports from above)
```

### Response Data Model

Each response is a structured object in `responses.js`:

```js
{
  id: 'lego-history',
  category: 'product',
  keywords: {
    'lego': 3,
    'history': 2,
    'over time': 2,
    'years': 1,
    'brand': 1
  },
  text: "LEGO has been a top-5 toy in our surveys for 23 of 25 years...",
  chart: {
    type: 'area',
    title: 'LEGO Popularity 2000-2025',
    dataKey: 'value',
    data: [...]
  },
  followUps: ['lego-regional', 'lego-gender', 'decade-toys']
}
```

- **keywords**: map of term → weight. Multi-word terms supported (e.g., `'over time'`).
- **followUps**: array of response IDs, rendered as suggestion buttons after streaming completes.
- **chart**: same structure as current, extended with `'area'` and `'stacked-bar'` types.
- **category**: one of `'time-travel'`, `'decade'`, `'product'`, `'regional'`, `'age'`, `'seasonal'`.

### Scoring Engine (`matchResponse.js`)

1. Normalize user input to lowercase.
2. For each response, sum the weights of all keywords found in the input.
3. If 3+ keywords match, multiply score by 1.5 (rewards specificity).
4. Return the highest-scoring response. Ties broken by declaration order in `responses.js` (first match wins). Return default if no response scores above 0.

Example:
```
Input: "how has lego changed for boys vs girls"

lego-history:    lego(3) + changed(1)                        = 4
lego-gender:     lego(3) + boys(2) + girls(2) + changed(1)   = 8 × 1.5 = 12  ← winner
gender-overall:  boys(2) + girls(2)                           = 4
```

Exported as a single function: `matchResponse(input) → response object`.

## Response Categories

### 1. Time-Travel Queries (7 responses)

| ID | Trigger Examples | Chart Type |
|----|-----------------|------------|
| `top-toys-2000s` | "What were kids into in the early 2000s?" | bar |
| `top-toys-2005` | "What was popular in 2005?" | bar |
| `top-toys-2010` | "Show me 2010 trends" | bar |
| `top-toys-2015` | "What about 2015?" | bar |
| `top-toys-2020` | "Pandemic era toys?" | bar |
| `snack-trends-2010s` | "Snack trends from 2010-2015" | line |
| `snack-trends-2020s` | "Recent snack trends" | line |

### 2. Decade Comparisons (5 responses)

| ID | Trigger Examples | Chart Type |
|----|-----------------|------------|
| `decade-toys` | "Compare toy trends across decades" | grouped-bar |
| `decade-snacks` | "How have snack preferences evolved?" | area |
| `decade-screen-time` | "Screen time impact on toy preferences" | area |
| `decade-brand-dominance` | "Which brands dominated each era?" | stacked bar |
| `decade-market-share` | "Market share shifts over 25 years" | stacked bar |

### 3. Product Deep-Dives (7 responses)

| ID | Trigger Examples | Chart Type |
|----|-----------------|------------|
| `lego-history` | "Tell me about LEGO's history" | area |
| `barbie-history` | "How has Barbie performed?" | area |
| `squishmallows-rise` | "When did Squishmallows appear?" | line |
| `hot-wheels-history` | "Hot Wheels over the years" | area |
| `nerf-history` | "Nerf popularity trends" | area |
| `healthy-snacks-deep` | "Deep dive on healthy snacks" | area |
| `candy-deep` | "What about candy trends?" | line |

### 4. Regional Breakdowns (4 responses)

| ID | Trigger Examples | Chart Type |
|----|-----------------|------------|
| `regional-toys` | "How do regions compare for toys?" | grouped-bar |
| `regional-snacks` | "Snack preferences by region" | grouped-bar |
| `lego-regional` | "LEGO performance by region" | grouped-bar |
| `west-coast-anomaly` | "What happened on the West Coast?" | line |

### 5. Age Group Analysis (4 responses)

| ID | Trigger Examples | Chart Type |
|----|-----------------|------------|
| `age-toys` | "What do different age groups like?" | grouped-bar |
| `age-snacks` | "Snack preferences by age" | grouped-bar |
| `age-screen-influence` | "How does screen time vary by age?" | stacked bar |
| `age-trends-over-time` | "Have age preferences shifted?" | area |

### 6. Seasonal / Holiday Patterns (4 responses)

| ID | Trigger Examples | Chart Type |
|----|-----------------|------------|
| `holiday-spike` | "What spikes during holidays?" | grouped-bar |
| `seasonal-toys` | "Seasonal toy patterns" | line |
| `back-to-school` | "Back to school trends" | bar |
| `q4-vs-rest` | "How big is the Q4 holiday effect?" | stacked bar |

### Migrated Existing Responses (4)

| ID | Original Key | Chart Type |
|----|-------------|------------|
| `top-toys-current` | `toys` | bar |
| `snack-trend-current` | `snacks` | line |
| `gender-current` | `gender` | grouped-bar |
| `quarter-comparison` | `quarter` | grouped-bar |

### Default Fallback (1)

When no response scores above 0, return a helpful message listing available topic areas with suggestion buttons for each category.

**Total: 35 responses + 1 default**

## Follow-Up Suggestions

### Design Rules

- Each response links to 2-3 follow-ups via `followUps` array.
- Always cross categories — never suggest something in the same category.
- Prioritize responses that share a topic (e.g., LEGO → LEGO regional, not generic regional).
- Every response is reachable within 2-3 hops from a starter question.

### Example Flow

```
User asks "What are the top toys this quarter?" (top-toys-current)
  → "How has LEGO changed over 25 years?" (lego-history)
  → "Compare toys across decades" (decade-toys)
  → "What spikes during holidays?" (holiday-spike)

User picks "How has LEGO changed over 25 years?" (lego-history)
  → "LEGO performance by region" (lego-regional)
  → "Compare boys vs girls for LEGO" (gender-current)
  → "When did Squishmallows first appear?" (squishmallows-rise)
```

### Initial Starter Questions (5)

Shown before any chat, spanning 5 of 6 categories:

1. "What are the top toys this quarter?" (time-travel/product)
2. "How have toy trends changed over 25 years?" (decade)
3. "Tell me about LEGO's history" (product)
4. "How do regions compare?" (regional)
5. "What spikes during the holidays?" (seasonal)

Age group is reachable one hop from any of these.

### UI Behavior

- Follow-up buttons render inside the assistant message bubble, below the chart, after streaming completes.
- Styled like current suggestion buttons but smaller and inline (single row).
- Clicking a follow-up calls the same `handleSend` flow with a pre-set input.
- Initial starter grid disappears after first message (current behavior preserved).

## New Chart Types

### Area Chart

For 25-year product histories and long-term trends. Uses Recharts `AreaChart` with gradient fill.

```js
chart: {
  type: 'area',
  title: 'LEGO Popularity 2000-2025',
  dataKey: 'value',
  data: [
    { name: '2000', value: 45 },
    { name: '2005', value: 52 },
    { name: '2025', value: 68 }
  ]
}
```

Import `AreaChart`, `Area`, and `defs`/`linearGradient` from Recharts. Gradient fill uses the teal accent (`#00D4BB`) fading to transparent.

### Stacked Bar

For composition breakdowns (market share, category splits).

```js
chart: {
  type: 'stacked-bar',
  title: 'Toy Market Share by Brand',
  bars: [
    { key: 'LEGO', color: '#00D4BB' },
    { key: 'Hot Wheels', color: '#60a5fa' },
    { key: 'Barbie', color: '#f472b6' },
    { key: 'Other', color: '#94a3b8' }
  ],
  data: [
    { name: '2000s', LEGO: 25, 'Hot Wheels': 22, Barbie: 30, Other: 23 },
    { name: '2010s', LEGO: 30, 'Hot Wheels': 20, Barbie: 22, Other: 28 },
    { name: '2020s', LEGO: 35, 'Hot Wheels': 18, Barbie: 18, Other: 29 }
  ]
}
```

Uses the same `BarChart` component with `stackId="stack"` on each `Bar`.

Both chart types use existing theme tokens and tooltip styles.

## Changes to App.js

- Remove `RESPONSES` object and `getResponse()` function.
- Import `matchResponse` from `./matchResponse` and `RESPONSES` from `./responses` (for follow-up lookup).
- Add `AreaChart`, `Area` imports from Recharts.
- Extend `ChartBlock` with two new branches: `area` and `stacked-bar`.
- Update `handleSend` to use `matchResponse(input)`.
- Add follow-up buttons inside assistant message bubbles (rendered after streaming completes, after chart).
- Update initial suggested questions to the new set of 5.
- Follow-up button click sets input and triggers send.

## What Does NOT Change

- Header, sidebar, dark/light mode toggle
- Future work section
- Streaming animation (character-by-character at 18ms)
- Overall layout, spacing, and styling
- Responsive behavior
- Deployment pipeline
