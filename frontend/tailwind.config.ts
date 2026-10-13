import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        space: '#0a0b10',
        crew: {
          red: '#c51111',
          blue: '#132ed1',
          green: '#117f2d',
          pink: '#ed54ba',
          orange: '#f07d0d',
          yellow: '#f5f557',
          cyan: '#38fedc',
          lime: '#50ef39',
          purple: '#6b2fbb',
          white: '#d6e0f0',
        },
      },
      boxShadow: {
        au: '6px 6px 0px rgba(0,0,0,1)',
        'au-sm': '3px 3px 0px rgba(0,0,0,1)',
        'neon-cyan': '0 0 10px #38fedc, 0 0 20px #38fedc',
        'neon-red': '0 0 10px #c51111, 0 0 20px #c51111',
      },
    },
  },
  plugins: [],
};

export default config;
