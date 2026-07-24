# Navbar Specification

## Overview
- **Target:** `Navbar` in `src/app/page.tsx`
- **Screenshot:** `docs/design-references/original-desktop-viewport.png`
- **Interaction model:** static overlay (blur always on), hover on links

## Computed Styles (exact)
### Container
- position: fixed, top 0, z-index 50
- height: 64px, padding: 10px 40px
- display: flex, justify-content: center, align-items: center
- background: transparent; backdrop-filter: blur(8px)
- Layout: 3-zone grid — links left | wordmark center | auth right

### Nav links
- fontSize: 13px, color: rgba(255,255,255,0.8) → white on hover
- gap ~24px, dropdown chevron on "Solutions"/"Company" equivalents

### Auth buttons
- "Log in": bg rgba(255,255,255,0.1) white text, radius 8px, padding 10px 16px
- "Sign up": bg #d8fe91, dark text (#101208), radius 8px, padding 10px 16px, height 36px

## States & Behaviors
- Blur(8px) is constant (not scroll-triggered). Optional: darken bg slightly after scroll for readability.
- Link hover: bg rgba(255,255,255,0.1), text white, transition ~150ms.

## Responsive
- Desktop: 3 zones. Mobile (390): links hidden, logo center, auth right.

## Content (original, capstone)
- Links: Platform ▾, Alur ▾, Statistik, Peran
- Logo: "capstone" serif wordmark + mark
- Auth: Masuk (ghost), Daftar (lime)
