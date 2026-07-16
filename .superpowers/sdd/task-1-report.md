# Task 1 Report: CSS Restructure

## Files Created
- `css/base.css` — reset, :root variables, body, .sr-only, .hidden, tab-content, grid layouts (cards-grid, charts-row, energy-tdl-grid, config-grid), section containers, filter-bar, responsive breakpoints, prefers-reduced-motion
- `css/components.css` — navbar, cards (base + renamed variants), chart boxes, period filter, filter buttons, config panel, toggle switch, buttons (save/capture/ac), capture UI, section-title, :focus-visible

## Files Modified
- `css/style.css` — rewritten as two `@import` lines (`base.css` + `components.css`)

## Summary of Changes
1. **Reorganized** monolithic `style.css` (440 lines) into two modular files
2. **Renamed card classes** from presentational to semantic:
   - `.card-blue` → `.card-daya`
   - `.card-teal` → `.card-energi`
   - `.card-purple` → `.card-thi`
   - `.card-pink` → `.card-cop`
   - `.card-orange` → `.card-suhu`
   - `.card-lavender` → `.card-kelembaban`
   - `.card-green` → `.card-pir`
   - `.card-red` → `.card-ac`
3. **Removed** all `.grafik-grid` and `.chart-box-wide` rules (dead code for the removed Grafik tab; the first block lines 218–242 was overridden by lines 245–260 anyway)
4. **Added** new classes per spec: `.hidden`, `.section-title`, `:focus-visible` on interactive elements, responsive queries, `prefers-reduced-motion`
5. All visual values (colors, gradients, spacing, fonts, transitions) kept **exactly** as in the original `style.css`

## Concerns
1. **Card class naming vs. brief "Mapping aman":** The brief's "Mapping aman" section assigns `.card-orange` → `.card-kelembaban` and `.card-lavender` → `.card-suhu`, but the HTML (`index.html` lines 46–52) shows card-orange = "Suhu Ruangan" (temperature) and card-lavender = "Kelembaban Ruangan" (humidity). I used the **semantically correct** mapping matching the HTML labels. If the brief was intentionally different, revert card-suhu ↔ card-kelembaban.
2. **index.html not updated:** This task only touched CSS files. The HTML still uses old class names (`card-blue`, `card-teal`, etc.). A separate task must update `index.html` to use the renamed classes or the dashboard will lose card gradient styling.
3. **No tests:** Per project conventions, there are no automated tests to verify visual fidelity.
