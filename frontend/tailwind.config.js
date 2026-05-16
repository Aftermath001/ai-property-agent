/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
        },
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
      },
      boxShadow: {
        soft: '0 16px 40px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}