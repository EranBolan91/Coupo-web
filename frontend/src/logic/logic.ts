import { getUserDislikesVotes, getUserLikesVotes, saveImageBrand } from "../database/databaseCalls";
import { collection, query, where, getDocsFromServer } from "firebase/firestore";
import { saveProfileImage, updatePersonalDocument } from "../database/profile";
import { getUserWishlist } from "../database/wishlist";
import { UserDocument } from "../types/UserType";
import { collectionsList } from "../../firebaseCollections";
import { db } from "../database/databaseConfig";
import { Coupon } from "../types/CouponType";
import { Vote } from "../types/VoteType";

export const getUserVotes = async (userID: string): Promise<Vote> => {
  try {
    const userVotesObj: Vote = {
      likes: [],
      dislikes: [],
    };
    const userLikes: Coupon[] = await getUserLikesVotes(userID);
    const userDislikes: Coupon[] = await getUserDislikesVotes(userID);

    userLikes.map((userLike) => userVotesObj.likes.push(userLike));
    userDislikes.map((userDislike) => userVotesObj.dislikes.push(userDislike));
    return userVotesObj;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getUserWishlistCoupons = async (userID: string): Promise<Coupon[]> => {
  try {
    const userWishlistData = await getUserWishlist(userID);

    const MAX_BATCH_SIZE = 10;

    // Split couponIDs into chunks of 10
    const batches = [];
    for (let i = 0; i < userWishlistData.length; i += MAX_BATCH_SIZE) {
      const chunk = userWishlistData.slice(i, i + MAX_BATCH_SIZE);
      batches.push(chunk);
    }

    // Fetch each batch from both public collections (a wishlist can hold regular and social coupons)
    const couponPromises = batches.flatMap((batch) =>
      [
        { name: collectionsList.coupons, type: "coupon" },
        { name: collectionsList.socialCoupons, type: "socialCoupon" },
      ].map(async ({ name, type }) => {
        const q = query(collection(db, name), where("__name__", "in", batch));
        const querySnapshot = await getDocsFromServer(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, type, ...doc.data() } as Coupon));
      })
    );

    // Wait for all batches to resolve
    const results: Coupon[] = (await Promise.all(couponPromises)).flat();
    return results;
  } catch (error: any) {
    throw new Error(error);
  }
};

// Saves the profile fields, then uploads the new picture if one was picked.
// Errors are passed on unchanged so the caller can show them.
export const updateUserProfileDetails = async (userDocument: UserDocument, imageFile?: File | null) => {
  await updatePersonalDocument(userDocument);
  if (imageFile) {
    await saveProfileImage(imageFile, userDocument.userUID);
  }
};

export const uploadMultipleImages = async (imagesFiles: FileList, filesNames: Record<string, string>) => {
  Array.from(imagesFiles).forEach((imageFile) => saveImageBrand(imageFile, filesNames[imageFile.name]));
};
