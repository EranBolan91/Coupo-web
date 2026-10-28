import { useSyncExternalStore } from "react";

// Light/dark theme, shared by every component that uses this hook.
// The first paint is handled by the inline script in index.html (same storage key and theme names).
// With no saved choice, the theme follows the operating system and updates when it changes.
export type Theme = "light" | "dark";

const STORAGE_KEY = "coupo-theme";
const THEME_NAMES: Record<Theme, string> = { light: "coupo", dark: "coupo-dark" };
const listeners = new Set<() => void>();

const readSaved = (): Theme | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
};

const systemTheme = (): Theme => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

const getTheme = (): Theme =>
  document.documentElement.getAttribute("data-theme") === THEME_NAMES.dark ? "dark" : "light";

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", THEME_NAMES[theme]);
  listeners.forEach((listener) => listener());
};

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (readSaved() === null) applyTheme(systemTheme());
});

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setTheme = (theme: Theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
  applyTheme(theme);
};

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getTheme);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return { theme, setTheme, toggleTheme };
};
