import defaultTheme from "tailwindcss/defaultTheme";

// Coupo design tokens: two DaisyUI themes (coupo = light, coupo-dark) plus fonts.
// Use semantic classes (bg-base-*, text-base-content, btn-primary, text-accent, ...) so both themes stay in sync.
// See CLAUDE.md "Design system" for the rules (lime is a FILL color; readable accent text uses text-accent).

// Shape: interactive things are pills, containers are 1.25rem.
const shape = {
  "--rounded-box": "1.25rem",
  "--rounded-btn": "9999px",
  "--rounded-badge": "9999px",
  "--animation-btn": "0.18s",
  "--animation-input": "0.18s",
  "--btn-focus-scale": "0.97",
  "--border-btn": "1px",
  "--tab-border": "1px",
  "--tab-radius": "9999px",
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // `dark:` utilities follow the active theme (data-theme on <html>), not only the OS setting.
  darkMode: ["class", '[data-theme="coupo-dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', ...defaultTheme.fontFamily.sans],
        display: ['"Bricolage Grotesque Variable"', '"Plus Jakarta Sans Variable"', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono Variable"', ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("daisyui")],
  daisyui: {
    themes: [
      {
        // Light: cool "paper" neutrals, ink text, electric lime as the one accent fill.
        coupo: {
          ...shape,
          "color-scheme": "light",
          primary: "#c4f034",
          "primary-content": "#10110e",
          secondary: "#10110e",
          "secondary-content": "#f6f7f2",
          // Readable lime-family color for TEXT on light backgrounds (lime itself is too light for text).
          accent: "#3d5a00",
          "accent-content": "#f7fee7",
          neutral: "#10110e",
          "neutral-content": "#f6f7f2",
          "base-100": "#fefefb",
          "base-200": "#f1f2ec",
          "base-300": "#dcded4",
          "base-content": "#10110e",
          info: "#1d4ed8",
          "info-content": "#eff6ff",
          success: "#3d7a00",
          "success-content": "#f7fee7",
          warning: "#a15c07",
          "warning-content": "#fffbeb",
          error: "#c4291c",
          "error-content": "#fff4f2",
        },
      },
      {
        "coupo-dark": {
          ...shape,
          "color-scheme": "dark",
          primary: "#c8f43c",
          "primary-content": "#0b0c0a",
          secondary: "#ecede6",
          "secondary-content": "#0b0c0a",
          accent: "#c8f43c",
          "accent-content": "#0b0c0a",
          neutral: "#0b0c0a",
          "neutral-content": "#ecede6",
          "base-100": "#151613",
          "base-200": "#0b0c0a",
          "base-300": "#2a2c26",
          "base-content": "#ecede6",
          info: "#7aa7ff",
          "info-content": "#0b1220",
          success: "#c8f43c",
          "success-content": "#0b0c0a",
          warning: "#fbbf24",
          "warning-content": "#1c1206",
          error: "#ff6a5c",
          "error-content": "#1f0604",
        },
      },
    ],
    darkTheme: "coupo-dark",
  },
};
