# Hero Specification

## Overview
- **Target:** `Hero` in `src/app/page.tsx`
- **Screenshot:** `docs/design-references/original-desktop-viewport.png`
- **Interaction model:** time-driven entrance (stagger fade-up)

## Computed Styles (exact)
### H1
- fontSize: 56px, lineHeight: 61.6px (ratio 1.1), fontWeight: 300
- fontFamily: display serif (original uses "Reckless Condensed" TRIAL — substitute Instrument Serif)
- color: #ffffff; highlighted words: #d8fe91 (same font, no italic)
- max-width ~848px, centered

### Subcopy
- fontSize: 16px, lineHeight ~1.5, color rgba(204,204,204,1) / #cccccc, 2 lines centered

### Badge (above H1)
- pill, border rgba(255,255,255,0.16), bg rgba(255,255,255,0.08), fontSize 12px, color rgba(255,255,255,0.85)

### CTA row
- Primary: bg #d8fe91, radius 8px, padding 10px 20px, height 36px, dark text, fontSize 14px
- Secondary: bg rgba(255,255,255,0.05), radius 4px, padding 10px 20px, height 44px, white text
- gap: 12px

### Background
- Dark sky/cloud imagery blended to black at edges; page base #000
- Our substitute: own `/asset/bg-hero.png` + gradient overlays to black

## States & Behaviors
- Entrance: stagger children 0.12s, fade-up y:24→0, 0.7s ease [0.22,1,0.36,1]

## Responsive
- H1: 56px desktop → 44px/48.4px at ≤768px and 390px

## Content (original, capstone)
- Badge: "Prodi Informatika · Unismuh Makassar"
- H1: "Platform monitoring capstone / untuk mahasiswa, dosen, dan prodi." (lime on the 3 role words)
- CTAs: "Mulai gratis" / "Lihat demo"
