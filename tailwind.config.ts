import { heroui } from '@heroui/react';

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
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#3ba6f1',
              foreground: '#ffffff',
            },
            focus: '#3ba6f1',
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#3ba6f1',
              foreground: '#ffffff',
            },
            focus: '#3ba6f1',
          },
        },
      },
    }),
  ],
};

export default config;
