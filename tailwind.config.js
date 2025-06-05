module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marble: "#F2F8DC",
        bioGreen: "#228B22",
        bioGreenLight: "#B4D3B2",
        natureDark: "#1C1F1B",
        widgetDarkNature: "#2A2E27",
        borderDarkNature: "#3E453D",
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
