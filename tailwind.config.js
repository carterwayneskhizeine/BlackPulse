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
        'bp-blue': '#108EE9',       // Accent / CTA / Links
        'bp-blue-light': '#49A9EE', // Light Accent
        'bp-blue-dim': '#0E77CA',   // Muted Accent
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
        'glow': '0 0 10px rgba(16, 142, 233, 0.15)',
        'glow-strong': '0 0 15px rgba(16, 142, 233, 0.3)',
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
