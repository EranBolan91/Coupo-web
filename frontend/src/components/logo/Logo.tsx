import { Link } from "react-router-dom";

// Coupo logo: a lime ticket (notched rectangle, ink outline, dotted tear line) + the "coupo" wordmark.
// Same shape as public/favicon.svg.
export const LogoMark = ({ className = "size-8" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path
      className="fill-primary stroke-base-content"
      strokeWidth="1.6"
      d="M8 4h16a6 6 0 0 1 6 6v1a5 5 0 0 0 0 10v1a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6v-1a5 5 0 0 0 0-10v-1a6 6 0 0 1 6-6z"
    />
    <path className="stroke-base-content" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0.1 3.2" d="M21.5 9v14" />
  </svg>
);

const Logo = ({ to = "/", className = "" }: { to?: string; className?: string }) => (
  <Link to={to} className={`group inline-flex items-center gap-2 rounded-btn ${className}`} aria-label="Coupo home">
    <LogoMark className="size-8 transition-transform duration-300 group-hover:-rotate-6" />
    <span className="font-display text-2xl font-extrabold tracking-tight text-base-content">coupo</span>
  </Link>
);

export default Logo;
