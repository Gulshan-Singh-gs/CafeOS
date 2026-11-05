import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          50: '#FDFBF7',
          100: '#F7F3EA',
          200: '#EFE7D5',
          300: '#DFD1B3',
          400: '#C89242', // Brass Gold
          500: '#D9531E', // Warm Terracotta
          600: '#B83F12',
          700: '#8C2E0A',
          800: '#421E10', // Deep Coffee
          900: '#1C130E', // Dark Espresso
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

