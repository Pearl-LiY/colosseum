/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          850: '#1f2937',
          900: '#111827',
          950: '#030712', // Deep background
        },
        trade: {
          up: '#10b981', // Emerald 500
          down: '#f43f5e', // Rose 500
          accent: '#3b82f6', // Blue 500
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', "Helvetica Neue", 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-once': 'pulse-once 0.5s cubic-bezier(0.4, 0, 0.6, 1)',
      },
      keyframes: {
        'pulse-once': {
          '0%, 100%': { opacity: 1, backgroundColor: 'transparent' },
          '50%': { opacity: .8, backgroundColor: 'rgba(59, 130, 246, 0.1)' },
        }
      }
    },
  },
  plugins: [],
}