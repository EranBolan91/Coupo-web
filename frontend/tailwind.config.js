import defaultTheme from "tailwindcss/defaultTheme";

// Coupo design tokens: "Hippo pop". Two DaisyUI themes (coupo = light, coupo-dark) plus fonts.
// Use semantic classes (bg-base-*, text-base-content, btn-primary, text-accent, ...) so both themes stay in sync.
// primary = hippo blue (brand, main actions). secondary = deal yellow (savings, highlights; ink text on it).
// accent = blue that is safe for TEXT on the page background. See CLAUDE.md "Design system".

// Shape: interactive things are pills, containers are soft 1.5rem squircles.
const shape = {
  "--rounded-box": "1.5rem",
  "--rounded-btn": "9999px",
  "--rounded-badge": "9999px",
  "--animation-btn": "0.2s",
  "--animation-input": "0.2s",
  "--btn-focus-scale": "0.96",
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
        sans: ['"DM Sans Variable"', ...defaultTheme.fontFamily.sans],
        display: ['"Nunito Variable"', '"DM Sans Variable"', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono Variable"', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        // Fixed brand blue for big hero/brand panels (white text on it in both themes).
        brand: { DEFAULT: "#2f5bef", deep: "#2142c9" },
      },
      boxShadow: {
        // Soft, blue-tinted depth (offset + blur). "lift" is for hover.
        soft: "0 1px 2px rgb(13 23 51 / 0.05), 0 8px 24px -6px rgb(35 64 160 / 0.14)",
        lift: "0 2px 4px rgb(13 23 51 / 0.06), 0 18px 36px -10px rgb(35 64 160 / 0.26)",
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
        // Light: cloud-blue page, white cards, navy ink, hippo blue + deal yellow.
        coupo: {
          ...shape,
          "color-scheme": "light",
          primary: "#2f5bef",
          "primary-content": "#ffffff",
          secondary: "#ffd23f",
          "secondary-content": "#0d1733",
          accent: "#2550e0",
          "accent-content": "#ffffff",
          neutral: "#0d1733",
          "neutral-content": "#f3f6ff",
          "base-100": "#ffffff",
          "base-200": "#f1f5ff",
          "base-300": "#dbe3f7",
          "base-content": "#0d1733",
          info: "#2f5bef",
          "info-content": "#ffffff",
          success: "#0f7a55",
          "success-content": "#ecfdf5",
          warning: "#a15c07",
          "warning-content": "#fffbeb",
          error: "#d42a3a",
          "error-content": "#fff1f2",
        },
      },
      {
        // Dark: deep navy night, lighter hippo blue, same deal yellow.
        "coupo-dark": {
          ...shape,
          "color-scheme": "dark",
          primary: "#7c9bff",
          "primary-content": "#0a1024",
          secondary: "#ffd23f",
          "secondary-content": "#0a1024",
          accent: "#8ea9ff",
          "accent-content": "#0a1024",
          neutral: "#050914",
          "neutral-content": "#e8eeff",
          "base-100": "#121a36",
          "base-200": "#0a1024",
          "base-300": "#26325c",
          "base-content": "#e8eeff",
          info: "#8ea9ff",
          "info-content": "#0a1024",
          success: "#4ade9b",
          "success-content": "#04170f",
          warning: "#fbbf24",
          "warning-content": "#1c1206",
          error: "#ff6b7a",
          "error-content": "#22050a",
        },
      },
    ],
    darkTheme: "coupo-dark",
  },
};
