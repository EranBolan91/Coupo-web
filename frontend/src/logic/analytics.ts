import { filterCoupons, CouponFilters, isExpired } from "./couponFilters";
import { SearchLog } from "../database/searches";
import { Coupon } from "../types/CouponType";

const noFilters: CouponFilters = { categories: [], brands: [], minDiscount: 0, expiringSoon: false, showExpired: false };
const time = (log: SearchLog) => log.createdAt?.toMillis?.() ?? 0;

export type SearchTerm = {
  term: string;
  count: number;
  // How many of those searches found nothing at the time.
  emptyCount: number;
  lastAt: number;
  // Live coupons matching the term right now (checked against today's feeds, not the log).
  liveMatches: number;
};

// Groups the search log by term, most searched first. `coupons` is every coupon from both feeds,
// used to check whether each term finds anything today (a coupon may have been added since).
export const groupSearches = (logs: SearchLog[], coupons: Coupon[], now = Date.now()): SearchTerm[] => {
  const byTerm = new Map<string, Omit<SearchTerm, "liveMatches">>();
  logs.forEach((log) => {
    if (!log.term) return;
    const entry = byTerm.get(log.term) ?? { term: log.term, count: 0, emptyCount: 0, lastAt: 0 };
    entry.count += 1;
    if (log.results === 0) entry.emptyCount += 1;
    entry.lastAt = Math.max(entry.lastAt, time(log));
    byTerm.set(log.term, entry);
  });
  return [...byTerm.values()]
    .map((entry) => ({ ...entry, liveMatches: filterCoupons(coupons, entry.term, noFilters, now).results.length }))
    .sort((a, b) => b.count - a.count || b.lastAt - a.lastAt);
};

export type StoreStats = {
  key: string;
  name: string;
  imgUrl?: string;
  coupons: number;
  live: number;
  copies: number;
  worked: number;
  failed: number;
  // Searches whose text names this store (e.g. "nike" or "nike shoes" for Nike).
  searches: number;
  score: number;
};

// One row per store (coupon `name`, ignoring case), busiest first. The score adds copies,
// "worked" votes and searches, so a store people look for but rarely find still ranks high.
export const storeStats = (coupons: Coupon[], terms: SearchTerm[], now = Date.now()): StoreStats[] => {
  const byKey = new Map<string, StoreStats>();
  coupons.forEach((coupon) => {
    const name = coupon.name?.trim();
    if (!name) return;
    const key = name.toLowerCase();
    const store = byKey.get(key) ?? {
      key, name, imgUrl: coupon.imgUrl, coupons: 0, live: 0, copies: 0, worked: 0, failed: 0, searches: 0, score: 0,
    };
    store.coupons += 1;
    if (!isExpired(coupon, now)) store.live += 1;
    store.copies += coupon.copies ?? 0;
    store.worked += coupon.likes ?? 0;
    store.failed += coupon.dislikes ?? 0;
    store.imgUrl ||= coupon.imgUrl;
    byKey.set(key, store);
  });

  byKey.forEach((store) => {
    store.searches = terms
      .filter((t) => ` ${t.term} `.includes(` ${store.key} `))
      .reduce((sum, t) => sum + t.count, 0);
    store.score = store.copies + store.worked + store.searches;
  });

  return [...byKey.values()].sort((a, b) => b.score - a.score || b.coupons - a.coupons || a.name.localeCompare(b.name));
};

// Most used coupons: copies first (once copy counts exist), then "worked" votes.
export const popularCoupons = (coupons: Coupon[]) =>
  coupons
    .filter((c) => (c.copies ?? 0) + (c.likes ?? 0) > 0)
    .sort((a, b) => (b.copies ?? 0) - (a.copies ?? 0) || (b.likes ?? 0) - (a.likes ?? 0));
