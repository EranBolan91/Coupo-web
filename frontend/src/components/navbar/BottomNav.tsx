import { PiHouseBold, PiHouseFill, PiPlusBold, PiStorefrontBold, PiStorefrontFill, PiTagBold, PiTagFill, PiUserCircleBold, PiUserCircleFill } from "react-icons/pi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { NavLink } from "react-router-dom";
import type { IconType } from "react-icons";

type Tab = { name: string; href: string; icon: IconType; activeIcon: IconType };

// Phone tab bar (hidden from lg up): the main places one thumb-tap away, with "Share" in the middle.
// Pages get room for it from the `pb-tabbar` class on the app wrapper (index.css).
const BottomNav = () => {
  const userDocument = useCurrentUser();
  const left: Tab[] = [
    { name: "Home", href: "/", icon: PiHouseBold, activeIcon: PiHouseFill },
    { name: "Coupons", href: "/coupons", icon: PiTagBold, activeIcon: PiTagFill },
  ];
  const right: Tab[] = [
    { name: "Stores", href: "/stores", icon: PiStorefrontBold, activeIcon: PiStorefrontFill },
    userDocument
      ? { name: "Profile", href: "/profile", icon: PiUserCircleBold, activeIcon: PiUserCircleFill }
      : { name: "Log in", href: "/login", icon: PiUserCircleBold, activeIcon: PiUserCircleFill },
  ];

  const renderTab = ({ name, href, icon: Icon, activeIcon: ActiveIcon }: Tab) => (
    <li key={href} className="flex-1">
      <NavLink
        to={href}
        end={href === "/"}
        className={({ isActive }) =>
          `flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.7rem] font-bold transition-colors ${
            isActive ? "text-accent" : "text-base-content/60 active:bg-base-200"
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive ? <ActiveIcon className="size-6" aria-hidden /> : <Icon className="size-6" aria-hidden />}
            {name}
          </>
        )}
      </NavLink>
    </li>
  );

  return (
    <nav
      aria-label="Quick"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-base-300/70 bg-base-100/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-center px-2 py-1">
        {left.map(renderTab)}
        <li className="flex flex-1 justify-center">
          <NavLink
            to="/addcoupon"
            aria-label="Share a coupon"
            className="-mt-7 flex size-[3.75rem] items-center justify-center rounded-full bg-primary text-primary-content shadow-lift ring-4 ring-base-100 transition-transform duration-200 active:scale-95"
          >
            <PiPlusBold className="size-7" aria-hidden />
          </NavLink>
        </li>
        {right.map(renderTab)}
      </ul>
    </nav>
  );
};

export default BottomNav;
