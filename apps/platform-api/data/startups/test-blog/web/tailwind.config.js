/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {"50":"#f8fafc","100":"#eff6ff","200":"#dfebf7","300":"#bcdaf4","400":"#9aaaf1","500":"#6b82cc","600":"#4e6ed7","700":"#3a53ab","800":"#2b3c8d","900":"#1f295b"}
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        'theme': 'var(--radius)',
      }
    },
  },
  plugins: [],
}
