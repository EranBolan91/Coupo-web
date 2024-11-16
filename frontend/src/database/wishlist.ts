import { collectionsList } from "../../firebaseCollections";
import { doc, setDoc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "./databaseConfig";

export const getUserWishlist = async (userID: string) => {
  try {
    const wishListArray: string[] = [];
    const docRef = doc(db, collectionsList.wishList, userID);
    const wishlistDoc = await getDoc(docRef);
    const wishlistObj = wishlistDoc.data();

    Object.keys(wishlistObj as object).forEach((wishlist) => wishListArray.push(wishlist));
    return wishListArray;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const saveCouponInWishList = async (userID: string, couponID: string) => {
  try {
    const docRef = doc(db, collectionsList.wishList, userID);
    await setDoc(docRef, { [couponID]: couponID }, { merge: true });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const removeCouponFromWishList = async (userID: string, couponID: string) => {
  try {
    const docRef = doc(db, collectionsList.wishList, userID);
    await updateDoc(docRef, {
      [couponID]: deleteField(),
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
