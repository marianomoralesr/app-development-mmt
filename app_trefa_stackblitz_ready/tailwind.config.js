/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1a365d', // Dark blue
        secondary: '#FF6801', // Orange
        accent: '#FF6801',
      },
    },
  },
  plugins: [],
};