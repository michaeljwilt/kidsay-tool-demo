# Mobile Full-Screen Chat with Expandable Stats

## Problem

On mobile (<768px), the entire page scrolls vertically — header, chat, sidebar, and future work all stack in a single column. As messages accumulate, the chat input scrolls out of view, making the app unusable.

## Solution

Make the chat fill the mobile viewport with a pinned input. Collapse the sidebar stats into a compact tappable bar that expands as a modal overlay.

## Design

### Layout (mobile only, <768px)

1. **Compact header** — Single line: logo (smaller) + title + theme toggle. No subtitle.
2. **Tappable stats bar** — Horizontal row: `104 Quarters | 2,847 Products | 1.2M+ Responses`. Tap to expand. Chevron indicator.
3. **Chat area** — Fills remaining viewport height via `calc(100vh - header - statsbar)`. Internal scroll for messages. Input pinned at bottom with `flex-shrink: 0`.
4. **Stats overlay modal** — Slides up when stats bar is tapped. Contains: Quick Stats, Recent Insights, and Future Work sections. Close via X button or tap outside. Semi-transparent backdrop.

### What changes

- **`src/App.css`** — Add mobile viewport layout (`100vh`, `overflow: hidden` on body), stats bar styles, overlay/modal styles, compact header styles
- **`src/App.js`** — Add `statsOpen` state, `useMediaQuery` or `window.innerWidth` check, render compact stats bar + overlay on mobile, restructure mobile JSX so chat fills viewport

### What stays the same

- Desktop layout (grid with sidebar) — unchanged
- All chat functionality, responses, streaming, charts
- Dark/light mode theming
- Future work section (moves into overlay on mobile)

### Stats overlay content

The overlay reuses the existing sidebar content:
- Quick Stats card (Data Range, Total Quarters, Products Tracked, Total Responses)
- Recent Insights cards (Anomaly, Trending Up, New Pattern)
- Future Work accordion

### Interaction

- Tap stats bar → overlay slides up with backdrop
- Tap backdrop or X → overlay closes
- Chat input always visible and functional
- Starter questions render inside chat scroll area (existing behavior)

## Non-goals

- No tabs or navigation changes
- No new data or features
- Desktop layout stays exactly as-is
