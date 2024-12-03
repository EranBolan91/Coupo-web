/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { collectionsList } from "./firebaseCollections";
import { Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
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

export const updateProfileImage = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name; // File path in the storage bucket
  const contentType = object.contentType; // Mime type of the file
  const bucketName = object.bucket; // Storage bucket

  if (!filePath || !filePath.startsWith("ProfileImage/")) {
    console.log("Not a profile image upload.");
    return null;
  }

  if (!contentType || !contentType.startsWith("image/")) {
    console.log("Uploaded file is not an image.");
    return null;
  }

  // Extract userID from file path
  const userID = filePath.split("/")[1]; // Assuming "ProfileImage/${userID}/filename"

  if (!userID) {
    console.log("No userID found in file path.");
    return null;
  }

  // Generate the public URL
  const bucket = getStorage().bucket(bucketName);
  const file = bucket.file(filePath);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2500", // Adjust the expiry date as needed
  });

  console.log(`Generated signed URL: ${url}`);

  // Update Firestore
  const userDocRef = admin.firestore().doc(`Users/${userID}`);
  await userDocRef.set(
    { imageURL: url },
    { merge: true } // Merge with existing data
  );

  console.log(`Updated Firestore for user: ${userID}`);
  return null;
});
