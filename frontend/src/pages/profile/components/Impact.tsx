import { useMonthLeaderboard, useSharerStats } from "../../../hooks/useSharerStats";
import { POINTS, badges, impactSentence, monthName, thisMonth } from "../../../logic/points";
import { PiCopyBold, PiThumbsDownBold, PiThumbsUpBold } from "react-icons/pi";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { getUserCoupons } from "../../../database/databaseCalls";
import { couponPath } from "../../../logic/couponLinks";
import EmptyState from "../../../components/ui/EmptyState";
import Badges from "../../../components/sharers/Badges";
import { Coupon } from "../../../types/CouponType";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const brand = (name: string) => (name ? name.charAt(0).toUpperCase() + name.slice(1) : "");

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <div className="flex flex-col rounded-box bg-base-100 px-5 py-4">
    <span className="font-display text-4xl font-extrabold leading-none tracking-tight">{value}</span>
    <span className="mt-1.5 text-sm font-semibold text-base-content/60">{label}</span>
  </div>
);

// Profile "Impact" tab: points, rank this month, badges, and what happened with each coupon.
const Impact = () => {
  const uid = useCurrentUser()?.userUID;
  const { data: coupons = [], isPending } = useQuery<Coupon[]>({
    queryKey: ["usercoupons"],
    queryFn: () => getUserCoupons(uid ?? ""),
  });
  const stats = useSharerStats(uid);
  const leaderboard = useMonthLeaderboard();
  const month = thisMonth(stats.data);
  const rank = (leaderboard.data ?? []).findIndex((s) => s.userID === uid) + 1;

  if (isPending) return <div className="skeleton h-64 rounded-box" role="status" aria-label="Loading your impact" />;

  if (coupons.length === 0) {
    return (
      <EmptyState
        title="Your impact shows up here"
        description="Share a coupon. When people copy it or say it worked, you get points and badges."
        action={
          <Link to="/addcoupon" className="btn btn-primary">
            Share a coupon
          </Link>
        }
      />
    );
  }

  // The coupon list has only active coupons, so all-time numbers come from SharerStats when it has more.
  const copies = Math.max(stats.data?.copies ?? 0, coupons.reduce((sum, c) => sum + (c.copies ?? 0), 0));
  const worked = Math.max(stats.data?.worked ?? 0, coupons.reduce((sum, c) => sum + (c.likes ?? 0), 0));
  const failed = coupons.reduce((sum, c) => sum + (c.dislikes ?? 0), 0);
  const list = badges({ couponsShared: coupons.length, copies, worked, failed, monthRank: rank || undefined });
  const ranked = [...coupons].sort((a, b) => (b.copies ?? 0) + (b.likes ?? 0) - ((a.copies ?? 0) + (a.likes ?? 0)));

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="impact-points">
        <h2 id="impact-points" className="text-3xl font-extrabold tracking-tight">
          Points
        </h2>
        <p className="mt-1 text-base-content/70">
          You get {POINTS.copy} point when someone copies your code and {POINTS.worked} when someone says it worked.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat value={month.points} label={`Points in ${monthName()}`} />
          <Stat value={rank ? `#${rank}` : "-"} label="Rank this month" />
          <Stat value={stats.data?.points ?? 0} label="Points all time" />
          <Stat value={copies} label="Times copied" />
        </div>
        <Link to="/top-sharers" className="btn btn-ghost btn-sm mt-3 h-10 min-h-10 px-3">
          See this month's top sharers
        </Link>
      </section>

      <section aria-labelledby="impact-badges">
        <h2 id="impact-badges" className="mb-5 text-3xl font-extrabold tracking-tight">
          Badges
        </h2>
        <Badges badges={list} showLocked />
      </section>

      <section aria-labelledby="impact-coupons">
        <h2 id="impact-coupons" className="mb-5 text-3xl font-extrabold tracking-tight">
          Your active coupons
        </h2>
        <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
          {ranked.map((coupon) => (
            <li key={coupon.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
              <span className="min-w-0 flex-1">
                <Link to={couponPath(coupon)} className="block truncate font-bold hover:underline">
                  {brand(coupon.name)} <span className="font-mono text-sm uppercase text-base-content/60">{coupon.code}</span>
                </Link>
                <span className="block text-sm text-base-content/70">{impactSentence(coupon)}</span>
              </span>
              <span className="flex shrink-0 gap-4 text-sm font-semibold text-base-content/70">
                <span className="inline-flex items-center gap-1" title="Copied">
                  <PiCopyBold aria-hidden /> {coupon.copies ?? 0}
                  <span className="sr-only">copies</span>
                </span>
                <span className="inline-flex items-center gap-1" title="Worked">
                  <PiThumbsUpBold aria-hidden /> {coupon.likes ?? 0}
                  <span className="sr-only">said it worked</span>
                </span>
                <span className="inline-flex items-center gap-1" title="Didn't work">
                  <PiThumbsDownBold aria-hidden /> {coupon.dislikes ?? 0}
                  <span className="sr-only">said it didn't work</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Impact;
