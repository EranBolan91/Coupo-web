import { PiMoonBold, PiSunBold } from "react-icons/pi";
import { useTheme } from "../../hooks/useTheme";

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-ghost btn-square ${className}`}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <PiSunBold className="size-5" aria-hidden /> : <PiMoonBold className="size-5" aria-hidden />}
    </button>
  );
};

export default ThemeToggle;
