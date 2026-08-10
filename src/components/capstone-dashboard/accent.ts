// Peta kelas aksen statis (Tailwind butuh literal) + hash deterministik
// untuk memberi warna konsisten per orang/item menggantikan abu-abu.

export type AccentName =
  | 'brand'
  | 'success'
  | 'warning'
  | 'info'
  | 'highlight'
  | 'rose'
  | 'orange';

export const ACCENT_ORDER: AccentName[] = [
  'brand',
  'info',
  'highlight',
  'success',
  'rose',
  'orange',
  'warning',
];

export const ACCENT_TINT: Record<AccentName, string> = {
  brand: 'border-brand/35 bg-brand/12 text-brand',
  success: 'border-success/35 bg-success/12 text-success',
  warning: 'border-warning/40 bg-warning/12 text-warning',
  info: 'border-info/35 bg-info/12 text-info',
  highlight: 'border-highlight/35 bg-highlight/12 text-highlight',
  rose: 'border-rose/35 bg-rose/12 text-rose',
  orange: 'border-orange/35 bg-orange/12 text-orange',
};

export const ACCENT_TEXT: Record<AccentName, string> = {
  brand: 'text-brand',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  highlight: 'text-highlight',
  rose: 'text-rose',
  orange: 'text-orange',
};

export const ACCENT_DOT: Record<AccentName, string> = {
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  highlight: 'bg-highlight',
  rose: 'bg-rose',
  orange: 'bg-orange',
};

/* Chip solid untuk ikon yang harus menonjol di atas tint kartu */
export const ACCENT_SOLID: Record<AccentName, string> = {
  brand: 'border-transparent bg-brand text-brand-foreground shadow-sm',
  success: 'border-transparent bg-success text-success-foreground shadow-sm',
  warning: 'border-transparent bg-warning text-warning-foreground shadow-sm',
  info: 'border-transparent bg-info text-info-foreground shadow-sm',
  highlight:
    'border-transparent bg-highlight text-highlight-foreground shadow-sm',
  rose: 'border-transparent bg-rose text-rose-foreground shadow-sm',
  orange: 'border-transparent bg-orange text-orange-foreground shadow-sm',
};

/* FX kartu modern per aksen. Light: isian tint solid merata + border tint.
   Dark: gradient tint dari atas yang menyatu ke permukaan kartu.
   Plus hairline atas (before), glow pojok (after), border menguat saat hover. */
export const ACCENT_CARD: Record<AccentName, string> = {
  brand:
    'border-brand/25 bg-brand/12 dark:bg-card dark:bg-linear-to-b dark:from-brand/14 dark:via-brand/4 dark:to-card hover:border-brand/45 before:via-brand/60 after:bg-brand/10',
  success:
    'border-success/25 bg-success/12 dark:bg-card dark:bg-linear-to-b dark:from-success/14 dark:via-success/4 dark:to-card hover:border-success/45 before:via-success/60 after:bg-success/10',
  warning:
    'border-warning/30 bg-warning/12 dark:bg-card dark:bg-linear-to-b dark:from-warning/14 dark:via-warning/4 dark:to-card hover:border-warning/50 before:via-warning/60 after:bg-warning/10',
  info: 'border-info/25 bg-info/12 dark:bg-card dark:bg-linear-to-b dark:from-info/14 dark:via-info/4 dark:to-card hover:border-info/45 before:via-info/60 after:bg-info/10',
  highlight:
    'border-highlight/25 bg-highlight/12 dark:bg-card dark:bg-linear-to-b dark:from-highlight/14 dark:via-highlight/4 dark:to-card hover:border-highlight/45 before:via-highlight/60 after:bg-highlight/10',
  rose: 'border-rose/25 bg-rose/12 dark:bg-card dark:bg-linear-to-b dark:from-rose/14 dark:via-rose/4 dark:to-card hover:border-rose/45 before:via-rose/60 after:bg-rose/10',
  orange:
    'border-orange/25 bg-orange/12 dark:bg-card dark:bg-linear-to-b dark:from-orange/14 dark:via-orange/4 dark:to-card hover:border-orange/45 before:via-orange/60 after:bg-orange/10',
};

/* Base FX yang dipakai bersama ACCENT_CARD */
export const CARD_FX =
  'group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:to-transparent after:pointer-events-none after:absolute after:-top-14 after:-right-14 after:size-36 after:rounded-full after:opacity-70 after:blur-2xl';

/** Warna deterministik dari string (nama/inisial) — stabil antar render. */
export function accentFor(seed: string): AccentName {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return ACCENT_ORDER[Math.abs(hash) % ACCENT_ORDER.length];
}
