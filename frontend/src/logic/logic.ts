import { getUserDislikesVotes, getUserLikesVotes } from "../database/databaseCalls";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Coupon, VoteObject } from "../types/Types";
import { db } from "../database/databaseConfig";
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

export const getUserWishlistCoupons = async (userID: string): Promise<Coupon[]> => {
  const userWishlistData = await getUserWishlist(userID);

  const MAX_BATCH_SIZE = 10;

  // Split couponIDs into chunks of 10
  const batches = [];
  for (let i = 0; i < userWishlistData.length; i += MAX_BATCH_SIZE) {
    const chunk = userWishlistData.slice(i, i + MAX_BATCH_SIZE);
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
