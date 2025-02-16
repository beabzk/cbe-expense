/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        'cbe-purple': '#6b21a8',
        'cbe-purple-light': '#c4b5fd',
        'cbe-purple-dark': '#4c1d95',
        'cbe-accent': '#facc15',
      },
    },
  },
  plugins: [],
}