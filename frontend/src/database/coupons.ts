import { doc, getDoc, Timestamp, writeBatch } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { Coupon } from "../types/CouponType";
import { CouponTerms } from "../logic/couponTerms";
import { db } from "./databaseConfig";

const publicCollection = (type: Coupon["type"] | undefined) =>
  type === "socialCoupon" ? collectionsList.socialCoupons : collectionsList.coupons;

// One public coupon, or null when it doesn't exist (deleted, or a wrong link).
export const getCoupon = async (type: Coupon["type"], couponID: string): Promise<Coupon | null> => {
  const snapshot = await getDoc(doc(db, publicCollection(type), couponID));
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id, type } as Coupon;
};

// The owner's copy, when the coupon has an owner and the copy still exists (admin coupons have none).
const ownerCopy = async (coupon: Coupon) => {
  if (!coupon.userID) return null;
  const ref = doc(db, collectionsList.userCoupons, coupon.userID, publicCollection(coupon.type), coupon.id);
  return (await getDoc(ref)).exists() ? ref : null;
};

export type AdminCouponEdit = Pick<Coupon, "code" | "category" | "discount" | "expiry" | "description"> & CouponTerms;

// Admin edit of any coupon: the public doc and the owner's copy are updated together, so the
// owner's profile shows the change too (the mirror trigger then copies the same values again).
export const adminUpdateCoupon = async (coupon: Coupon, fields: AdminCouponEdit) => {
  const update = { ...fields, updatedAt: Timestamp.now() };
  const batch = writeBatch(db);
  batch.update(doc(db, publicCollection(coupon.type), coupon.id), update);
  const owner = await ownerCopy(coupon);
  if (owner) batch.update(owner, update);
  await batch.commit();
};

// Admin delete of any coupon: removes the public doc and the owner's copy.
export const adminDeleteCoupon = async (coupon: Coupon) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, publicCollection(coupon.type), coupon.id));
  const owner = await ownerCopy(coupon);
  if (owner) batch.delete(owner);
  await batch.commit();
};

// Admin: put these coupons under one brand name and logo (adding a logo to a new brand, or merging a
// misspelled brand into an existing one). Updates the public doc and the owner's copy of each.
export const adminSetCouponsBrand = async (coupons: Coupon[], name: string, imgUrl: string) => {
  const update = { name, imgUrl, updatedAt: Timestamp.now() };
  const refs = await Promise.all(
    coupons.map(async (coupon) => [doc(db, publicCollection(coupon.type), coupon.id), await ownerCopy(coupon)] as const)
  );
  const writes = refs.flatMap(([publicRef, owner]) => (owner ? [publicRef, owner] : [publicRef]));
  // A batch takes at most 500 writes.
  for (let i = 0; i < writes.length; i += 500) {
    const batch = writeBatch(db);
    writes.slice(i, i + 500).forEach((ref) => batch.update(ref, update));
    await batch.commit();
  }
};
