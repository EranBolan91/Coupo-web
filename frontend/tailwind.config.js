import defaultTheme from "tailwindcss/defaultTheme";

// Design tokens live in the two DaisyUI themes below. Use the semantic classes
// (bg-base-100/200/300, text-base-content, btn-primary, text-primary, border-base-300, ...)
// rather than raw Tailwind colors so both themes stay in sync. See CLAUDE.md "Design system".

// Shape scale (one system everywhere): cards/panels 1rem, buttons/inputs 0.625rem, badges/chips full.
const shape = {
  "--rounded-box": "1rem",
  "--rounded-btn": "0.625rem",
  "--rounded-badge": "9999px",
  "--animation-btn": "0.2s",
  "--btn-focus-scale": "0.98",
  "--border-btn": "1px",
  "--tab-radius": "0.625rem",
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // `dark:` utilities follow the active DaisyUI theme (set on <html data-theme>), not only the OS setting.
  darkMode: ["class", '[data-theme="coupo-dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("daisyui")],
  daisyui: {
    themes: [
      {
        // Light: zinc neutrals + one emerald accent ("savings" green).
        coupo: {
          ...shape,
          "color-scheme": "light",
          primary: "#047857",
          "primary-content": "#f8fafc",
          secondary: "#27272a",
          "secondary-content": "#fafafa",
          accent: "#047857",
          "accent-content": "#f8fafc",
          neutral: "#18181b",
          "neutral-content": "#fafafa",
          "base-100": "#fdfdfd",
          "base-200": "#f4f4f5",
          "base-300": "#e4e4e7",
          "base-content": "#18181b",
          info: "#1d4ed8",
          "info-content": "#f8fafc",
          success: "#047857",
          "success-content": "#f8fafc",
          warning: "#b45309",
          "warning-content": "#fffbeb",
          error: "#dc2626",
          "error-content": "#fef2f2",
        },
      },
      {
        "coupo-dark": {
          ...shape,
          "color-scheme": "dark",
          primary: "#34d399",
          "primary-content": "#022c22",
          secondary: "#e4e4e7",
          "secondary-content": "#18181b",
          accent: "#34d399",
          "accent-content": "#022c22",
          neutral: "#27272a",
          "neutral-content": "#fafafa",
          "base-100": "#18181b",
          "base-200": "#101012",
          "base-300": "#2e2e33",
          "base-content": "#e4e4e7",
          info: "#60a5fa",
          "info-content": "#0b1220",
          success: "#34d399",
          "success-content": "#022c22",
          warning: "#fbbf24",
          "warning-content": "#1c1206",
          error: "#f87171",
          "error-content": "#1f0707",
        },
      },
    ],
    darkTheme: "coupo-dark",
  },
};
