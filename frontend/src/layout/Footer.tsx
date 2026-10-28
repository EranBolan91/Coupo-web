import { Link } from "react-router-dom";
import Logo from "../components/logo/Logo";

const links = [
  { name: "Coupons", href: "/coupons" },
  { name: "Categories", href: "/categories" },
  { name: "Social Coupons", href: "/social" },
  { name: "Add a coupon", href: "/addcoupon" },
];

const Footer = () => {
  return (
    <footer className="border-t border-base-300 bg-base-100">
      <div className="page-container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-xs text-sm text-base-content/70">Find, share and vote on coupon codes.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-base-content/70 transition-colors hover:text-base-content"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="page-container border-t border-base-300 py-4 text-sm text-base-content/60">
        © {new Date().getFullYear()} Coupo
      </div>
    </footer>
  );
};

export default Footer;
