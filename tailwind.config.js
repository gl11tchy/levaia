/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'editor': {
          'bg': '#1e1e1e',
          'sidebar': '#252526',
          'active': '#37373d',
          'hover': '#2a2d2e',
          'border': '#3c3c3c',
          'text': '#cccccc',
          'text-muted': '#808080',
          'accent': '#0078d4',
          'tab': '#2d2d30',
          'tab-active': '#1e1e1e',
        }
      },
      fontFamily: {
        'mono': ['Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      transitionDuration: {
        '150': '150ms',
      }
    },
  },
  plugins: [],
}
