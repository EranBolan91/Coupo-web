import { PiArrowRightBold, PiFlagBold } from "react-icons/pi";
import WeeklyChart, { WeekBar } from "./components/WeeklyChart";
import { BrandImage } from "../coupons/components/CouponCard";
import { collectionsList } from "../../../firebaseCollections";
import { sharerPath, workedRate } from "../../logic/sharers";
import { couponPath } from "../../logic/couponLinks";
import LoadError from "../../components/ui/LoadError";
import useCouponFeed from "../../hooks/useCouponFeed";
import { AdminLayout } from "./components/AdminSidebar";
import { getUserCounts } from "../../database/stats";
import useReports from "../../hooks/useReports";
import useSharers from "../../hooks/useSharers";
import { Coupon } from "../../types/CouponType";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import React, { useMemo } from "react";

const DAY = 24 * 60 * 60 * 1000;
const WEEKS = 8;
const expiryOf = (c: Coupon) => c.expiry?.toMillis?.() ?? Infinity;
const createdOf = (c: Coupon) => c.createdAt?.toMillis?.() ?? 0;
const shortDate = (ms: number) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

// Monday 00:00 of the week that contains `ms`.
const weekStart = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
};

const Tile = ({ label, value, detail, to }: { label: string; value: React.ReactNode; detail?: React.ReactNode; to?: string }) => {
  const body = (
    <>
      <span className="text-sm font-semibold text-base-content/60">{label}</span>
      <span className="mt-2 block font-display text-5xl font-extrabold leading-none tracking-tight">{value}</span>
      {detail && <span className="mt-2 block text-sm text-base-content/70">{detail}</span>}
    </>
  );
  const className = "block h-full rounded-box border border-base-300 bg-base-100 p-5";
  return to ? (
    <Link to={to} className={`${className} transition-colors hover:border-base-content`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
};

const Panel = ({ title, link, children }: { title: string; link?: { to: string; label: string }; children: React.ReactNode }) => (
  <section className="rounded-box border border-base-300 bg-base-100 p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
      {link && (
        <Link to={link.to} className="btn btn-ghost btn-sm h-9 min-h-9 px-3 text-sm">
          {link.label}
          <PiArrowRightBold aria-hidden />
        </Link>
      )}
    </div>
    {children}
  </section>
);

const CouponLine = ({ coupon, aside }: { coupon: Coupon; aside: React.ReactNode }) => (
  <li>
    <Link to={couponPath(coupon)} className="-mx-2 flex items-center gap-3 rounded-btn px-2 py-2 transition-colors hover:bg-base-200">
      <BrandImage name={coupon.name} src={coupon.imgUrl} className="size-9" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold capitalize">{coupon.name}</span>
        <span className="block truncate font-mono text-xs font-bold uppercase tracking-wider text-base-content/60">{coupon.code}</span>
      </span>
      <span className="shrink-0 text-right text-sm font-semibold">{aside}</span>
    </Link>
  </li>
);

const Empty = ({ children }: { children: React.ReactNode }) => <p className="py-2 text-sm text-base-content/60">{children}</p>;

// /admin: how Coupo is doing at a glance. Everything except the user count comes from data the
// app already loads (both coupon feeds and the reports).
const AdminDashboard = () => {
  const store = useCouponFeed(collectionsList.coupons);
  const social = useCouponFeed(collectionsList.socialCoupons);
  const reports = useReports();
  const { sharers } = useSharers();
  const weekAgo = useMemo(() => new Date(Date.now() - 7 * DAY), []);
  const users = useQuery({ queryKey: ["userCounts"], queryFn: () => getUserCounts(weekAgo) });

  const stats = useMemo(() => {
    const now = Date.now();
    const all = [...(store.data ?? []), ...(social.data ?? [])];
    const active = all.filter((c) => expiryOf(c) >= now);
    const likes = all.reduce((sum, c) => sum + (c.likes ?? 0), 0);
    const dislikes = all.reduce((sum, c) => sum + (c.dislikes ?? 0), 0);

    const thisWeek = weekStart(now);
    const weeks: WeekBar[] = Array.from({ length: WEEKS }, (_, i) => {
      const start = thisWeek - (WEEKS - 1 - i) * 7 * DAY;
      const end = start + 7 * DAY;
      return {
        label: i === WEEKS - 1 ? "This week" : shortDate(start),
        fullLabel: `Week of ${new Date(start).toLocaleDateString(undefined, { day: "numeric", month: "long" })}`,
        count: all.filter((c) => createdOf(c) >= start && createdOf(c) < end).length,
      };
    });

    const reportCounts = (reports.data ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.couponID] = (acc[r.couponID] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: all.length,
      active: active.length,
      activeStore: active.filter((c) => c.type !== "socialCoupon").length,
      activeSocial: active.filter((c) => c.type === "socialCoupon").length,
      newThisWeek: all.filter((c) => createdOf(c) >= now - 7 * DAY).length,
      likes,
      dislikes,
      weeks,
      expiringSoon: active.filter((c) => expiryOf(c) - now <= 7 * DAY).sort((a, b) => expiryOf(a) - expiryOf(b)),
      mostLiked: [...all].filter((c) => (c.likes ?? 0) > 0).sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 5),
      mostReported: Object.entries(reportCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => ({ coupon: all.find((c) => c.id === id), count }))
        .filter((r): r is { coupon: Coupon; count: number } => !!r.coupon)
        .slice(0, 5),
      reportedCoupons: Object.keys(reportCounts).length,
    };
  }, [store.data, social.data, reports.data]);

  const isPending = store.isPending || social.isPending;
  const isError = store.isError || social.isError;
  const rate = workedRate(stats);

  return (
    <AdminLayout title="Dashboard" description="How Coupo is doing right now.">
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading dashboard">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-32 rounded-box" />
          ))}
        </div>
      ) : isError ? (
        <LoadError what="dashboard" onRetry={() => [store.refetch(), social.refetch()]} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile
              label="Live coupons"
              value={stats.active}
              detail={`${stats.activeStore} store, ${stats.activeSocial} social · ${stats.total - stats.active} expired`}
              to="/admin/coupons"
            />
            <Tile label="Added this week" value={stats.newThisWeek} detail={`${stats.expiringSoon.length} expire in the next 7 days`} />
            <Tile
              label="Users"
              value={users.isPending ? "…" : users.isError ? "-" : users.data.total}
              detail={users.isError ? "Couldn't count users" : users.data ? `${users.data.recent} joined this week` : undefined}
              to="/admin/users"
            />
            <Tile
              label="Said it worked"
              value={rate === null ? "-" : `${rate}%`}
              detail={`${stats.likes} worked, ${stats.dislikes} didn't`}
            />
          </div>

          {stats.reportedCoupons > 0 && (
            <Link
              to="/admin/reports"
              className="flex items-center gap-3 rounded-box border-2 border-error/40 bg-error/10 px-5 py-4 font-semibold transition-colors hover:border-error"
            >
              <PiFlagBold className="size-5 text-error" aria-hidden />
              <span className="flex-1">
                {stats.reportedCoupons === 1 ? "1 coupon was reported" : `${stats.reportedCoupons} coupons were reported`}
              </span>
              <PiArrowRightBold aria-hidden />
            </Link>
          )}

          <Panel title="Coupons added per week">
            <WeeklyChart weeks={stats.weeks} title={`Coupons added per week, last ${WEEKS} weeks`} />
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Most liked" link={{ to: "/admin/coupons", label: "All coupons" }}>
              {stats.mostLiked.length === 0 ? (
                <Empty>No likes yet.</Empty>
              ) : (
                <ol>
                  {stats.mostLiked.map((c) => (
                    <CouponLine key={`${c.type}-${c.id}`} coupon={c} aside={`${c.likes} ${c.likes === 1 ? "like" : "likes"}`} />
                  ))}
                </ol>
              )}
            </Panel>
            <Panel title="Expiring in 7 days">
              {stats.expiringSoon.length === 0 ? (
                <Empty>Nothing expires this week.</Empty>
              ) : (
                <ol>
                  {stats.expiringSoon.slice(0, 5).map((c) => (
                    <CouponLine key={`${c.type}-${c.id}`} coupon={c} aside={shortDate(expiryOf(c))} />
                  ))}
                </ol>
              )}
            </Panel>
            <Panel title="Most reported" link={{ to: "/admin/reports", label: "Reports" }}>
              {reports.isError ? (
                <Empty>Couldn't load reports.</Empty>
              ) : stats.mostReported.length === 0 ? (
                <Empty>No open reports.</Empty>
              ) : (
                <ol>
                  {stats.mostReported.map(({ coupon, count }) => (
                    <CouponLine
                      key={`${coupon.type}-${coupon.id}`}
                      coupon={coupon}
                      aside={<span className="text-error">{count === 1 ? "1 report" : `${count} reports`}</span>}
                    />
                  ))}
                </ol>
              )}
            </Panel>
            <Panel title="Top sharers" link={{ to: "/top-sharers", label: "Leaderboard" }}>
              {sharers.length === 0 ? (
                <Empty>Nobody has shared a coupon yet.</Empty>
              ) : (
                <ol>
                  {sharers.slice(0, 5).map((s) => (
                    <li key={s.userID}>
                      <Link
                        to={sharerPath(s.userID)}
                        className="-mx-2 flex items-center gap-3 rounded-btn px-2 py-2 transition-colors hover:bg-base-200"
                      >
                        <span className="w-8 shrink-0 font-display font-extrabold text-base-content/60">#{s.rank}</span>
                        <span className="min-w-0 flex-1 truncate font-bold">{s.name}</span>
                        <span className="shrink-0 text-sm font-semibold">
                          {s.likes} {s.likes === 1 ? "like" : "likes"} · {s.coupons.length}{" "}
                          {s.coupons.length === 1 ? "coupon" : "coupons"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
