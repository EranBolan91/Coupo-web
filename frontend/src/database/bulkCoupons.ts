import { collection, doc, writeBatch } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { Coupon } from "../types/CouponType";
import { db } from "./databaseConfig";

// Firestore allows 500 writes per batch.
const BATCH_SIZE = 400;

// Publishes admin coupons to the public Coupons collection (admins only, by firestore.rules).
// Each chunk of 400 is all-or-nothing, so a failure part-way leaves earlier chunks published.
export const publishCoupons = async (coupons: Omit<Coupon, "id">[]) => {
  for (let start = 0; start < coupons.length; start += BATCH_SIZE) {
    const batch = writeBatch(db);
    coupons.slice(start, start + BATCH_SIZE).forEach((coupon) => batch.set(doc(collection(db, collectionsList.coupons)), coupon));
    await batch.commit();
  }
};

// Deletes public coupons by id (used for the demo coupons, which have no owner copy).
export const deleteCoupons = async (ids: string[]) => {
  for (let start = 0; start < ids.length; start += BATCH_SIZE) {
    const batch = writeBatch(db);
    ids.slice(start, start + BATCH_SIZE).forEach((id) => batch.delete(doc(db, collectionsList.coupons, id)));
    await batch.commit();
  }
};
