import { addDoc, collection, Timestamp } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { Coupon } from "../types/CouponType";
import { db } from "./databaseConfig";

export const saveUserSocialCoupon = async (coupon: Coupon, userID: string) => {
  try {
    coupon.createdAt = Timestamp.fromDate(new Date());
    coupon.likes = 0;
    coupon.dislikes = 0;
    const expiryDate = new Date(coupon.expiry.toString());
    coupon.expiry = Timestamp.fromDate(expiryDate);

    const userCouponsRef = collection(db, `${collectionsList.userCoupons}/${userID}/${collectionsList.socialCoupons}/`);
    await addDoc(userCouponsRef, coupon);
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};
