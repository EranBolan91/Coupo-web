import { doc, getDoc, Timestamp, writeBatch } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { Coupon } from "../types/CouponType";
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

export type AdminCouponEdit = Pick<Coupon, "code" | "category" | "discount" | "expiry" | "description">;

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
