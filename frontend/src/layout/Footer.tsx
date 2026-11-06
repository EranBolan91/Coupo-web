import { LogoMark } from "../components/logo/Logo";
import { Link, useLocation } from "react-router-dom";

const links = [
  { name: "Coupons", href: "/coupons" },
  { name: "Stores", href: "/stores" },
  { name: "Categories", href: "/categories" },
  { name: "Social Coupons", href: "/social" },
  { name: "Top sharers", href: "/top-sharers" },
  { name: "Share a coupon", href: "/addcoupon" },
  { name: "Feedback", href: "/feedback" },
];

// Navy block with rounded top corners, a giant wordmark and the hippo peeking over it.
const Footer = () => {
  const { pathname } = useLocation();
  return (
    <footer className="mt-8 overflow-hidden rounded-t-[2rem] bg-neutral text-neutral-content dark:bg-base-100 dark:text-base-content md:rounded-t-[3rem]">
      <div className="page-container pt-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <LogoMark className="size-12" />
            <p className="mt-4 text-lg font-semibold">Find the code. Keep the change.</p>
            <p className="mt-1 text-sm opacity-70">Coupon codes shared and voted on by shoppers like you.</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-3 sm:flex sm:gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                state={link.href === "/feedback" ? { from: pathname } : undefined}
                className="text-sm font-bold opacity-80 transition-opacity hover:opacity-100"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="pointer-events-none mt-12 flex select-none items-end gap-[2vw]" aria-hidden="true">
          <p className="font-display text-[25vw] font-black leading-[0.8] tracking-[-0.05em] text-primary md:text-[20vw] xl:text-[17rem]">
            coupo
          </p>
          <LogoMark className="mb-[4vw] size-[17vw] shrink-0 rotate-6 xl:mb-14 xl:size-48" blink />
        </div>
      </div>
      <div className="mt-6 border-t border-white/10 dark:border-base-300">
        <div className="page-container py-5 text-sm opacity-60">© {new Date().getFullYear()} Coupo</div>
      </div>
    </footer>
  );
};

export default Footer;
