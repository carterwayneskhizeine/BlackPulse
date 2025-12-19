/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/js/**/*.js',
  ],
  darkMode: 'class', // Enable dark mode using a class
  theme: {
    extend: {
      colors: {
        // BlackPulse Palette
        'bp-black': '#050505',      // Main background (Near Black)
        'bp-dark': '#121212',       // Component background
        'bp-dark-hover': '#1E1E1E', // Hover state
        'bp-gray': '#2A2A2A',       // Borders / Dividers
        'bp-gold': '#FFD700',       // Accent / CTA / Links
        'bp-gold-dim': '#B39700',   // Muted Accent
        'bp-red': '#EF4444',        // Danger
        'bp-text': '#E5E7EB',       // Primary Text
        'bp-text-muted': '#9CA3AF', // Secondary Text
        
        // Keep compatibility for a moment or specific overrides
        black: '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 10px rgba(255, 215, 0, 0.1)',
        'glow-strong': '0 0 15px rgba(255, 215, 0, 0.2)',
      },
      ringOffsetColor: {
        'black': '#000000',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
