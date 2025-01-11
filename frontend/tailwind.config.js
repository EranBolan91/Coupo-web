/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        contentColor: "hsl(var(--content-color) / <alpha-value>)",
      },
      colors: {
        primary: "hsl(var(--color-primary) / <alpha-value>)",
        secondary: "hsl(var(--color-secondary) / <alpha-value>)",
        background: "hsl(var(--color-background) / <alpha-value>)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "dark",
      {
        coupoThem: {
          primary: "#00b5dc",
          "primary-content": "#000c11",
          secondary: "#00c0ff",
          "secondary-content": "#000e16",
          accent: "#f94700",
          "accent-content": "#150200",
          neutral: "#1a171b",
          "neutral-content": "#cbcbcc",
          "base-100": "#23272b",
          "base-200": "#1d2024",
          "base-300": "#171a1d",
          "base-content": "#cecfd0",
          info: "#006ce2",
          "info-content": "#d1e3fc",
          success: "#408000",
          "success-content": "#d8e5d1",
          warning: "#fb6600",
          "warning-content": "#150300",
          error: "#ff7d98",
          "error-content": "#160508",
        },
      },
    ],
  },
};
