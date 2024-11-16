import { collection, query, where, getDocs, QueryDocumentSnapshot } from "firebase/firestore";
import { getUserDislikesVotes, getUserLikesVotes } from "../database/databaseCalls";
import { db } from "../database/databaseConfig";
import { Coupon, VoteObject } from "../types/Types";
import { getUserWishlist } from "../database/wishlist";

export const getUserVotes = async (userID: string): Promise<VoteObject> => {
  const userVotesObj: VoteObject = {
    likes: [],
    dislikes: [],
  };
  const userLikes: Coupon[] = await getUserLikesVotes(userID);
  const userDislikes: Coupon[] = await getUserDislikesVotes(userID);

  userLikes.map((userLike) => userVotesObj.likes.push(userLike));
  userDislikes.map((userDislike) => userVotesObj.dislikes.push(userDislike));
  return userVotesObj;
};

export const getUserWishlistCoupons = async (arrayOfCouponIDs: string[]): Promise<Coupon[]> => {
  if (arrayOfCouponIDs.length === 0) {
    return [];
  }
  const MAX_BATCH_SIZE = 10;

  // Split couponIDs into chunks of 10
  const batches = [];
  for (let i = 0; i < arrayOfCouponIDs.length; i += MAX_BATCH_SIZE) {
    const chunk = arrayOfCouponIDs.slice(i, i + MAX_BATCH_SIZE);
    batches.push(chunk);
  }

  // Fetch each batch
  const couponPromises = batches.map(async (batch) => {
    const couponsRef = collection(db, "Coupons");
    const q = query(couponsRef, where("__name__", "in", batch));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Coupon)
    );
  });

  // Wait for all batches to resolve
  const results: Coupon[] = (await Promise.all(couponPromises)).flat();
  return results;
};
