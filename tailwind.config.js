/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/js/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Retro 90s Palette — White Background, Windows 95 Style
        'bp-black': '#C0C0C0',       // Page background (Windows gray)
        'bp-dark': '#FFFFFF',         // Card/component background (white)
        'bp-dark-hover': '#D4D0C8',   // Hover state
        'bp-gray': '#808080',         // Borders / Dividers
        'bp-blue': '#0000FF',         // Classic link blue
        'bp-blue-light': '#4444FF',   // Lighter blue
        'bp-blue-dim': '#0000CC',     // Darker blue
        'bp-red': '#FF0000',          // Danger red
        'bp-text': '#000000',         // Primary text (black)
        'bp-text-muted': '#808080',   // Secondary text (gray)

        // Keep compatibility
        black: '#000000',
      },
      fontFamily: {
        sans: ['Tahoma', 'Verdana', 'Arial', 'Helvetica', 'sans-serif'],
        retro: ['"Times New Roman"', 'Georgia', 'serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'glow': 'none',
        'glow-strong': 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #404040, 2px 2px 0 #000000',
        'retro-outset': 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #808080',
        'retro-inset': 'inset 1px 1px 0 #808080, inset -1px -1px 0 #FFFFFF',
        'retro-raised': 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #404040',
      },
      ringOffsetColor: {
        'black': '#000000',
      },
      borderWidth: {
        '2': '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
