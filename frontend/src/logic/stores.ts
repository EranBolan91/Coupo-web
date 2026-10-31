import { Coupon } from "../types/CouponType";
import { isExpired } from "./couponFilters";

// Same as storeSlug in "cloud functions/functions/src/seoPages.ts"; keep them identical, or store links
// from search results stop matching. "Tommy Hilfiger" -> "tommy-hilfiger". Letters of any language are kept.
export const storeSlug = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

// Page of one store: /store/{slug}.
export const storePath = (name: string) => `/store/${encodeURIComponent(storeSlug(name))}`;

export const categoryPath = (category: string) => `/categories/${encodeURIComponent(category.toLowerCase())}`;

export interface Store {
  slug: string;
  name: string;
  imgUrl: string;
  coupons: Coupon[];
  activeCount: number;
  bestDiscount: number;
  categories: string[];
}

// "October 2026", in UTC like the server-rendered page, so the title doesn't change when the app loads.
export const monthLabel = (date = new Date()) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

// Best first: codes people said worked, then bigger discounts, then newer.
const byQuality = (a: Coupon, b: Coupon) =>
  (b.likes ?? 0) - (b.dislikes ?? 0) - ((a.likes ?? 0) - (a.dislikes ?? 0)) ||
  Number(b.discount) - Number(a.discount) ||
  (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);

// Groups coupons (from either feed) by store name, ignoring case and punctuation, A-Z.
// Same grouping as groupStores on the server.
export const groupStores = (coupons: Coupon[], now = Date.now()): Store[] => {
  const bySlug = new Map<string, Coupon[]>();
  coupons.forEach((coupon) => {
    const slug = storeSlug(coupon.name?.trim() ?? "");
    if (slug) bySlug.set(slug, [...(bySlug.get(slug) ?? []), coupon]);
  });
  return [...bySlug.entries()]
    .map(([slug, list]) => {
      const coupons = [...list].sort(byQuality);
      const active = coupons.filter((coupon) => !isExpired(coupon, now));
      const names = new Map<string, number>();
      list.forEach((coupon) => names.set(coupon.name.trim(), (names.get(coupon.name.trim()) ?? 0) + 1));
      const spelling = [...names.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const newest = [...list].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return {
        slug,
        name: spelling.charAt(0).toUpperCase() + spelling.slice(1),
        imgUrl: newest.find((coupon) => coupon.imgUrl)?.imgUrl ?? "",
        coupons,
        activeCount: active.length,
        bestDiscount: Math.max(0, ...active.map((coupon) => Number(coupon.discount) || 0)),
        categories: [...new Set(list.map((coupon) => coupon.category?.toLowerCase().trim()).filter(Boolean))].sort(),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
};

// Stores that share a category with this one, most working codes first.
export const relatedStores = (store: Store, stores: Store[], count = 6) =>
  stores
    .filter((other) => other.slug !== store.slug && other.categories.some((c) => store.categories.includes(c)))
    .sort((a, b) => b.activeCount - a.activeCount || a.name.localeCompare(b.name))
    .slice(0, count);

// Same wording as storeDescription on the server.
export const storeDescription = (store: Store) => {
  const best = store.bestDiscount > 0 ? `, up to ${store.bestDiscount}% off` : "";
  const where = store.categories.length ? ` ${store.name} is in ${store.categories.join(", ")}.` : "";
  const count = store.activeCount;
  return count > 0
    ? `${count} working coupon code${count === 1 ? "" : "s"} for ${store.name}${best}, shared and checked by Coupo shoppers.${where}`
    : `No working ${store.name} coupon codes right now. See expired codes and coupons from similar stores on Coupo.${where}`;
};
