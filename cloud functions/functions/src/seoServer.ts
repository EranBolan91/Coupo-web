// Reads what the search-engine pages in seoPages.ts need, and builds them. Used by the couponPreview
// function in index.ts.
//
// - A store page reads only that store's coupons (storeSlug == slug) and the stores sharing one of
//   its categories, so its cost doesn't grow with the size of the site.
// - The store list reads the Stores summaries (one small document per store).
// - Category pages and the sitemap still read both feeds (cached 5 minutes per instance; Hosting
//   also caches the pages for 10 minutes and the sitemap for an hour).
import * as admin from "firebase-admin";
import { collectionsList } from "./firebaseCollections";
import {
  FeedCoupon,
  RenderedPage,
  StoreInfo,
  categoriesOf,
  categoriesPage,
  categoryPage,
  groupStores,
  storeSlug,
  storePage,
  storesPage,
} from "./seoPages";
import { couponCollections, storeCoupons, storeInfo, toFeedCoupon } from "./stores";

export { toFeedCoupon };

const TTL_MS = 5 * 60 * 1000;

// Keeps the last good value for TTL_MS, and keeps serving it if a refresh fails.
const cached = <T>(load: () => Promise<T>, label: string) => {
  let entry: { value: T; fetchedAt: number } | null = null;
  return async (): Promise<T> => {
    if (entry && Date.now() - entry.fetchedAt < TTL_MS) return entry.value;
    try {
      entry = { value: await load(), fetchedAt: Date.now() };
    } catch (error) {
      console.error(`seo: couldn't read ${label}`, (error as Error).message);
      if (!entry) throw error;
    }
    return entry.value;
  };
};

const fields = ["name", "code", "discount", "category", "description", "imgUrl", "username", "likes", "dislikes", "expiry", "createdAt", "updatedAt"];

// Every public coupon (store and social), for category pages and the sitemap.
export const getFeed = cached(async (): Promise<FeedCoupon[]> => {
  const db = admin.firestore();
  const lists = await Promise.all(
    couponCollections.map(async ([collectionName, type]) => {
      const snapshot = await db.collection(collectionName).select(...fields).get();
      return snapshot.docs.map((doc) => toFeedCoupon(doc.id, type, doc.data()));
    })
  );
  return lists.flat();
}, "the coupon feeds");

// Every store's summary (Stores collection), A-Z, working codes counted now.
export const getStores = cached(async (): Promise<StoreInfo[]> => {
  const snapshot = await admin.firestore().collection(collectionsList.stores).get();
  const now = Date.now();
  return snapshot.docs
    .map((doc) => storeInfo(doc.data(), now))
    .filter((store) => store.slug)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}, "the stores");

// Stores that share a category with these (Firestore allows up to 30 values in one query).
async function storesInCategories(categories: string[]): Promise<StoreInfo[]> {
  if (categories.length === 0) return [];
  const snapshot = await admin
    .firestore()
    .collection(collectionsList.stores)
    .where("categories", "array-contains-any", categories.slice(0, 30))
    .limit(50)
    .get();
  const now = Date.now();
  return snapshot.docs.map((doc) => storeInfo(doc.data(), now));
}

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

  const now = Date.now();
  if (section === "stores") return storesPage(await getStores());

  if (section === "categories" && !rawParam) {
    return categoriesPage(categoriesOf((await getFeed()).filter((c) => c.type === "coupon")));
  }

  const param = decode(rawParam);
  if (param === null) return notFound(clean);

  if (section === "store") {
    const slug = storeSlug(param);
    const store = slug ? groupStores(await storeCoupons(slug), now).find((s) => s.slug === slug) : undefined;
    if (!store) return notFound(clean);
    return storePage(store, await storesInCategories(store.categories), now);
  }

  const [coupons, stores] = await Promise.all([getFeed(), getStores()]);
  return categoryPage(param.toLowerCase().trim(), coupons, stores, now) ?? notFound(clean);
}

const notFound = (path: string): RenderedPage => ({
  status: 404,
  body: "",
  page: { title: "Page not found", description: "This page isn't on Coupo.", path, noindex: true },
});
