import { LogoMark } from "../components/logo/Logo";
import { Link } from "react-router-dom";

const links = [
  { name: "Coupons", href: "/coupons" },
  { name: "Categories", href: "/categories" },
  { name: "Social Coupons", href: "/social" },
  { name: "Share a coupon", href: "/addcoupon" },
];

// Ink block in light mode (raised surface in dark mode) with a giant wordmark.
const Footer = () => {
  return (
    <footer className="overflow-hidden bg-neutral text-neutral-content dark:bg-base-100 dark:text-base-content">
      <div className="page-container pt-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <LogoMark className="size-10" />
            <p className="mt-4 text-lg font-semibold">Find the code. Keep the change.</p>
            <p className="mt-1 text-sm opacity-70">Coupon codes shared and voted on by shoppers like you.</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-3 sm:flex sm:gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-bold opacity-80 transition-opacity hover:opacity-100"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <p
          className="pointer-events-none mt-12 select-none font-display text-[23vw] font-extrabold leading-[0.72] tracking-[-0.06em] text-primary md:text-[19vw] xl:text-[17rem]"
          aria-hidden="true"
        >
          coupo
        </p>
      </div>
      <div className="border-t border-white/10 dark:border-base-300">
        <div className="page-container py-5 text-sm opacity-60">© {new Date().getFullYear()} Coupo</div>
      </div>
    </footer>
  );
};

export default Footer;
