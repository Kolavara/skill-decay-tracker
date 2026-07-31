/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fdfbf7',
        pencil: '#2d2d2d',
        muted: '#e5e0d8',
        accent: '#ff4d4d',
        blue: '#2d5da1',
        postit: '#fff9c4',
      },
      fontFamily: {
        hand: ['"Kalam"', 'cursive'],
        body: ['"Patrick Hand"', 'cursive'],
      },
      borderRadius: {
        wobbly: '255px 15px 225px 15px / 15px 225px 15px 255px',
        wobblyMd: '12px 255px 12px 255px / 255px 12px 255px 12px',
        wobblyLg: '15px 30px 20px 25px / 25px 20px 30px 15px',
      },
      boxShadow: {
        hand: '4px 4px 0px 0px #2d2d2d',
        handLg: '8px 8px 0px 0px #2d2d2d',
        handHover: '2px 2px 0px 0px #2d2d2d',
        handSm: '3px 3px 0px 0px rgba(45, 45, 45, 0.1)',
      },
    },
  },
  plugins: [],
};
