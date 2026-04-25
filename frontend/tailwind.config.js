/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3f2',
          100: '#fee5e2',
          200: '#fececa',
          300: '#fdaca5',
          400: '#fa7d71',
          500: '#f35244',
          600: '#e03426',
          700: '#bd281c',
          800: '#9d251b',
          900: '#82261d',
          950: '#470f0b',
        },
      },
    },
  },
  plugins: [],
}
