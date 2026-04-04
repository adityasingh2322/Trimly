/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#Cfb53b", // Gold
        secondary: "#1a1a1a", // Deep Black/Dark Gray
        background: "#0a0a0a", // Almost Black
        surface: "#111111", // Slightly lighter for cards
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
