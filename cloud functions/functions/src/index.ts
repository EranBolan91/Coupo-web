/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { collectionsList } from "./firebaseCollections";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { UserRecord } from "firebase-admin/auth";
import { Storage } from "@google-cloud/storage";
import * as functions from "firebase-functions";
import { Coupon, CurrentUser } from "./types";

import * as admin from "firebase-admin";

admin.initializeApp();
const storage = new Storage();

// Coupon types: the owner's subcollection under UserCoupons/{uid} has the same name as the public collection.
const couponCollections = [collectionsList.coupons, collectionsList.socialCoupons];

export const createNewUserInUsersCollection = functions.auth.user().onCreate((user: UserRecord) => {
  if (user.providerData[0]?.providerId !== "password") {
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
    return admin
      .firestore()
      .collection(collectionsList.users)
      .doc(user.uid)
      .set({ ...newUser }, { ignoreUndefinedProperties: true } as admin.firestore.SetOptions);
  }
  return null;
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

// Copies the owner's edits (category, discount, description, ...) to the public copy.
// likes/dislikes are left alone: the vote triggers keep both copies' counters in sync.
const mirrorCouponUpdate = (collectionName: string) =>
  functions.firestore
    .document(`${collectionsList.userCoupons}/{userID}/${collectionName}/{docID}`)
    .onUpdate(async (change, context) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes: _l1, dislikes: _d1, ...before } = change.before.data();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes: _l2, dislikes: _d2, ...after } = change.after.data();

      // Only the counters changed (a vote) - nothing to mirror.
      if (JSON.stringify(before) === JSON.stringify(after)) return null;

      const publicRef = admin.firestore().collection(collectionName).doc(context.params.docID);
      const publicSnap = await publicRef.get();
      if (!publicSnap.exists) return null;

      await publicRef.update(after);
      return null;
    });

export const updateCouponInCouponsCollection = mirrorCouponUpdate(collectionsList.coupons);
export const updateSocialCouponInSocialCouponsCollection = mirrorCouponUpdate(collectionsList.socialCoupons);

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

// UserVotes/{voterID}/likes|dislikes/{couponID}: a new vote doc adds 1, a deleted one subtracts 1.
// The counter is updated on the public coupon and on the coupon owner's copy
// (the owner comes from the coupon's userID field, not from the voter's ID in the path).
const countVote = (field: "likes" | "dislikes") =>
  functions.firestore
    .document(`${collectionsList.userVotes}/{userID}/${field}/{couponID}`)
    .onWrite(async (change, context) => {
      let delta = 0;
      if (!change.before.exists && change.after.exists) delta = 1;
      if (change.before.exists && !change.after.exists) delta = -1;
      if (delta === 0) return null;

      const db = admin.firestore();
      const couponID = context.params.couponID;
      const increment = FieldValue.increment(delta);

      for (const collectionName of couponCollections) {
        const publicRef = db.collection(collectionName).doc(couponID);
        const publicSnap = await publicRef.get();
        if (!publicSnap.exists) continue;

        const batch = db.batch();
        batch.update(publicRef, { [field]: increment });

        const ownerID = publicSnap.get("userID");
        if (typeof ownerID === "string" && ownerID !== "") {
          const ownerRef = db.doc(`${collectionsList.userCoupons}/${ownerID}/${collectionName}/${couponID}`);
          const ownerSnap = await ownerRef.get();
          if (ownerSnap.exists) batch.update(ownerRef, { [field]: increment });
        }

        await batch.commit();
        return null;
      }

      console.log(`Vote on unknown coupon ${couponID}`);
      return null;
    });

export const addLikeVoteToCoupon = countVote("likes");
export const addDislikeVoteToCoupon = countVote("dislikes");

// Only Brands/ uploads are handled here. Profile images (ProfileImage/{uid}/...) are handled by
// the client, which saves a working download URL on Users/{uid}.imageURL itself.
export const uploadImage = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name; // Full path of the uploaded file in the bucket
  const bucketName = object.bucket;

  if (!filePath) {
    console.log("File path is missing.");
    return null;
  }

  if (filePath.startsWith("Brands/")) {
    return handleBrands(filePath, bucketName);
  }
  return null;
});

// Handle Brands uploads: Brands/{brandName}.{ext} -> public file + Brands doc { brand, imgUrl }
async function handleBrands(filePath: string, bucketName: string) {
  try {
    // This return is for when creating Folders
    if (filePath.split("/").length === 1) {
      return null;
    }
    const brandName = filePath.split("/").pop()?.split(".")[0];

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    await file.makePublic();

    // Public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(filePath)}`;

    await admin.firestore().collection(collectionsList.brands).add({ brand: brandName, imgUrl: publicUrl });

    console.log(`Updated Firestore for brand ${filePath} with image URL.`);
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}
