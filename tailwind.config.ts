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
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            background: '#ffffff',
            foreground: '#09090b',
            content1: '#ffffff',
            content2: '#f4f4f5',
            content3: '#e4e4e7',
            content4: '#d4d4d8',
            divider: 'rgba(0,0,0,0.08)',
            focus: '#a1a1aa',
            default: {
              50: '#fafafa',
              100: '#f4f4f5',
              200: '#e4e4e7',
              300: '#d4d4d8',
              400: '#a1a1aa',
              500: '#71717a',
              600: '#52525b',
              700: '#3f3f46',
              800: '#27272a',
              900: '#18181b',
              DEFAULT: '#e4e4e7',
              foreground: '#18181b',
            },
            primary: {
              50: '#fafafa',
              100: '#f4f4f5',
              200: '#e4e4e7',
              300: '#d4d4d8',
              400: '#a1a1aa',
              500: '#71717a',
              600: '#52525b',
              700: '#3f3f46',
              800: '#27272a',
              900: '#18181b',
              DEFAULT: '#18181b',
              foreground: '#fafafa',
            },
            danger: {
              DEFAULT: '#e5484d',
              foreground: '#ffffff',
            },
          },
        },
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
      },
    }),
  ],
};

export default config;
