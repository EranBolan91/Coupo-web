/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { collectionsList } from "./firebaseCollections";
import { Timestamp } from "firebase-admin/firestore";
// import { getStorage } from "firebase-admin/storage";
import { UserRecord } from "firebase-admin/auth";
import * as functions from "firebase-functions";
import { Coupon, CurrentUser } from "./types";

import * as admin from "firebase-admin";

admin.initializeApp();

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

export const removeCouponFromCouponsCollection = functions.firestore
  .document(`${collectionsList.userCoupons}/{userID}/${collectionsList.coupons}/{docID}`)
  .onDelete(async (snap, context) => {
    const docID = context.params.docID;
    const couponRef = admin.firestore().collection(collectionsList.coupons).doc(docID);

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

const bucket = admin.storage().bucket();

export const uploadImage = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name; // Full path of the uploaded file in the bucket
  // const contentType = object.contentType; // Mime type of the uploaded file
  const bucketName = object.bucket; // The bucket where the file was uploaded

  if (!filePath) {
    console.log("File path is missing.");
    return null;
  }

  // Determine if it's a "ProfileImage" or "Brands" folder
  if (filePath.startsWith("ProfileImage/")) {
    return handleProfileImage(filePath, bucketName);
  } else if (filePath.startsWith("Brands/")) {
    return handleBrands(filePath, bucketName);
  } else {
    console.log("File is not in the ProfileImage or Brands folders.");
    return null;
  }
});

// Handle ProfileImage uploads
async function handleProfileImage(filePath: string, bucketName: string) {
  console.log(`Processing ProfileImage: ${filePath}`);

  // Extract userID from file path (assuming "ProfileImage/${userID}/filename")
  const pathSegments = filePath.split("/");
  const userID = pathSegments[1];

  if (!userID) {
    console.log("No userID found in file path.");
    return null;
  }

  // Generate a signed URL for the file
  const file = bucket.file(filePath);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2500", // Adjust expiry as needed
  });

  console.log(`Generated signed URL for ProfileImage: ${url}`);

  // Update Firestore for the user
  const userDocRef = admin.firestore().doc(`Users/${userID}`);
  await userDocRef.set(
    { profileImageURL: url },
    { merge: true } // Merge with existing data
  );

  console.log(`Updated Firestore for user ${userID} with profile image URL.`);
  return null;
}

// Handle Brands uploads
async function handleBrands(filePath: string, bucketName: string) {
  console.log(`Processing Brands folder: ${filePath}`);

  // Generate a signed URL for the file
  const file = bucket.file(bucketName);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2500", // Adjust expiry as needed
  });

  console.log(`Generated signed URL for Brand: ${url}`);

  // Update Firestore for the brand
  const brandDocRef = admin.firestore().doc(`Brands/`);
  await brandDocRef.set(
    { brandImageURL: url },
    { merge: true } // Merge with existing data
  );

  console.log(`Updated Firestore for brand ${filePath} with image URL.`);
  return null;
}
