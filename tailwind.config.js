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
          'bg': '#282a2e',
          'sidebar': '#24262a',
          'active': '#3a3d42',
          'hover': '#32353a',
          'border': '#3d4045',
          'text': '#c8c8c4',
          'text-muted': '#7d8590',
          'accent': '#6b9eff',
          'tab': '#2c2e32',
          'tab-active': '#282a2e',
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
