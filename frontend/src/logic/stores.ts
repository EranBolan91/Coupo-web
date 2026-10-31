import { Coupon } from "../types/CouponType";
import { Timestamp } from "firebase/firestore";
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

// What store lists need (store list, similar stores). Built from a Stores/{slug} summary (storeFromDoc).
export interface StoreInfo {
  slug: string;
  name: string;
  imgUrl: string;
  activeCount: number;
  bestDiscount: number;
  categories: string[];
}

// One store with its coupons, for its own page.
export interface Store extends StoreInfo {
  coupons: Coupon[];
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
export const relatedStores = (store: StoreInfo, stores: StoreInfo[], count = 6) =>
  stores
    .filter((other) => other.slug !== store.slug && other.categories.some((c) => store.categories.includes(c)))
    .sort((a, b) => b.activeCount - a.activeCount || a.name.localeCompare(b.name))
    .slice(0, count);

// Same wording as storeDescription on the server.
export const storeDescription = (store: StoreInfo) => {
  const best = store.bestDiscount > 0 ? `, up to ${store.bestDiscount}% off` : "";
  const where = store.categories.length ? ` ${store.name} is in ${store.categories.join(", ")}.` : "";
  const count = store.activeCount;
  return count > 0
    ? `${count} working coupon code${count === 1 ? "" : "s"} for ${store.name}${best}, shared and checked by Coupo shoppers.${where}`
    : `No working ${store.name} coupon codes right now. See expired codes and coupons from similar stores on Coupo.${where}`;
};

// Stores/{slug}, written by the syncStore Cloud Function: each coupon's discount and expiry are kept
// so "working codes" is counted when the page is opened.
export interface StoreDoc {
  slug: string;
  name: string;
  imgUrl: string;
  categories: string[];
  offers: { discount: number; expiry: Timestamp | null }[];
  count: number;
}

export const storeFromDoc = (data: StoreDoc, now = Date.now()): StoreInfo => {
  const active = (data.offers ?? []).filter((offer) => (offer.expiry?.toMillis?.() ?? Infinity) >= now);
  return {
    slug: data.slug,
    name: data.name,
    imgUrl: data.imgUrl ?? "",
    categories: data.categories ?? [],
    activeCount: active.length,
    bestDiscount: Math.max(0, ...active.map((offer) => Number(offer.discount) || 0)),
  };
};
