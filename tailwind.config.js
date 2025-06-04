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
        nightblue: "#060a23",      // fond dark
        widgetLight: "#FFFFFF",    // widget light
        widgetDark: "#060a23", // widget dark
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
