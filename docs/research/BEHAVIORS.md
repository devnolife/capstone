# Behaviors — markopolo.ai (interaction sweep findings)

> From scroll/hover/responsive sweep via Playwright. See `extraction-raw.json`.

## Smooth scroll
- **Lenis is active** (`.lenis` class on html). Native scrolling feels different — clone should install `lenis` and wrap the page.

## Header
- Fixed, 64px, `backdrop-filter: blur(8px)` from load (not scroll-triggered — blur is always on).
- No dramatic shrink detected between scrollY 0 → 300 (computed styles identical). Keep constant height.

## Entrance animations
- Sections fade/slide up when entering viewport (typical Framer site: opacity 0 → 1, translateY ~20px → 0, ease-out ~0.6–0.8s).
- Full-page screenshots show below-fold sections blank → confirms IntersectionObserver-driven reveals (content mounts/animates in-view only).
- **Implementation:** framer-motion `whileInView` with `once: true`, duration ~0.7s, ease [0.22,1,0.36,1].

## Marquee
- Client logo strip: infinite horizontal loop, linear, slow (~30s), masked edges.

## Hover
- Primary CTA hover: no computed-style diff captured at anchor level (Framer animates inner span scale/brightness). Use subtle brightness/translate hover.
- Cards: gentle lift + border brighten on dark.

## Carousels
- Testimonial section: horizontal slide with prev/next arrow buttons (Back/Next arrow SVGs present).
- Personalization engine: auto-cycling carousel with duplicated slides (content repeats 6× in DOM = marquee-style loop).

## Interaction models per section
- Hero: entrance only (time). Marquee: time-driven. Channel cards: hover. Timeline: scroll-reveal. Testimonials: click (arrows) + auto. Footer: hover only.
