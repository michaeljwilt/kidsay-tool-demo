# Mobile Full-Screen Chat — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make mobile chat fill the viewport with pinned input, sidebar collapsed into tappable stats bar with overlay modal.

**Architecture:** CSS-first approach — mobile media query handles viewport layout. One new state variable (`statsOpen`) controls the overlay. Existing sidebar JSX is conditionally rendered either inline (desktop) or inside the overlay (mobile).

**Tech Stack:** React (existing), CSS media queries, inline styles with theme tokens

---

### Task 1: Mobile viewport CSS — make chat fill screen

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Add mobile viewport styles**

In the `@media (max-width: 768px)` block, add:

```css
.mobile-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-header {
  flex-shrink: 0;
}

.mobile-stats-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  overflow-x: auto;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.mobile-chat-fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chat-panel {
  height: auto;
  flex: 1;
  min-height: 0;
}

.stats-overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.stats-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 75vh;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  z-index: 101;
  padding: 20px;
}

.stats-overlay-close {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
```

- [ ] **Step 2: Verify desktop is unaffected**

The new classes only apply inside the media query, so desktop layout remains unchanged. Verify by resizing browser.

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "feat: add mobile viewport CSS for full-screen chat layout"
```

---

### Task 2: Add mobile detection and statsOpen state to App.js

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Add state and mobile detection hook**

After the existing state declarations, add:

```js
const [statsOpen, setStatsOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

- [ ] **Step 2: Commit**

```bash
git add src/App.js
git commit -m "feat: add mobile detection and statsOpen state"
```

---

### Task 3: Restructure mobile layout in JSX

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Wrap outer div with mobile layout class**

Change the outer `outer-padding` div to conditionally add `mobile-layout` class:

```jsx
<div className={`outer-padding ${isMobile ? 'mobile-layout' : ''}`} style={...}>
```

- [ ] **Step 2: Compact header on mobile**

Wrap header content to conditionally hide subtitle and use smaller sizing on mobile:

```jsx
{!isMobile && <p style={...}>25 years of survey data...</p>}
```

Reduce logo size on mobile (36px instead of 48px), font size for title (20px instead of 26px).

- [ ] **Step 3: Add tappable stats bar (mobile only)**

After the header, render the stats bar:

```jsx
{isMobile && (
  <div className="mobile-stats-bar"
    onClick={() => setStatsOpen(true)}
    style={{ background: t.card, borderBottom: `1px solid ${t.inputBorder}` }}>
    <span style={{ color: t.textSub }}>📊 104 Quarters</span>
    <span style={{ color: t.textSub }}>🏷️ 2,847 Products</span>
    <span style={{ color: t.textSub }}>📋 1.2M+ Responses</span>
    <span style={{ marginLeft: 'auto', color: t.textSub, fontSize: '10px' }}>▼</span>
  </div>
)}
```

- [ ] **Step 4: Conditionally render sidebar**

On desktop, render the sidebar inline as before. On mobile, hide it (it goes in the overlay instead):

```jsx
{!isMobile && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {/* existing sidebar content */}
  </div>
)}
```

- [ ] **Step 5: Hide Future Work section on mobile (moves to overlay)**

```jsx
{!isMobile && (
  <div style={{ background: t.card, ... }}>
    {/* existing future work content */}
  </div>
)}
```

- [ ] **Step 6: Make chat panel fill remaining space on mobile**

On mobile, the main-grid should not be a grid — just render the chat panel directly. The `mobile-chat-fill` wrapper and CSS handle the flex fill.

- [ ] **Step 7: Commit**

```bash
git add src/App.js
git commit -m "feat: restructure mobile layout with compact header and stats bar"
```

---

### Task 4: Stats overlay modal

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Add overlay JSX**

After the main content, render the overlay (mobile only, when `statsOpen`):

```jsx
{isMobile && statsOpen && (
  <>
    <div className="stats-overlay-backdrop" onClick={() => setStatsOpen(false)} />
    <div className="stats-overlay" style={{ background: t.card }}>
      <div className="stats-overlay-close">
        <span style={{ fontSize: '16px', fontWeight: '700', color: t.text }}>Dashboard</span>
        <button onClick={() => setStatsOpen(false)}
          style={{ background: 'none', border: 'none', fontSize: '20px', color: t.textSub, cursor: 'pointer' }}>✕</button>
      </div>
      {/* Quick Stats card — same JSX as sidebar */}
      {/* Recent Insights cards — same JSX as sidebar */}
      {/* Future Work accordion — same JSX as below */}
    </div>
  </>
)}
```

- [ ] **Step 2: Extract sidebar content into reusable variables**

To avoid duplicating the sidebar JSX, extract Quick Stats and Recent Insights into variables that render in both the sidebar (desktop) and overlay (mobile):

```js
const quickStatsContent = (
  <div style={{ ... }}>
    <div style={{ fontSize: '13px', fontWeight: '700', ... }}>QUICK STATS</div>
    {/* existing stats rows */}
  </div>
);

const recentInsightsContent = (
  <div style={{ ... }}>
    <div style={{ fontSize: '13px', fontWeight: '700', ... }}>RECENT INSIGHTS</div>
    {/* existing insight cards */}
  </div>
);
```

Then use these in both sidebar and overlay.

- [ ] **Step 3: Commit**

```bash
git add src/App.js
git commit -m "feat: add stats overlay modal for mobile with reusable sidebar content"
```

---

### Task 5: Test and polish

**Files:**
- Modify: `src/App.js`, `src/App.css`

- [ ] **Step 1: Test mobile layout**

Open in browser, resize to mobile width. Verify:
- Chat fills viewport
- Input is always visible
- Stats bar is tappable
- Overlay opens with sidebar content
- Overlay closes on X or backdrop tap
- Messages scroll internally
- Charts render correctly in chat

- [ ] **Step 2: Test desktop layout**

Resize to desktop width. Verify:
- Grid layout with sidebar unchanged
- No stats bar visible
- No overlay elements
- Future work section visible below

- [ ] **Step 3: Fix any issues found**

- [ ] **Step 4: Commit**

```bash
git add src/App.js src/App.css
git commit -m "fix: polish mobile layout and verify desktop unchanged"
```
