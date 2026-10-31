import { collection, getDocsFromServer, limit, query, where } from "firebase/firestore";
import { StoreDoc, StoreInfo, storeFromDoc } from "../logic/stores";
import { collectionsList } from "../../firebaseCollections";
import { Coupon } from "../types/CouponType";
import { db } from "./databaseConfig";

// One store's coupons from both feeds (storeSlug is set by the syncStore Cloud Function).
export const getStoreCoupons = async (slug: string): Promise<Coupon[]> => {
  const feeds = [
    [collectionsList.coupons, "coupon"],
    [collectionsList.socialCoupons, "socialCoupon"],
  ] as const;
  const lists = await Promise.all(
    feeds.map(async ([collectionName, type]) => {
      const snapshot = await getDocsFromServer(query(collection(db, collectionName), where("storeSlug", "==", slug)));
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id, type }) as Coupon);
    })
  );
  return lists.flat();
};

// Every store's summary, A-Z.
export const getStores = async (): Promise<StoreInfo[]> => {
  const snapshot = await getDocsFromServer(collection(db, collectionsList.stores));
  const now = Date.now();
  return snapshot.docs
    .map((doc) => storeFromDoc(doc.data() as StoreDoc, now))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
};

// Stores sharing at least one of these categories (Firestore takes up to 30 values here).
export const getStoresInCategories = async (categories: string[]): Promise<StoreInfo[]> => {
  if (categories.length === 0) return [];
  const snapshot = await getDocsFromServer(
    query(collection(db, collectionsList.stores), where("categories", "array-contains-any", categories.slice(0, 30)), limit(50))
  );
  const now = Date.now();
  return snapshot.docs.map((doc) => storeFromDoc(doc.data() as StoreDoc, now));
};
