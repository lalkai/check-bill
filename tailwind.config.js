/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-a-system', 'BlinkMacSystemFont', 'San Francisco', 'Helvetica Neue', 'Helvetica', 'Ubuntu', 'Roboto', 'Noto', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0066cc', 
          light: '#147ce5',
          dark: '#004b96',
        },
        secondary: {
          DEFAULT: '#86868b', 
        },
        accent: {
          DEFAULT: '#30d158', 
        },
        neutral: {
          DEFAULT: '#f5f5f7', 
          50: '#ffffff',
          100: '#f5f5f7',
          200: '#e3e3e3',
          300: '#d2d2d7',
          400: '#86868b',
          500: '#424245',
          600: '#1d1d1f',
          700: '#000000',
        },
        error: {
          DEFAULT: '#ff453a', 
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'a': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'a-hover': '0 8px 20px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}