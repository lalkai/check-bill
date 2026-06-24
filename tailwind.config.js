/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.05em",
        "widest+": "0.08em",
      },
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          light: "rgb(var(--color-primary-light-rgb) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark-rgb) / <alpha-value>)",
        },
        "primary-container": "var(--md-sys-color-primary-container)",
        surface: "var(--md-sys-color-surface)",
        "surface-container": "var(--md-sys-color-surface-container)",
        "on-surface": "var(--md-sys-color-on-surface)",
        outline: "var(--md-sys-color-outline)",
        secondary: {
          DEFAULT: "#86868b",
        },
        accent: {
          DEFAULT: "#30d158",
        },
        neutral: {
          DEFAULT: "#f5f5f7",
          50: "#ffffff",
          100: "#f5f5f7",
          200: "#e3e3e3",
          300: "#d2d2d7",
          400: "#86868b",
          500: "#424245",
          600: "#1d1d1f",
          700: "#000000",
        },
        error: {
          DEFAULT: "#ff453a",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        a: "0 4px 12px rgba(0, 0, 0, 0.08)",
        "a-hover": "0 8px 20px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('hover', '@media (hover: hover) { &:hover }');
    }
  ],
};
