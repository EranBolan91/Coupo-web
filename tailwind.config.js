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
};
