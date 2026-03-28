/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#e87040',
          'orange-dim': '#2a1508',
          'orange-mid': '#1f1008',
          bg: '#0f0f0f',
          'bg-dark': '#0a0a0a',
          'bg-card': '#161616',
          'bg-card-hover': '#1a1a1a',
          border: '#2a2a2a',
          'border-light': '#1f1f1f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
