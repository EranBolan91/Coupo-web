// Stores: every coupon (both public feeds) carries `storeSlug`, and Stores/{slug} holds a small
// summary of each store (name, logo, categories, and each coupon's discount and expiry). Both are
// written only here, by the syncStore triggers in index.ts, and by scripts/backfillStores.js.
// Store pages then read just one store's coupons (where storeSlug == slug) and the store list
// reads the summaries, instead of the whole feed.
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { collectionsList } from "./firebaseCollections";
import { FeedCoupon, StoreInfo, groupStores, isExpired, storeSlug } from "./seoPages";

const toDate = (value: unknown) => (value instanceof Timestamp ? value.toDate() : null);
const text = (value: unknown) => (typeof value === "string" ? value : "");

// A Firestore coupon document as a FeedCoupon (dates converted, missing fields filled in).
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

export const couponCollections: [string, FeedCoupon["type"]][] = [
  [collectionsList.coupons, "coupon"],
  [collectionsList.socialCoupons, "socialCoupon"],
];

// The slug a coupon document should have.
export const slugOf = (data: FirebaseFirestore.DocumentData | undefined) => storeSlug(text(data?.name).trim());

// Stores/{slug}. Each coupon's discount and expiry are kept (not just counts) so "working codes" stays
// right after a coupon expires, without anything being rewritten at that moment.
export type StoreDoc = {
  slug: string;
  name: string;
  imgUrl: string;
  categories: string[];
  offers: { discount: number; expiry: Timestamp | null }[];
  count: number;
  updatedAt: Timestamp | null;
};

// The summary for one store's coupons, or null when it has none.
export const summarize = (slug: string, coupons: FeedCoupon[]): StoreDoc | null => {
  const store = groupStores(coupons, Date.now()).find((s) => s.slug === slug);
  if (!store) return null;
  return {
    slug,
    name: store.name,
    imgUrl: store.imgUrl,
    categories: store.categories,
    offers: store.coupons.map((coupon) => ({
      discount: coupon.discount,
      expiry: coupon.expiry ? Timestamp.fromDate(coupon.expiry) : null,
    })),
    count: store.coupons.length,
    updatedAt: store.updatedAt ? Timestamp.fromDate(store.updatedAt) : null,
  };
};

// A Stores/{slug} document as StoreInfo, with working codes counted at `now`.
export const storeInfo = (data: FirebaseFirestore.DocumentData, now: number): StoreInfo => {
  const offers: { discount: number; expiry: Date | null }[] = Array.isArray(data.offers) ?
    data.offers.map((offer: { discount?: unknown; expiry?: unknown }) => ({
      discount: Number(offer.discount) || 0,
      expiry: toDate(offer.expiry),
    })) :
    [];
  const active = offers.filter((offer) => !isExpired(offer, now));
  return {
    slug: text(data.slug),
    name: text(data.name),
    imgUrl: text(data.imgUrl),
    categories: Array.isArray(data.categories) ? data.categories.filter((c: unknown) => typeof c === "string") : [],
    activeCount: active.length,
    bestDiscount: Math.max(0, ...active.map((offer) => offer.discount)),
    updatedAt: toDate(data.updatedAt),
  };
};

// One store's coupons from both feeds.
export async function storeCoupons(slug: string, tx?: FirebaseFirestore.Transaction): Promise<FeedCoupon[]> {
  const db = admin.firestore();
  const lists = await Promise.all(
    couponCollections.map(async ([collectionName, type]) => {
      const query = db.collection(collectionName).where("storeSlug", "==", slug);
      const snapshot = tx ? await tx.get(query) : await query.get();
      return snapshot.docs.map((doc) => toFeedCoupon(doc.id, type, doc.data()));
    })
  );
  return lists.flat();
}

// Rewrites Stores/{slug} from that store's coupons, or deletes it when none are left.
export async function rebuildStore(slug: string) {
  if (!slug) return;
  const db = admin.firestore();
  const ref = db.collection(collectionsList.stores).doc(slug);
  await db.runTransaction(async (tx) => {
    const summary = summarize(slug, await storeCoupons(slug, tx));
    if (summary) tx.set(ref, summary);
    else tx.delete(ref);
  });
}

// Fields shown in the summary. Votes and copies change other fields and don't need a rebuild.
const summaryFields = ["storeSlug", "name", "discount", "expiry", "category", "imgUrl", "createdAt", "updatedAt"];

const same = (a: unknown, b: unknown) =>
  a instanceof Timestamp && b instanceof Timestamp ? a.isEqual(b) : JSON.stringify(a) === JSON.stringify(b);

// Which stores need a rebuild after a coupon changed from `before` to `after` (either may be missing).
export const storesToRebuild = (
  before: FirebaseFirestore.DocumentData | undefined,
  after: FirebaseFirestore.DocumentData | undefined
): string[] => {
  if (before && after && summaryFields.every((field) => same(before[field], after[field]))) return [];
  return [...new Set([text(before?.storeSlug), text(after?.storeSlug)].filter(Boolean))];
};
