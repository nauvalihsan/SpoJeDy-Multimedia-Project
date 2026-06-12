/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spojedy: {
          main: '#39084D',
          accent: '#AE00FF',
          dark: '#000000',
          light: '#FFFFFF',
          sidebar: '#212121',
          gray1: '#4D4D4D',
          gray2: '#D9D9D9',
          gray3: '#CCCCCC',
          gray4: '#F5F5F5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
