module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#7C3AED',
        surface: '#1A1A2E',
        bg: '#0F0F1A'
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif']
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
        input: '8px'
      }
    }
  },
  plugins: [],
}
