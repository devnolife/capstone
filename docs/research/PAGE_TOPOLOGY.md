# Page Topology — markopolo.ai (target reference)

> Extracted via Playwright (`getComputedStyle`) at 1440/768/390. Raw data: `extraction-raw.json`.
> Applied to: capstone landing (`src/app/page.tsx`) with original Indonesian content.

## Global layout
- **Entire page is DARK**: `body { background: rgb(0,0,0) }` — no light sections anywhere.
- Single scroll container, **Lenis smooth scroll active** (`.lenis` detected).
- Content column max ~1200px, generous vertical padding (~96–140px per section).
- Fixed overlay: header only. Everything else is flow content.

## Section order (top → bottom)
| # | Section | BG | Interaction model |
|---|---------|----|-------------------|
| 0 | Header nav (fixed) | transparent + `backdrop-filter: blur(8px)` | scroll-aware (stays subtle) |
| 1 | Hero: badge, H1 (2 lines), subcopy, 2 CTA | dark sky imagery over black | entrance animations |
| 2 | Logo marquee | transparent | time-driven (marquee loop) |
| 3 | Dashboard screenshot frame (dark analytics panel) | #0f0f0f panel | static image on original |
| 4 | Channel cards (5 columns) | black | hover lift |
| 5 | Journey/automation: heading + 3 features + chat timeline w/ times | black | scroll reveal |
| 6 | Platform CTA banner | black | static |
| 7 | Stats + testimonial carousel (big metrics: 43%, 67%, 2.4s) | panel cards rgba(13,13,13,.8) | time/click carousel |
| 8 | "Built for all sizes" integrations | rgba(13,13,13,0.8) | static |
| 9 | Value drivers + agent cards (agent-01/02/03) | black | scroll reveal |
| 10 | Final CTA ("Backed by insights…") | black | static |
| 11 | Footer columns + **giant wordmark** (huge logo text, dark olive, cropped at bottom) | black | hover on links |

## Design tokens (exact, from computed styles)
- **Lime accent:** `rgb(216, 254, 145)` → `#d8fe91` (80 occurrences)
- **Dark olive (text on lime / wordmark):** `rgb(60, 79, 24)` → `#3c4f18`
- **Black base:** `#000000`; panels: `#0f0f0f`, `#141414`, `rgba(13,13,13,0.8)`
- **Muted text:** `#cccccc` (104×), `rgba(204,204,204,0.6)`, `#a3a3a3`
- **White text:** `#ffffff` (224×)
- Borders on dark: `rgba(255,255,255,0.08)` / `0.1` / `0.16`

## Typography (exact)
- **Display:** "Reckless Condensed" weight 300 — H1 56px/61.6px (1.1) desktop; 44px/48.4px tablet & mobile.
  - ⚠ TRIAL-licensed commercial font — **substituted with Instrument Serif** in our build.
- **Body:** "Booton" (300/400/500/600) 14–16px — TRIAL-licensed — **substituted with Geist Sans**.
- Small labels: 12–13px.

## Buttons (exact)
- **Primary:** bg `#d8fe91`, radius `8px`, padding `10px 20px`, height 36px, dark text.
- **Secondary:** bg `rgba(255,255,255,0.05)`, radius `4px`, padding `10px 20px`, height 44px, white text.

## Header (exact)
- Height `64px`, padding `10px 40px`, `backdrop-filter: blur(8px)`, transparent bg, centered 3-zone grid (links | logo | auth).

## Responsive
- H1 56 → 44px at ≤768px. Channel cards 5-col → stack. Standard column stacking at mobile.
