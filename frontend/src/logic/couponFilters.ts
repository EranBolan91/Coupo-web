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
  { value: "discount-desc", label: "Biggest discount" },
  { value: "expiry-asc", label: "Expires soonest" },
  { value: "expiry-desc", label: "Expires latest" },
  { value: "brand-asc", label: "Brand (A-Z)" },
  { value: "brand-desc", label: "Brand (Z-A)" },
] as const;

export type CouponSort = (typeof couponSortOptions)[number]["value"];

const time = (value?: { toMillis: () => number }) => value?.toMillis?.() ?? 0;

// Returns a sorted copy. "newest" keeps the feed's order (newest first).
export const sortCoupons = (coupons: Coupon[], sort: CouponSort) => {
  const sorted = [...coupons];
  switch (sort) {
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
