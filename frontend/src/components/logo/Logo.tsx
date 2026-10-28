import { Link } from "react-router-dom";

// Coupo logo: a ticket mark (rounded rectangle with a notch on each side, same shape as public/favicon.svg)
// in the theme's primary color, plus the "coupo" wordmark in the text color.
export const LogoMark = ({ className = "size-7" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={`text-primary ${className}`} aria-hidden="true">
    <path fill="currentColor" d="M8 4h16a6 6 0 0 1 6 6v1a5 5 0 0 0 0 10v1a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6v-1a5 5 0 0 0 0-10v-1a6 6 0 0 1 6-6z" />
  </svg>
);

const Logo = ({ to = "/" }: { to?: string }) => (
  <Link to={to} className="inline-flex items-center gap-2 rounded-btn" aria-label="Coupo home">
    <LogoMark />
    <span className="text-xl font-extrabold tracking-tight text-base-content">coupo</span>
  </Link>
);

export default Logo;
