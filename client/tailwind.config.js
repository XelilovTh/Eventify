/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tünd qəhvəyi · Əsas rəng
        primary: {
          DEFAULT: '#3B2418',
          hover: '#2C1B12',
          light: '#4E3121',
        },
        // Karamel · İkinci rəng
        secondary: {
          DEFAULT: '#795548',
          light: '#8D6E63',
          dark: '#5D4037',
        },
        // İsti bej · Vurğu rəngi (aksent)
        accent: {
          DEFAULT: '#C49A6C',
          hover: '#B58957',
          light: '#D7B48C',
          muted: '#EADBC8',
        },
        // Krem · Fon
        cream: {
          DEFAULT: '#F5EFE6',
          dark: '#EBDDCB',
          light: '#FAF7F2',
        },
        // Kartlar üçün sərhəd və kölgə tonları
        borderBeige: '#E6D9C8',
      }
    },
  },
  plugins: [],
}
