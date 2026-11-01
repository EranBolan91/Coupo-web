import { addDoc, collection, Timestamp } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { Coupon } from "../types/CouponType";
import { db } from "./databaseConfig";

export const saveUserSocialCoupon = async (coupon: Coupon, userID: string) => {
  try {
    coupon.createdAt = Timestamp.fromDate(new Date());
    coupon.likes = 0;
    coupon.dislikes = 0;
    // Accept a Timestamp (CouponForm), null (no expiry date) or a date string (older callers).
    if (coupon.expiry && !(coupon.expiry instanceof Timestamp)) {
      coupon.expiry = Timestamp.fromDate(new Date(String(coupon.expiry)));
    }
    if (!coupon.expiry) coupon.expiry = null;

    const userCouponsRef = collection(db, `${collectionsList.userCoupons}/${userID}/${collectionsList.socialCoupons}/`);
    await addDoc(userCouponsRef, coupon);
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};
