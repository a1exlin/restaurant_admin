/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        schedule: {
          bg: '#f5f5f0',
          card: '#ffffff',
          border: '#e5e4df',
          accent: '#2d6a4f',
          accentHover: '#1b4332',
          accentLight: '#95d5b2',
          text: '#1a1a1a',
          textMuted: '#5c5c5c',
          headcount: '#40916c',
        },
      },
    },
  },
  plugins: [],
}
