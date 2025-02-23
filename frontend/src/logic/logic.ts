import { saveProfileImage, updatePersonalUserDetails as updatePersonalUserDetailsDB } from "../database/profile";
import { getUserDislikesVotes, getUserLikesVotes, saveImageBrand } from "../database/databaseCalls";
import { PersonalInfoForm } from "../pages/profile/components/PersonalInfo/ModalPersonalInfo";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getUserWishlist } from "../database/wishlist";
import { db } from "../database/databaseConfig";
import { Coupon } from "../types/CouponType";
import { User } from "../types/UserType";
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
  } catch (error: any) {
    throw new Error(error);
  }
};

export const updateUserProfileDetails = async (user: User, data: PersonalInfoForm) => {
  data.birthday = Timestamp.fromDate(new Date(data.birthday.toString()));
  try {
    await updatePersonalUserDetailsDB(user.userUID, (({ imageURL, ...rest }: PersonalInfoForm) => rest)(data));
    if (user.imageURL !== data.imageURL) {
      await saveProfileImage(data.imageURL, "profile", user);
    }
  } catch (error: any) {
    throw new Error(error);
  }
};

export const uploadMultipleImages = async (imagesFiles: FileList, filesNames: Record<string, string>) => {
  Array.from(imagesFiles).forEach((imageFile) => saveImageBrand(imageFile, filesNames[imageFile.name]));
};
