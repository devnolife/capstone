import { heroui } from '@heroui/react';

/**
 * HeroUI theme retokened to the Caret zinc design system (dark-only).
 * Values mirror src/styles/caret.css so HeroUI components and the
 * Caret components share one visual language.
 */

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    heroui({
      addCommonColors: true,
      defaultTheme: 'dark',
      themes: {
        dark: {
          colors: {
            background: '#09090b',
            foreground: '#fafafa',
            content1: '#18181b',
            content2: '#27272a',
            content3: '#3f3f46',
            content4: '#52525b',
            divider: 'rgba(255,255,255,0.1)',
            focus: '#71717b',
            default: {
              50: '#18181b',
              100: '#27272a',
              200: '#3f3f46',
              300: '#52525b',
              400: '#71717a',
              500: '#a1a1aa',
              600: '#d4d4d8',
              700: '#e4e4e7',
              800: '#f4f4f5',
              900: '#fafafa',
              DEFAULT: '#3f3f46',
              foreground: '#fafafa',
            },
            primary: {
              50: '#18181b',
              100: '#27272a',
              200: '#3f3f46',
              300: '#52525b',
              400: '#71717a',
              500: '#a1a1aa',
              600: '#d4d4d8',
              700: '#e4e4e7',
              800: '#f4f4f5',
              900: '#fafafa',
              DEFAULT: '#e4e4e7',
              foreground: '#18181b',
            },
            danger: {
              DEFAULT: '#ff6568',
              foreground: '#18181b',
            },
          },
        },
        // Light theme kept as fallback (app is forced dark)
        light: {
          colors: {
            primary: {
              DEFAULT: '#18181b',
              foreground: '#fafafa',
            },
            focus: '#71717b',
          },
        },
      },
    }),
  ],
};

export default config;
