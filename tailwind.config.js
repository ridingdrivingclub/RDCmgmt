/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // RDC Brand Colors
        'rdc': {
          primary: '#FF4400',
          'primary-dark': '#E63D00',
          'forest': '#28431F',
          'burgundy': '#542E31',
          'olive': '#706546',
          'tan': '#9D7666',
          'taupe': '#766553',
          'warm-gray': '#C5BFB0',
          'cream': '#EAE8E3',
          'dark-gray': '#585858',
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
