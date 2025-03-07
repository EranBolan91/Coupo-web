/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { collectionsList } from "./firebaseCollections";
import { Timestamp } from "firebase-admin/firestore";
import { UserRecord } from "firebase-admin/auth";
import { Storage } from "@google-cloud/storage";
import * as functions from "firebase-functions";
import { Coupon, CurrentUser } from "./types";

import * as admin from "firebase-admin";

admin.initializeApp();
const storage = new Storage();

export const createNewUserInUsersCollection = functions.auth.user().onCreate((user: UserRecord) => {
  if (user.providerData[0].providerId !== "password") {
    const newUser: CurrentUser = {
      userUID: user.uid,
      firstName: user?.displayName?.split(" ")[0] ?? "",
      lastName: user?.displayName?.split(" ")[1] ?? "",
      email: user.email ?? "",
      isEmailVerified: user.emailVerified,
      imageURL: user.photoURL ?? "",
      lastLogin: user.metadata.creationTime,
      creationDate: Timestamp.fromDate(new Date(user.metadata.creationTime)),
      birthday: undefined,
    };
    admin
      .firestore()
      .collection("Users")
      .doc(user.uid)
      .set({ ...newUser });
  }
});

export const addUserCouponToCouponsCollection = functions.firestore
  .document(`${collectionsList.userCoupons}/{userID}/${collectionsList.coupons}/{docID}`)
  .onCreate(async (snap, context) => {
    const newCoupon = snap.data() as Coupon;
    const docID = context.params.docID;

    await admin.firestore().collection(collectionsList.coupons).doc(docID).set(newCoupon);
  });

export const addUserSocialCouponToSocialCouponsCollection = functions.firestore
  .document(`${collectionsList.userCoupons}/{userID}/${collectionsList.socialCoupons}/{docID}`)
  .onCreate(async (snap, context) => {
    const newCoupon = snap.data() as Coupon;
    const docID = context.params.docID;

    await admin.firestore().collection(collectionsList.socialCoupons).doc(docID).set(newCoupon);
  });

export const removeCouponFromCouponsCollection = functions.firestore
  .document(`${collectionsList.userCoupons}/{userID}/${collectionsList.coupons}/{docID}`)
  .onDelete(async (snap, context) => {
    const docID = context.params.docID;
    const couponRef = admin.firestore().collection(collectionsList.coupons).doc(docID);

    await couponRef.delete();
  });

export const removeSocialCouponFromSocialCouponsCollection = functions.firestore
  .document(`${collectionsList.userCoupons}/{userID}/${collectionsList.socialCoupons}/{docID}`)
  .onDelete(async (snap, context) => {
    const docID = context.params.docID;
    const couponRef = admin.firestore().collection(collectionsList.socialCoupons).doc(docID);

    await couponRef.delete();
  });

export const addLikeVoteToCoupon = functions.firestore
  .document(`${collectionsList.userVotes}/{userID}/likes/{couponID}`)
  .onWrite(async (change, context) => {
    const couponID = context.params.couponID;
    const userID = context.params.userID;

    const couponsRef = admin.firestore().doc(`${collectionsList.coupons}/${couponID}`);
    const usersCouponsRef = admin
      .firestore()
      .doc(`${collectionsList.userCoupons}/${userID}/${collectionsList.coupons}/${couponID}`);

    await couponsRef.update({
      likes: admin.firestore.FieldValue.increment(1),
    });

    await usersCouponsRef.update({
      likes: admin.firestore.FieldValue.increment(1),
    });
  });

export const addDislikeVoteToCoupon = functions.firestore
  .document(`${collectionsList.userVotes}/{userID}/dislikes/{couponID}`)
  .onWrite(async (change, context) => {
    const couponID = context.params.couponID;
    const userID = context.params.userID;

    const couponsRef = admin.firestore().doc(`${collectionsList.coupons}/${couponID}`);
    const usersCouponsRef = admin
      .firestore()
      .doc(`${collectionsList.userCoupons}/${userID}/${collectionsList.coupons}/${couponID}`);

    await couponsRef.update({
      dislikes: admin.firestore.FieldValue.increment(1),
    });
    await usersCouponsRef.update({
      dislikes: admin.firestore.FieldValue.increment(1),
    });
  });

export const uploadImage = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name; // Full path of the uploaded file in the bucket
  // const contentType = object.contentType; // Mime type of the uploaded file
  const imageURL = object.mediaLink;
  const bucketName = object.bucket;

  if (imageURL === undefined) {
    return null;
  }

  if (!filePath) {
    console.log("File path is missing.");
    return null;
  }

  // Determine if it's a "ProfileImage" or "Brands" folder
  if (filePath.startsWith("ProfileImage/")) {
    return handleProfileImage(filePath, imageURL);
  } else if (filePath.startsWith("Brands/")) {
    return handleBrands(filePath, imageURL, bucketName);
  } else {
    console.log("File is not in the ProfileImage or Brands folders.");
    return null;
  }
});

// Handle ProfileImage uploads
async function handleProfileImage(filePath: string, imageURL: string) {
  console.log(`Processing ProfileImage: ${filePath}`);

  // Extract userID from file path (assuming "ProfileImage/${userID}/filename")
  const pathSegments = filePath.split("/");
  const userID = pathSegments[1];

  if (!userID) {
    console.log("No userID found in file path.");
    return null;
  }

  console.log(`Generated signed URL for ProfileImage: ${filePath}`);

  // Update Firestore for the user
  const userDocRef = admin.firestore().doc(`Users/${userID}`);
  await userDocRef.set(
    { imageURL: imageURL },
    { merge: true } // Merge with existing data
  );

  console.log(`Updated Firestore for user ${userID} with profile image URL.`);
  return null;
}

// Handle Brands uploads
async function handleBrands(filePath: string, imageURL: string, bucketName: string) {
  try {
    console.log(`Processing Brands folder: ${filePath}`);

    // This return is for when creating Folders
    if (filePath.split("/").length === 1) {
      return null;
    }
    const brandName = filePath.split("/").pop()?.split(".")[0];

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    await file.makePublic();

    // Public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(
      filePath
    )}`;

    const brandDocRef = admin.firestore().collection(`Brands/`);
    await brandDocRef.add({ brand: brandName, imgUrl: publicUrl });

    console.log(`Updated Firestore for brand ${filePath} with image URL.`);
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}
