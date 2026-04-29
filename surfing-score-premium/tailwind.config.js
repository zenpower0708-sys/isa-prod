/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        isa: {
          deep: "#002B5B", // Deep Blue
          blue: "#1A5F7A",
          sky: "#86E5FF",
          gold: "#FFD700",
          amber: "#FFB100",
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
