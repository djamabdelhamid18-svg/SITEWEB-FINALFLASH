/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./app.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#060608",
          card: "#121116",
          cardHover: "#19181f",
          border: "#262530",
          purple: "#9d4edd",
          purpleDark: "#6d28b8",
          purpleLight: "#c77dff",
          fire: "#ff5400",
        },
      },
      fontFamily: {
        sans: ["Readex Pro", "sans-serif"],
        streetwear: ["Syne", "Readex Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
};
