# Dark Sections Specification (channels, journey, stats, value, CTA, footer)

## Overview
- **Targets:** `ChannelsSection`, `JourneySection`, `StatsSection`, `ValueSection`, `FinalCta`, `Footer` in `src/app/page.tsx`
- **Interaction model:** scroll-reveal (IntersectionObserver/whileInView once), hover on cards/links

## Global (exact)
- ALL sections on black `#000000` — no light/cream sections on the original.
- Panels/cards: `#0f0f0f` or `rgba(13,13,13,0.8)`; borders `rgba(255,255,255,0.08)`, hover `rgba(255,255,255,0.16)`
- Section headings: display serif, weight 300, 44px desktop (`Reckless Condensed M-TRIAL Light` 44px captured on H2), color #fff
- Body text: #cccccc; secondary muted: #a3a3a3; small mono labels 11–12px
- Section vertical padding ~96–140px

## Channel cards (5-up)
- Card: dark panel #0f0f0f, radius ~16px, border rgba(255,255,255,0.08)
- Icon chip: lime tint bg (rgba(216,254,145,0.15)), lime icon
- Hover: translateY(-4~6px), border brightens
- "See more" link row with arrow, lime on hover

## Journey timeline
- Left: heading + 3 features with lime left-border (2px #d8fe91), titles #fff 14px bold, body #cccccc 12px
- Right: dark card `#0f0f0f` with time-stamped rows (mono 10px times #a3a3a3), items on `#141414` inner cards
- Final status bar: lime bg #d8fe91 dark text OR dark bar w/ lime icon

## Stats + testimonial
- Metric cards: rgba(13,13,13,0.8), radius 16px, value 48px bold #fff with lime suffix, label 12px #a3a3a3
- Quote: display serif ~24px #fff, on panel card; author row with lime-tinted avatar chip

## Value drivers + role cards
- Dark equivalents: hover rows brighten bg rgba(255,255,255,0.04); role cards panel #0f0f0f with lime icon tile (#d8fe91 bg, dark icon OR dark tile lime icon)

## Final CTA
- Centered, black bg: eyebrow mono 11px #a3a3a3 → serif heading 44px #fff → buttons (same specs as hero) → footnote 12px #a3a3a3

## Footer
- Columns: heading 12px bold #fff uppercase; links 12px #cccccc hover #fff
- Bottom row: copyright 11px #a3a3a3
- **Giant wordmark:** huge display text (~20vw) at very bottom, color dark olive `#3c4f18` (low-contrast on black), cropped by overflow — signature markopolo detail. Ours: "capstone".

## Responsive
- 5-col cards → 2-col (768) → 1-col (390); 2-col grids stack at ≤1024
