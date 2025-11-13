/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
        },
        bg: {
          DEFAULT: "var(--color-bg)",
          secondary: "var(--color-bg-secondary)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          secondary: "var(--color-text-secondary)",
        },
        border: {
          DEFAULT: "var(--color-border)",
        },
        error: "var(--color-error)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
      },
      fontFamily: {
        mono: ["'Monaco'", "'Menlo'", "'Courier New'", "monospace"],
      },
      backgroundColor: {
        base: "var(--color-bg)",
        secondary: "var(--color-bg-secondary)",
      },
      borderColor: {
        base: "var(--color-border)",
      },
      textColor: {
        base: "var(--color-text)",
        secondary: "var(--color-text-secondary)",
      },
    },
  },
  plugins: [],
}
