import { PiArrowRightBold, PiMagnifyingGlassBold, PiPlusBold } from "react-icons/pi";
import { getSearches, SEARCH_LOG_LIMIT } from "../../database/searches";
import { groupSearches, popularCoupons, storeStats } from "../../logic/analytics";
import { BrandImage } from "../coupons/components/CouponCard";
import { collectionsList } from "../../../firebaseCollections";
import { couponPath } from "../../logic/couponLinks";
import LoadError from "../../components/ui/LoadError";
import useCouponFeed from "../../hooks/useCouponFeed";
import { AdminLayout } from "./components/AdminSidebar";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import React, { useMemo, useState } from "react";

const DAY = 24 * 60 * 60 * 1000;
const PERIODS = [7, 30, 90] as const;
type Period = (typeof PERIODS)[number];
const LIST_SIZE = 10;

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

const ago = (ms: number) => {
  const days = Math.floor((Date.now() - ms) / DAY);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
};

const Tile = ({ label, value, detail }: { label: string; value: React.ReactNode; detail?: React.ReactNode }) => (
  <div className="h-full rounded-box border border-base-300 bg-base-100 p-5">
    <span className="text-sm font-semibold text-base-content/60">{label}</span>
    <span className="mt-2 block font-display text-5xl font-extrabold leading-none tracking-tight">{value}</span>
    {detail && <span className="mt-2 block text-sm text-base-content/70">{detail}</span>}
  </div>
);

const Panel = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <section className="rounded-box border border-base-300 bg-base-100 p-5">
    <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
    <p className="mt-1 text-sm text-base-content/70">{description}</p>
    <div className="mt-4">{children}</div>
  </section>
);

// Thin bar under a row, so the biggest numbers stand out at a glance.
const Meter = ({ value, max }: { value: number; max: number }) => (
  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-base-200" aria-hidden>
    <span className="block h-full rounded-full bg-accent" style={{ width: `${max > 0 ? Math.max(4, (value / max) * 100) : 0}%` }} />
  </span>
);

const Empty = ({ children }: { children: React.ReactNode }) => <p className="py-2 text-sm text-base-content/60">{children}</p>;

const searchLink = (term: string) => `/coupons?q=${encodeURIComponent(term)}`;

// /admin/analytics: what people look for and use, so the admin knows which coupons to add next.
// Stores and coupons come from the public feeds (all-time counters); searches come from the
// Searches log (admin-only reads) for the chosen period.
const AdminAnalytics = () => {
  const [period, setPeriod] = useState<Period>(30);
  const store = useCouponFeed(collectionsList.coupons);
  const social = useCouponFeed(collectionsList.socialCoupons);
  const searches = useQuery({
    queryKey: ["searches", period],
    queryFn: () => getSearches(new Date(Date.now() - period * DAY)),
  });

  const stats = useMemo(() => {
    const all = [...(store.data ?? []), ...(social.data ?? [])];
    const logs = searches.data ?? [];
    const terms = groupSearches(logs, all);
    const empty = logs.filter((log) => log.results === 0).length;
    return {
      searches: logs.length,
      empty,
      emptyRate: logs.length > 0 ? Math.round((empty / logs.length) * 100) : null,
      hitLimit: logs.length >= SEARCH_LOG_LIMIT,
      terms,
      // Searched for, and still nothing live matches it today.
      missing: terms.filter((t) => t.liveMatches === 0),
      stores: storeStats(all, terms),
      coupons: popularCoupons(all),
      copiesTracked: all.some((c) => c.copies !== undefined),
      copies: all.reduce((sum, c) => sum + (c.copies ?? 0), 0),
      worked: all.reduce((sum, c) => sum + (c.likes ?? 0), 0),
      failed: all.reduce((sum, c) => sum + (c.dislikes ?? 0), 0),
    };
  }, [store.data, social.data, searches.data]);

  const isPending = store.isPending || social.isPending;
  const isError = store.isError || social.isError;
  const searchesReady = !searches.isPending && !searches.isError;

  const topTerms = stats.terms.slice(0, LIST_SIZE);
  const missing = stats.missing.slice(0, LIST_SIZE);
  const stores = stats.stores.slice(0, LIST_SIZE);
  const coupons = stats.coupons.slice(0, LIST_SIZE);

  const searchPanelBody = (content: React.ReactNode) =>
    searches.isPending ? (
      <div className="skeleton h-40 rounded-box" role="status" aria-label="Loading searches" />
    ) : searches.isError ? (
      <LoadError what="searches" onRetry={() => searches.refetch()} />
    ) : (
      content
    );

  return (
    <AdminLayout title="Analytics" description="What people search for, copy and say works, so you know which coupons to add next.">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-base-content/70">Searches from the last</span>
        <div role="group" aria-label="Period" className="flex gap-2">
          {PERIODS.map((days) => (
            <button
              key={days}
              type="button"
              aria-pressed={period === days}
              onClick={() => setPeriod(days)}
              className={`btn btn-sm h-9 min-h-9 rounded-btn px-4 ${period === days ? "btn-primary" : "btn-ghost border border-base-300"}`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading analytics">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-32 rounded-box" />
          ))}
        </div>
      ) : isError ? (
        <LoadError what="analytics" onRetry={() => [store.refetch(), social.refetch()]} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile
              label={`Searches, last ${period} days`}
              value={searchesReady ? stats.searches.toLocaleString() : "…"}
              detail={searchesReady ? plural(stats.terms.length, "different search", "different searches") : undefined}
            />
            <Tile
              label="Found nothing"
              value={searchesReady ? (stats.emptyRate === null ? "-" : `${stats.emptyRate}%`) : "…"}
              detail={searchesReady ? `${plural(stats.empty, "search", "searches")} with no live coupon` : undefined}
            />
            <Tile
              label="Codes copied"
              value={stats.copiesTracked ? stats.copies.toLocaleString() : "-"}
              detail={stats.copiesTracked ? "All time" : "Counting starts once copy tracking is live"}
            />
            <Tile label="Said it worked" value={stats.worked.toLocaleString()} detail={`All time · ${stats.failed.toLocaleString()} said it didn't`} />
          </div>

          {stats.hitLimit && (
            <p className="text-sm text-base-content/70">
              Showing the newest {SEARCH_LOG_LIMIT.toLocaleString()} searches. Pick a shorter period to see all of them.
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title="Searched, nothing found"
              description="People looked for these and Coupo still has no live coupon for them. Good ones to add next."
            >
              {searchPanelBody(
                missing.length === 0 ? (
                  <Empty>{stats.searches === 0 ? "No searches yet in this period." : "Every search finds a live coupon right now."}</Empty>
                ) : (
                  <>
                    <ol>
                      {missing.map((t) => (
                        <li key={t.term} className="py-2">
                          <div className="flex items-center gap-3">
                            <Link to={searchLink(t.term)} className="min-w-0 flex-1 truncate font-bold hover:underline">
                              {t.term}
                            </Link>
                            <span className="shrink-0 text-right text-sm font-semibold">
                              {plural(t.count, "search", "searches")}
                              <span className="block text-xs font-normal text-base-content/60">last {ago(t.lastAt)}</span>
                            </span>
                          </div>
                          <Meter value={t.count} max={missing[0].count} />
                        </li>
                      ))}
                    </ol>
                    <Link to="/admin/add" className="btn btn-secondary btn-sm mt-4 h-10 min-h-10 px-4">
                      <PiPlusBold aria-hidden />
                      Add a coupon
                    </Link>
                  </>
                )
              )}
            </Panel>

            <Panel title="Top searches" description="What people search for most, and how many live coupons each finds today.">
              {searchPanelBody(
                topTerms.length === 0 ? (
                  <Empty>No searches yet in this period.</Empty>
                ) : (
                  <ol>
                    {topTerms.map((t) => (
                      <li key={t.term} className="py-2">
                        <div className="flex items-center gap-3">
                          <PiMagnifyingGlassBold className="size-4 shrink-0 text-base-content/50" aria-hidden />
                          <Link to={searchLink(t.term)} className="min-w-0 flex-1 truncate font-bold hover:underline">
                            {t.term}
                          </Link>
                          <span className="shrink-0 text-right text-sm font-semibold">
                            {plural(t.count, "search", "searches")}
                            <span className={`block text-xs font-normal ${t.liveMatches === 0 ? "text-error" : "text-base-content/60"}`}>
                              {t.liveMatches === 0 ? "No live coupons" : plural(t.liveMatches, "live coupon")}
                            </span>
                          </span>
                        </div>
                        <Meter value={t.count} max={topTerms[0].count} />
                      </li>
                    ))}
                  </ol>
                )
              )}
            </Panel>

            <Panel
              title="Popular stores"
              description="Ranked by copies, “worked” votes and searches that name the store. Stores with no live coupon need a fresh one."
            >
              {stores.length === 0 ? (
                <Empty>No coupons yet.</Empty>
              ) : (
                <ol>
                  {stores.map((s) => (
                    <li key={s.key} className="py-2">
                      <div className="flex items-center gap-3">
                        <BrandImage name={s.name} src={s.imgUrl} className="size-9" />
                        <span className="min-w-0 flex-1">
                          <Link
                            to={`/coupons?brand=${encodeURIComponent(s.name)}&expired=show`}
                            className="block truncate font-bold capitalize hover:underline"
                          >
                            {s.name}
                          </Link>
                          <span className={`block text-xs ${s.live === 0 ? "font-semibold text-error" : "text-base-content/60"}`}>
                            {s.live === 0 ? "No live coupons" : `${plural(s.live, "live coupon")} of ${s.coupons}`}
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-xs text-base-content/70">
                          {stats.copiesTracked && <span className="block">{plural(s.copies, "copy", "copies")}</span>}
                          <span className="block">{s.worked.toLocaleString()} worked</span>
                          <span className="block">{plural(s.searches, "search", "searches")}</span>
                        </span>
                      </div>
                      <Meter value={s.score} max={stores[0].score} />
                    </li>
                  ))}
                </ol>
              )}
            </Panel>

            <Panel
              title="Popular coupons"
              description={stats.copiesTracked ? "Most copied codes, then most “worked” votes. All time." : "Most “worked” votes. All time."}
            >
              {coupons.length === 0 ? (
                <Empty>No coupon has been copied or voted on yet.</Empty>
              ) : (
                <ol>
                  {coupons.map((c) => {
                    const votes = (c.likes ?? 0) + (c.dislikes ?? 0);
                    return (
                      <li key={`${c.type}-${c.id}`}>
                        <Link
                          to={couponPath(c)}
                          className="-mx-2 flex items-center gap-3 rounded-btn px-2 py-2 transition-colors hover:bg-base-200"
                        >
                          <BrandImage name={c.name} src={c.imgUrl} className="size-9" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold capitalize">{c.name}</span>
                            <span className="block truncate font-mono text-xs font-bold uppercase tracking-wider text-base-content/60">
                              {c.code}
                            </span>
                          </span>
                          <span className="shrink-0 text-right text-sm font-semibold">
                            {stats.copiesTracked && <span className="block">{plural(c.copies ?? 0, "copy", "copies")}</span>}
                            <span className="block text-xs font-normal text-base-content/60">
                              {votes > 0 ? `${Math.round(((c.likes ?? 0) / votes) * 100)}% worked` : "No votes"}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
              <Link to="/admin/coupons" className="btn btn-ghost btn-sm mt-3 h-9 min-h-9 px-3 text-sm">
                All coupons
                <PiArrowRightBold aria-hidden />
              </Link>
            </Panel>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;
