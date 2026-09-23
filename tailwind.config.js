/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: "#F5F0E8",
        primary: "#1E3A2F",
        "primary-dark": "#152B22",
        muted: "#9E9589",
        border: "#D8D1C7",
        golden: "#D4921E",
        "golden-light": "#E8B96A",
        "golden-pale": "#F2D9A0",
        amber: "#E8A838",
        "amber-dark": "#B07A0A",
        "green-medium": "#A8C5A0",
      },
    },
  },
  plugins: [],
};