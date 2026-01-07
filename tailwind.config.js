/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochrome Indigo/Slate Palette
        'navy': {
          DEFAULT: '#1E1B4B', // Main dark navy/indigo-950 background
          'light': '#312E81',  // Card/Panel bg / indigo-900
          'dark': '#1E1B4B',   // Darker background
        },
        'indigo': {
          DEFAULT: '#6366F1', // Primary accent / indigo-500
          'form': '#4338CA',  // Form fields / indigo-800
          'hover': '#4F46E5', // Hover state / indigo-600
        },
        // Text colors
        'text': {
          'primary': '#F8FAFC',  // Primary text / slate-50
          'secondary': '#CBD5E1', // Secondary text / slate-300
        },
        // Borders
        'border': {
          DEFAULT: '#475569', // Borders / Lines / slate-600
        },
        // Status colors (keeping these for notifications/alerts)
        'status': {
          'error': '#EF4444',   // Error/alert
          'success': '#10B981', // Success/valid
        },
        // Optional accent colors
        'accent': {
          'yellow': '#FACC15', // CTA accent
          'cyan': '#06B6D4',   // Neon accent for icons/active states
        }
      },
    },
  },
  plugins: [],
}
