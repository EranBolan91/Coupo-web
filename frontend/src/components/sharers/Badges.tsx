import { PiFireFill, PiHandHeartFill, PiLockSimpleBold, PiPiggyBankFill, PiSealCheckFill, PiShieldCheckFill, PiTrophyFill } from "react-icons/pi";
import { Badge } from "../../logic/points";
import type { IconType } from "react-icons";

const icons: Record<string, IconType> = {
  "first-share": PiSealCheckFill,
  helper: PiHandHeartFill,
  "crowd-pleaser": PiFireFill,
  "money-saver": PiPiggyBankFill,
  trusted: PiShieldCheckFill,
  "top-three": PiTrophyFill,
};

// Earned badges are lime stamps. With `showLocked`, the rest are listed too, with how far along they are.
const Badges = ({ badges, showLocked = false }: { badges: Badge[]; showLocked?: boolean }) => {
  const shown = showLocked ? badges : badges.filter((b) => b.earned);
  if (shown.length === 0) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Badges">
      {shown.map((badge) => {
        const Icon = icons[badge.id] ?? PiSealCheckFill;
        return (
          <li
            key={badge.id}
            className={`flex items-center gap-4 rounded-box p-4 ${
              badge.earned ? "border-2 border-base-content bg-primary text-primary-content" : "border-2 border-dashed border-base-300 bg-base-100"
            }`}
          >
            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
                badge.earned ? "-rotate-6 bg-primary-content text-primary" : "bg-base-200 text-base-content/40"
              }`}
            >
              {badge.earned ? <Icon className="size-6" aria-hidden /> : <PiLockSimpleBold className="size-5" aria-hidden />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-extrabold leading-tight tracking-tight">{badge.name}</span>
              <span className={`block text-sm ${badge.earned ? "" : "text-base-content/60"}`}>
                {badge.earned ? badge.description : badge.hint}
              </span>
              {!badge.earned && (
                <span
                  className="mt-2 block h-1.5 overflow-hidden rounded-full bg-base-200"
                  role="progressbar"
                  aria-label={`${badge.name} progress`}
                  aria-valuenow={Math.round(badge.progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className="block h-full rounded-full bg-base-content/50" style={{ width: `${Math.round(badge.progress * 100)}%` }} />
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default Badges;
