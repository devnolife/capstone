# Caret Next.js Template

Template landing page + dashboard bergaya Caret: design system zinc dark, motion layer GSAP + Lenis, demo animasi Remotion Player, dan halaman dashboard yang konsisten.

## Fitur

- **Next.js 16** (App Router, React 19, TypeScript strict) + **Tailwind CSS v4**
- **Design system siap pakai** — token warna zinc dark + palet `app-*`, font self-hosted (Figtree, Google Sans Flex, DM Mono, Satoshi, PP Editorial New), pola bento-grid border `zinc-800`
- **Motion layer** — Lenis smooth scrolling, GSAP ScrollTrigger reveal via data-attributes (`data-reveal`, `data-reveal-group`, `data-parallax`, `data-label-left/right`), hero entrance SplitText
- **Remotion** — 3 komposisi demo (minibar Q&A, SSO chat, meeting pill) di-embed via `@remotion/player`; preview/render via Remotion Studio
- **Interaksi** — dropdown Download & language switcher ringan (tanpa library positioning), demo klik pill dengan typewriter (framer-motion)
- **Aksesibilitas** — semua animasi menghormati `prefers-reduced-motion`

## Mulai

```bash
npm install
npm run dev        # buka http://localhost:3000
```

| Script | Fungsi |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve hasil build |
| `npm run check` | Lint + typecheck + build |
| `npm run remotion:studio` | Remotion Studio (preview/render komposisi) |

## Halaman

- `/` — landing page (hero + 3 section fitur + privacy + CTA + footer)
- `/dashboard` — overview meeting-analytics (sidebar, stat cards, chart SVG, daftar meeting, suggestions feed) dengan data mock di `src/components/caret/dashboard/dashboard-data.ts`

## Struktur

```
src/
  app/                  # layout (fonts, SmoothScroll, ScrollAnimations), page, dashboard/
  components/
    caret/              # section landing + primitif (DownloadButton, DropdownLite, …)
    caret/dashboard/    # komponen dashboard + data mock
    icons.tsx           # ikon SVG (logo, platform, dsb)
  lib/utils.ts          # cn()
  remotion/             # komposisi + Root/entry Studio + studio.css
public/
  images/caret/         # gambar & pattern
  fonts/caret/          # webfont self-hosted (fonts.css dimuat di layout)
remotion.config.ts      # webpack Studio: Tailwind v4 + alias @/
```

## Kustomisasi cepat

- **Warna/token:** `src/app/globals.css` (blok `:root` + `@theme inline`)
- **Animasi scroll:** tambah `data-reveal` / `data-reveal-group` pada elemen mana pun — orkestratornya global (`ScrollAnimations.tsx`)
- **Komposisi Remotion baru:** buat di `src/remotion/`, daftarkan di `Root.tsx`, embed dengan `@remotion/player`

## Catatan

- Preview di Remotion Studio memakai font fallback (webfont dimuat oleh app Next, bukan Studio).
- `ajv` dipin di devDependencies untuk mencegah konflik hoisting webpack milik Remotion CLI.
