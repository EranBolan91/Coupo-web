import { Coupon } from "../types/CouponType";

// True when every word of the search appears somewhere in the coupon (brand, code, category,
// details or who shared it). Case doesn't matter, and parts of words match: "tom hil" finds tommy-hilfiger.
export const matchesSearch = (coupon: Coupon, search: string) => {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = [coupon.name, coupon.code, coupon.category, coupon.description, coupon.username]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return words.every((word) => text.includes(word));
};

export const couponSortOptions = [
  { value: "newest", label: "Newest" },
  { value: "likes-desc", label: "Most liked" },
  { value: "discount-desc", label: "Biggest discount" },
  { value: "expiry-asc", label: "Expires soonest" },
  { value: "expiry-desc", label: "Expires latest" },
  { value: "brand-asc", label: "Brand (A-Z)" },
  { value: "brand-desc", label: "Brand (Z-A)" },
] as const;

export type CouponSort = (typeof couponSortOptions)[number]["value"];

const time = (value?: { toMillis: () => number }) => value?.toMillis?.() ?? 0;

// Returns a sorted copy, with expired coupons always after the active ones.
export const sortCoupons = (coupons: Coupon[], sort: CouponSort, now = Date.now()) => {
  const sorted = sortBy(coupons, sort);
  return [...sorted.filter((coupon) => !isExpired(coupon, now)), ...sorted.filter((coupon) => isExpired(coupon, now))];
};

// "newest" keeps the feed's order (newest first).
const sortBy = (coupons: Coupon[], sort: CouponSort) => {
  const sorted = [...coupons];
  switch (sort) {
    case "likes-desc":
      // Most likes first; on a tie, fewer dislikes first.
      return sorted.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0) || (a.dislikes ?? 0) - (b.dislikes ?? 0));
    case "discount-desc":
      return sorted.sort((a, b) => Number(b.discount) - Number(a.discount));
    case "expiry-asc":
      return sorted.sort((a, b) => time(a.expiry) - time(b.expiry));
    case "expiry-desc":
      return sorted.sort((a, b) => time(b.expiry) - time(a.expiry));
    case "brand-asc":
      return sorted.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    case "brand-desc":
      return sorted.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));
    default:
      return sorted;
  }
};

export const isCouponSort = (value: string | null): value is CouponSort =>
  couponSortOptions.some((option) => option.value === value);

// Minimum-discount choices in the filters ("" = any discount).
export const discountOptions = [
  { value: 10, label: "10% or more" },
  { value: 25, label: "25% or more" },
  { value: 50, label: "50% or more" },
] as const;

export interface CouponFilters {
  categories: string[];
  brands: string[];
  minDiscount: number;
  expiringSoon: boolean;
  // Expired coupons are hidden unless this is on.
  showExpired: boolean;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const lower = (value?: string) => (value ?? "").toLowerCase();

// A coupon with no expiry date never expires.
export const isExpired = (coupon: Coupon, now = Date.now()) => (coupon.expiry?.toMillis?.() ?? Infinity) < now;

// True when the coupon passes every active filter. An empty list or 0 means "no filter".
// "Expiring soon" means it hasn't expired yet and expires within the next 7 days.
export const matchesFilters = (coupon: Coupon, filters: CouponFilters, now = Date.now()) => {
  if (!filters.showExpired && isExpired(coupon, now)) return false;
  if (filters.categories.length > 0 && !filters.categories.map(lower).includes(lower(coupon.category))) return false;
  if (filters.brands.length > 0 && !filters.brands.map(lower).includes(lower(coupon.name))) return false;
  if (filters.minDiscount > 0 && Number(coupon.discount) < filters.minDiscount) return false;
  if (filters.expiringSoon) {
    const expiry = time(coupon.expiry);
    if (expiry < now || expiry > now + WEEK_MS) return false;
  }
  return true;
};

// Applies search and filters, and also counts the matching coupons that are expired, for the
// "Show expired" switch. Expired coupons are only in `results` when filters.showExpired is on.
export const filterCoupons = (coupons: Coupon[], search: string, filters: CouponFilters, now = Date.now()) => {
  const matching = coupons.filter(
    (coupon) => matchesSearch(coupon, search) && matchesFilters(coupon, { ...filters, showExpired: true }, now)
  );
  // When expired coupons are shown, they go after the active ones (keeping the chosen order within each).
  const active = matching.filter((coupon) => !isExpired(coupon, now));
  const results = filters.showExpired ? [...active, ...matching.filter((coupon) => isExpired(coupon, now))] : active;
  return { results, expiredCount: matching.filter((coupon) => isExpired(coupon, now)).length };
};

// Brand names that appear in a feed, once each (ignoring case), A-Z. Used for the brand filter,
// so every brand listed has at least one coupon.
export const brandsInFeed = (coupons: Coupon[]) => {
  const byKey = new Map<string, string>();
  coupons.forEach((coupon) => {
    const name = coupon.name?.trim();
    if (name && !byKey.has(name.toLowerCase())) byKey.set(name.toLowerCase(), name);
  });
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
};
