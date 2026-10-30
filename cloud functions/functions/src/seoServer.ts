// Loads both public coupon feeds (cached for a few minutes) and builds the search-engine pages in
// seoPages.ts. Used by the couponPreview function in index.ts.
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { collectionsList } from "./firebaseCollections";
import {
  FeedCoupon,
  RenderedPage,
  categoriesOf,
  categoriesPage,
  categoryPage,
  groupStores,
  storeSlug,
  storePage,
  storesPage,
} from "./seoPages";

const FEED_TTL_MS = 5 * 60 * 1000;
let feed: { coupons: FeedCoupon[]; fetchedAt: number } | null = null;

const toDate = (value: unknown) => (value instanceof Timestamp ? value.toDate() : null);
const text = (value: unknown) => (typeof value === "string" ? value : "");

const fields = ["name", "code", "discount", "category", "description", "imgUrl", "username", "likes", "dislikes", "expiry", "createdAt", "updatedAt"];

// Every public coupon (store and social). Fine for a few thousand coupons; beyond that, store
// per-store counts in their own documents instead of reading the whole feed.
export async function getFeed(): Promise<FeedCoupon[]> {
  if (feed && Date.now() - feed.fetchedAt < FEED_TTL_MS) return feed.coupons;
  const db = admin.firestore();
  const read = async (collectionName: string, type: FeedCoupon["type"]) => {
    const snapshot = await db.collection(collectionName).select(...fields).get();
    return snapshot.docs.map((doc) => toFeedCoupon(doc.id, type, doc.data()));
  };
  try {
    const [coupons, social] = await Promise.all([
      read(collectionsList.coupons, "coupon"),
      read(collectionsList.socialCoupons, "socialCoupon"),
    ]);
    feed = { coupons: [...coupons, ...social], fetchedAt: Date.now() };
  } catch (error) {
    console.error("seo: couldn't read the coupon feeds", (error as Error).message);
    if (!feed) throw error;
    // Keep serving the last good copy.
  }
  return feed.coupons;
}

// Turns a Firestore coupon document into a FeedCoupon (for the coupon page).
export const toFeedCoupon = (id: string, type: FeedCoupon["type"], data: FirebaseFirestore.DocumentData): FeedCoupon => ({
  id,
  type,
  name: text(data.name).trim(),
  code: text(data.code),
  discount: Number(data.discount) || 0,
  category: text(data.category).toLowerCase().trim(),
  description: text(data.description),
  imgUrl: text(data.imgUrl),
  username: text(data.username),
  likes: Number(data.likes) || 0,
  dislikes: Number(data.dislikes) || 0,
  expiry: toDate(data.expiry),
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
});

const decode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

// Pages handled here: /stores, /store/{slug}, /categories, /categories/{name}.
// Returns null for other paths, and a 404 page for a store or category with no coupons.
export async function renderListingPage(path: string): Promise<RenderedPage | null> {
  const clean = path.replace(/\/+$/, "") || "/";
  const match = /^\/(stores|store|categories)(?:\/([^/]+))?$/.exec(clean);
  if (!match) return null;
  const [, section, rawParam] = match;
  if (section === "store" && !rawParam) return null;
  if (section === "stores" && rawParam) return null;

  const coupons = await getFeed();
  const now = Date.now();
  const stores = groupStores(coupons, now);

  if (section === "stores") return storesPage(stores);
  if (section === "categories" && !rawParam) return categoriesPage(categoriesOf(coupons.filter((c) => c.type === "coupon")));

  const param = decode(rawParam);
  if (param === null) return notFound(clean);

  if (section === "store") {
    const store = stores.find((s) => s.slug === storeSlug(param));
    return store ? storePage(store, stores, now) : notFound(clean);
  }
  return categoryPage(param.toLowerCase().trim(), coupons, stores, now) ?? notFound(clean);
}

const notFound = (path: string): RenderedPage => ({
  status: 404,
  body: "",
  page: { title: "Page not found", description: "This page isn't on Coupo.", path, noindex: true },
});
