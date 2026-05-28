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
        // Fintech Premium Colors
        brand: {
          50: '#f5f8ff',
          100: '#ebf1ff',
          200: '#d6e4ff',
          300: '#adc8ff',
          400: '#85aaff',
          500: '#3b82f6', // Premium blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
        },
        income: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981', // Clean emerald green
          600: '#059669',
          700: '#047857',
        },
        expense: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#f43f5e', // Elegant rose red
          600: '#e11d48',
          700: '#be123c',
        },
        darkbg: {
          950: '#09090b', // Deep zinc/black
          900: '#121214', // Card backgrounds
          800: '#1a1a1e', // Inputs, hover elements
          700: '#27272a',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 40px rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
