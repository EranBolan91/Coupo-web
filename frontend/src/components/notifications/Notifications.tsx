import { PiBellBold, PiClockCountdownBold, PiFlagBold, PiHandHeartBold } from "react-icons/pi";
import useNotifications from "../../hooks/useNotifications";
import { Link } from "react-router-dom";
import { useState } from "react";

// Bell in the navbar (signed-in users). Opening it marks the notifications as seen.
// On phones the panel is fixed under the navbar, full width, so it never runs off the screen.
const Notifications = () => {
  const { items, unseenCount, seenKeys, markAllSeen } = useNotifications();
  // Keep "new" markers visible while the menu is open, even after they are saved as seen.
  const [newWhenOpened, setNewWhenOpened] = useState<Set<string>>(new Set());

  const open = () => {
    setNewWhenOpened(new Set(items.filter((item) => !seenKeys.has(item.key)).map((item) => item.key)));
    markAllSeen();
  };

  const close = () => (document.activeElement as HTMLElement | null)?.blur();

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle relative"
        aria-label={unseenCount ? `Notifications, ${unseenCount} new` : "Notifications"}
        onFocus={open}
      >
        <PiBellBold className="size-6" aria-hidden />
        {unseenCount > 0 && (
          <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-error text-[0.7rem] font-bold text-error-content ring-2 ring-base-100" aria-hidden>
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </div>
      <div
        tabIndex={0}
        className="dropdown-content z-50 mt-3 w-[22rem] rounded-box border border-base-300 bg-base-100 p-2 shadow-lg max-sm:!fixed max-sm:!left-4 max-sm:!right-4 max-sm:!top-[4.25rem] max-sm:!mt-0 max-sm:!w-auto"
      >
        <p className="px-3 pb-2 pt-2 font-display text-lg font-extrabold">Notifications</p>
        {items.length === 0 ? (
          <div className="px-3 pb-4 text-sm text-base-content/70">
            <p className="font-semibold text-base-content">You're all caught up</p>
            <p className="mt-1">We'll let you know here when a coupon you saved is about to expire, or when your codes help people.</p>
          </div>
        ) : (
          <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.kind === "reports" ? PiFlagBold : item.kind === "impact" ? PiHandHeartBold : PiClockCountdownBold;
              const isNew = newWhenOpened.has(item.key);
              return (
                <li key={item.key}>
                  <Link to={item.href} onClick={close} className="flex gap-3 rounded-btn px-3 py-2.5 transition-colors hover:bg-base-200">
                    <span
                      className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${
                        item.kind === "reports" ? "bg-error/15 text-error" : "bg-primary text-primary-content"
                      }`}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold leading-snug">
                        {item.title}
                        {isNew && <span className="ml-2 align-middle text-[0.65rem] font-bold uppercase tracking-wider text-accent">New</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-base-content/70">{item.text}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
