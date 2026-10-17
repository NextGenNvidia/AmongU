import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        crew: {
          red: '#c51111',
          blue: '#132ed1',
          green: '#117f2d',
          pink: '#ed54ba',
          orange: '#ef7d0d',
          yellow: '#f5f557',
          black: '#3f474e',
          white: '#d6e0f0',
          purple: '#6b2fbb',
          brown: '#71491e',
          cyan: '#38fedc',
          lime: '#50ef39',
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
