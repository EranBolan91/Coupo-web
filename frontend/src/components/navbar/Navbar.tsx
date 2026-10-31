import { PiListBold, PiPlusBold, PiXBold } from "react-icons/pi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import ThemeToggle from "../themeToggle/ThemeToggle";
import Notifications from "../notifications/Notifications";
import { UserAuth } from "../../auth/AuthProvider";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import Avatar from "./components/Avatar";
import Logo from "../logo/Logo";
import toast from "react-hot-toast";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Coupons", href: "/coupons" },
  { name: "Stores", href: "/stores" },
  { name: "Categories", href: "/categories" },
  { name: "Social Coupons", href: "/social" },
  { name: "Top sharers", href: "/top-sharers" },
];

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-btn px-4 py-2 text-sm font-bold transition-colors ${
    isActive ? "bg-primary text-primary-content" : "text-base-content/75 hover:bg-base-200 hover:text-base-content"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-btn px-4 py-3 font-display text-2xl font-extrabold tracking-tight ${
    isActive ? "bg-primary text-primary-content" : "text-base-content hover:bg-base-200"
  }`;

const Navbar = () => {
  const userDocument = useCurrentUser();
  const { logout } = UserAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);
  const { pathname } = useLocation();

  const handleLogout = async () => {
    closeMenu();
    await logout();
    toast.success("You're logged out");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-base-300/70 bg-base-100/85 backdrop-blur-md supports-[backdrop-filter]:bg-base-100/70">
      <nav className="page-container flex h-[4.25rem] items-center justify-between gap-4" aria-label="Main">
        <div className="flex lg:flex-1">
          <Logo />
        </div>

        <div className="hidden lg:flex lg:gap-x-1">
          {navigation.map((item) => (
            <NavLink to={item.href} key={item.name} end={item.href === "/"} className={desktopLinkClass}>
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1 lg:flex-1 lg:justify-end">
          <ThemeToggle />
          {userDocument && <Notifications />}
          <div className="hidden items-center gap-2 lg:flex">
            {userDocument ? (
              <>
                <Link to="/addcoupon" className="btn btn-primary btn-sm h-10 min-h-10 px-4">
                  <PiPlusBold className="size-4" aria-hidden />
                  Share a coupon
                </Link>
                <Avatar imgURL={userDocument.imageURL || null} />
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm h-10 min-h-10 px-4">
                  Log in
                </Link>
                <Link to="/signup" className="btn btn-secondary btn-sm h-10 min-h-10 px-4">
                  Sign up
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-square lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <PiListBold className="size-6" aria-hidden />
          </button>
        </div>
      </nav>

      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50 bg-neutral/40" aria-hidden="true" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto bg-base-100 px-4 py-3 sm:max-w-sm sm:border-l sm:border-base-300">
          <div className="flex h-10 items-center justify-between">
            <Logo />
            <button type="button" className="btn btn-ghost btn-square" onClick={closeMenu} aria-label="Close menu">
              <PiXBold className="size-6" aria-hidden />
            </button>
          </div>
          <div className="mt-6 space-y-1">
            {navigation.map((item) => (
              <NavLink
                to={item.href}
                key={item.name}
                end={item.href === "/"}
                className={mobileLinkClass}
                onClick={closeMenu}
              >
                {item.name}
              </NavLink>
            ))}
            <NavLink to="/feedback" state={{ from: pathname }} className={mobileLinkClass} onClick={closeMenu}>
              Feedback
            </NavLink>
          </div>
          <div className="perf-x mt-6 w-full text-base-300" aria-hidden="true" />
          <div className="mt-6 space-y-1">
            {userDocument ? (
              <>
                <NavLink to="/profile" className={mobileLinkClass} onClick={closeMenu}>
                  Profile
                </NavLink>
                <NavLink to="/addcoupon" className={mobileLinkClass} onClick={closeMenu}>
                  Share a coupon
                </NavLink>
                <button type="button" className={`${mobileLinkClass({ isActive: false })} w-full text-left`} onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/signup" className="btn btn-primary w-full" onClick={closeMenu}>
                  Sign up
                </Link>
                <Link to="/login" className="btn btn-ghost w-full" onClick={closeMenu}>
                  Log in
                </Link>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default Navbar;
