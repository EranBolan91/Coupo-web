import { Link } from "react-router-dom";

// Coupo's mascot and logo: a cute blue hippo face (Coupo ~ "hippo"). Same drawing as public/favicon.svg.
// Brand colors are fixed here on purpose: the hippo looks the same in both themes.
const BODY = ["M16 6.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13z", "M48 6.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13z"];

export const HippoFace = ({ blink = false }: { blink?: boolean }) => (
  <>
    <g stroke="#0d1733" strokeWidth="5" strokeLinejoin="round">
      {BODY.map((d) => (
        <path key={d} d={d} />
      ))}
      <ellipse cx="32" cy="26" rx="20" ry="16" />
      <rect x="5" y="28" width="54" height="31" rx="15.5" />
    </g>
    <g fill="#3d6bff">
      {BODY.map((d) => (
        <path key={d} d={d} />
      ))}
      <ellipse cx="32" cy="26" rx="20" ry="16" />
      <rect x="5" y="28" width="54" height="31" rx="15.5" />
    </g>
    <circle cx="16" cy="13.5" r="3" fill="#ff9ec0" />
    <circle cx="48" cy="13.5" r="3" fill="#ff9ec0" />
    <rect x="9" y="33" width="46" height="22" rx="11" fill="#7094ff" />
    <g className={blink ? "hippo-blink" : undefined}>
      <circle cx="24" cy="22" r="4.6" fill="#fff" />
      <circle cx="40" cy="22" r="4.6" fill="#fff" />
      <circle cx="25" cy="23" r="2.6" fill="#0d1733" />
      <circle cx="41" cy="23" r="2.6" fill="#0d1733" />
      <circle cx="26" cy="21.8" r="0.9" fill="#fff" />
      <circle cx="42" cy="21.8" r="0.9" fill="#fff" />
    </g>
    <ellipse cx="24" cy="40" rx="2.4" ry="3.4" fill="#0d1733" />
    <ellipse cx="40" cy="40" rx="2.4" ry="3.4" fill="#0d1733" />
    <path d="M27 48.5q5 4 10 0" fill="none" stroke="#0d1733" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="13" cy="47" r="3" fill="#ff9ec0" opacity=".85" />
    <circle cx="51" cy="47" r="3" fill="#ff9ec0" opacity=".85" />
  </>
);

export const LogoMark = ({ className = "size-9", blink = false }: { className?: string; blink?: boolean }) => (
  <svg viewBox="0 0 64 64" className={`overflow-visible ${className}`} aria-hidden="true">
    <HippoFace blink={blink} />
  </svg>
);

const Logo = ({ to = "/", className = "" }: { to?: string; className?: string }) => (
  <Link to={to} className={`group inline-flex items-center gap-2 rounded-btn ${className}`} aria-label="Coupo home">
    <LogoMark className="size-9 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110" blink />
    <span className="font-display text-[1.65rem] font-black leading-none tracking-tight text-base-content">coupo</span>
  </Link>
);

export default Logo;
