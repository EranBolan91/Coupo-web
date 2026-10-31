/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { collectionsList } from "./firebaseCollections";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { UserRecord } from "firebase-admin/auth";
import { Storage } from "@google-cloud/storage";
import * as functions from "firebase-functions";
import { Coupon, CurrentUser } from "./types";
import { SITE_URL, injectPreview, isPreviewBot, parseCouponPath, previewTags } from "./couponPreview";
import { StatsChange, applyChange } from "./sharerPoints";

import * as admin from "firebase-admin";
import { renderListingPage, getFeed, getStores, toFeedCoupon } from "./seoServer";
import { rebuildStore, slugOf, storesToRebuild } from "./stores";
import { couponBody, couponJsonLd, robotsTxt, sitemapXml } from "./seoPages";
import { injectBody, pageTags } from "./couponPreview";

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
// Fields kept by the vote and copy triggers (counters and "last worked" times) are left alone: those
// triggers write both copies themselves.
const voteFields = ["likes", "dislikes", "lastWorkedAt", "lastFailedAt", "copies"];
const withoutVoteFields = (data: FirebaseFirestore.DocumentData) =>
  Object.fromEntries(Object.entries(data).filter(([key]) => !voteFields.includes(key)));

const mirrorCouponUpdate = (collectionName: string) =>
  functions.firestore
    .document(`${collectionsList.userCoupons}/{userID}/${collectionName}/{docID}`)
    .onUpdate(async (change, context) => {
      const before = withoutVoteFields(change.before.data());
      const after = withoutVoteFields(change.after.data());

      // Only the vote fields changed - nothing to mirror.
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
// A like means "the code worked" and a dislike "it didn't", so every saved vote (new or re-saved,
// e.g. "Did it work? Yes" again) also stamps lastWorkedAt / lastFailedAt.
// Both are updated on the public coupon and on the coupon owner's copy
// (the owner comes from the coupon's userID field, not from the voter's ID in the path).
const countVote = (field: "likes" | "dislikes") =>
  functions.firestore
    .document(`${collectionsList.userVotes}/{userID}/${field}/{couponID}`)
    .onWrite(async (change, context) => {
      let delta = 0;
      if (!change.before.exists && change.after.exists) delta = 1;
      if (change.before.exists && !change.after.exists) delta = -1;
      const saved = change.after.exists;

      const db = admin.firestore();
      const couponID = context.params.couponID;
      const update: Record<string, FieldValue> = {};
      if (delta !== 0) update[field] = FieldValue.increment(delta);
      if (saved) update[field === "likes" ? "lastWorkedAt" : "lastFailedAt"] = FieldValue.serverTimestamp();
      if (Object.keys(update).length === 0) return null;

      // One vote per user per coupon: a new like removes the user's dislike and vice versa.
      // Deleting it fires this trigger for the other field, which subtracts 1 there.
      if (delta === 1) {
        const otherField = field === "likes" ? "dislikes" : "likes";
        await db.doc(`${collectionsList.userVotes}/${context.params.userID}/${otherField}/${couponID}`).delete();
      }

      const coupon = await updateBothCopies(couponID, update);
      if (!coupon) {
        console.log(`Vote on unknown coupon ${couponID}`);
        return null;
      }

      // "It worked" votes from other people give the sharer points.
      if (field === "likes" && delta !== 0 && coupon.ownerID && coupon.ownerID !== context.params.userID) {
        await addSharerStats(coupon.ownerID, { worked: delta }, coupon.username);
      }
      return null;
    });

export const addLikeVoteToCoupon = countVote("likes");
export const addDislikeVoteToCoupon = countVote("dislikes");

// Applies `update` to the public coupon (Coupons, then SocialCoupons) and to the owner's copy.
// Returns the owner and sharer name, or null when the coupon doesn't exist.
async function updateBothCopies(couponID: string, update: Record<string, FieldValue>) {
  const db = admin.firestore();
  for (const collectionName of couponCollections) {
    const publicRef = db.collection(collectionName).doc(couponID);
    const publicSnap = await publicRef.get();
    if (!publicSnap.exists) continue;

    const batch = db.batch();
    batch.update(publicRef, update);

    const ownerID = publicSnap.get("userID");
    const hasOwner = typeof ownerID === "string" && ownerID !== "";
    if (hasOwner) {
      const ownerRef = db.doc(`${collectionsList.userCoupons}/${ownerID}/${collectionName}/${couponID}`);
      const ownerSnap = await ownerRef.get();
      if (ownerSnap.exists) batch.update(ownerRef, update);
    }

    await batch.commit();
    const username = publicSnap.get("username");
    return { ownerID: hasOwner ? (ownerID as string) : "", username: typeof username === "string" ? username : "" };
  }
  return null;
}

// SharerStats/{uid}: points, copies and "worked" votes, all time and this month (see sharerPoints.ts).
async function addSharerStats(uid: string, change: StatsChange, name: string) {
  const db = admin.firestore();
  const ref = db.collection(collectionsList.sharerStats).doc(uid);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    tx.set(ref, { ...applyChange(snap.data(), change, new Date(), name), updatedAt: FieldValue.serverTimestamp() });
  });
}

// UserCopies/{uid}/coupons/{couponID}: written by the browser the first time a signed-in user copies a
// code (the rules allow one per person per coupon). Counts `copies` on the coupon and gives the sharer
// a point. Copying your own code doesn't count.
export const countCopy = functions.firestore
  .document(`${collectionsList.userCopies}/{userID}/coupons/{couponID}`)
  .onCreate(async (snap, context) => {
    const db = admin.firestore();
    const couponID = context.params.couponID;
    const copierID = context.params.userID;

    let ownerID = "";
    for (const collectionName of couponCollections) {
      const publicSnap = await db.collection(collectionName).doc(couponID).get();
      if (!publicSnap.exists) continue;
      ownerID = publicSnap.get("userID") ?? "";
      break;
    }
    if (ownerID === copierID) return null;

    const coupon = await updateBothCopies(couponID, { copies: FieldValue.increment(1) });
    if (!coupon) {
      console.log(`Copy of unknown coupon ${couponID}`);
      return null;
    }
    if (coupon.ownerID) await addSharerStats(coupon.ownerID, { copies: 1 }, coupon.username);
    return null;
  });

// Keeps `storeSlug` on every public coupon and the Stores/{slug} summaries up to date, whoever wrote
// the coupon (the owner mirror above, admin tools, bulk import). Setting the slug writes the coupon
// again, and that second run rebuilds the store(s), so a rename updates both the old and new store.
const syncStore = (collectionName: string) =>
  functions.firestore
    .document(`${collectionName}/{couponID}`)
    .onWrite(async (change) => {
      const before = change.before.exists ? change.before.data() : undefined;
      const after = change.after.exists ? change.after.data() : undefined;

      if (after && after.storeSlug !== slugOf(after)) {
        await change.after.ref.update({ storeSlug: slugOf(after) });
        return null;
      }
      for (const slug of storesToRebuild(before, after)) await rebuildStore(slug);
      return null;
    });

export const syncStoreFromCoupons = syncStore(collectionsList.coupons);
export const syncStoreFromSocialCoupons = syncStore(collectionsList.socialCoupons);

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

// Pages that search engines and link-preview bots read come here through the Hosting rewrites in
// firebase.json: coupon pages (/coupons/{id}, /social/{id}), store pages (/stores, /store/{slug}),
// category pages (/categories, /categories/{name}), /sitemap.xml and /robots.txt.
// HTML pages get the normal index.html with the page's title, description, preview image and
// structured data in the head, and a readable copy of the content (heading, codes, links) in the body,
// so a link pasted in WhatsApp shows the coupon and Google sees the page without running JavaScript.
// The page then loads the React app as usual, which replaces that copy.
// (The function keeps its first name, couponPreview: renaming it would delete and recreate it.)
let template: { html: string; fetchedAt: number } | null = null;
const TEMPLATE_TTL_MS = 5 * 60 * 1000;

// index.html is fetched from Hosting (it's a real file, so the rewrites don't apply) and kept for a few
// minutes. It has to come from Hosting because its script names change with every frontend deploy.
async function getTemplate() {
  if (template && Date.now() - template.fetchedAt < TEMPLATE_TTL_MS) return template.html;
  try {
    const response = await fetch(`${SITE_URL}/index.html`);
    if (!response.ok) throw new Error(`index.html returned ${response.status}`);
    template = { html: await response.text(), fetchedAt: Date.now() };
  } catch (error) {
    console.error("couponPreview: couldn't fetch index.html", (error as Error).message);
    if (!template) throw error;
    // Keep serving the last good copy rather than failing the page.
  }
  return template.html;
}

export const couponPreview = functions.https.onRequest(async (req, res) => {
  if (req.path === "/robots.txt") {
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600").type("text/plain").send(robotsTxt());
    return;
  }
  if (req.path === "/sitemap.xml") {
    try {
      const [coupons, stores] = await Promise.all([getFeed(), getStores()]);
      const xml = sitemapXml(coupons, stores, Date.now());
      res.set("Cache-Control", "public, max-age=3600, s-maxage=3600").type("application/xml").send(xml);
    } catch {
      res.status(503).set("Retry-After", "60").send("Sitemap is not available right now.");
    }
    return;
  }

  const route = parseCouponPath(req.path);

  let html: string;
  try {
    html = await getTemplate();
  } catch {
    // Only when Hosting can't be reached and there is no earlier copy (e.g. right after a cold start).
    res.status(503).set("Retry-After", "5").send("Coupo is busy. Please try again in a moment.");
    return;
  }

  // Count visits from shared links (?ref=whatsapp, ?ref=share). Preview bots are logged separately.
  const ref = typeof req.query.ref === "string" ? req.query.ref.slice(0, 32) : "";
  if (ref) {
    console.log(JSON.stringify({ event: "shared_link_visit", ref, path: route?.path ?? req.path, bot: isPreviewBot(req.get("user-agent")) }));
  }

  let missing = false;
  if (route) {
    try {
      const collectionName = route.collection === "socialCoupons" ? collectionsList.socialCoupons : collectionsList.coupons;
      const snapshot = await admin.firestore().collection(collectionName).doc(route.id).get();
      if (snapshot.exists) {
        const data = snapshot.data() as Coupon;
        const coupon = toFeedCoupon(snapshot.id, route.collection === "socialCoupons" ? "socialCoupon" : "coupon", data);
        const now = Date.now();
        const withHead = injectPreview(html, previewTags(data, route.path, couponJsonLd(coupon, now)));
        html = withHead ? injectBody(withHead, couponBody(coupon, now)) : html;
      } else {
        missing = true;
      }
    } catch (error) {
      console.error("couponPreview: couldn't read the coupon", (error as Error).message);
    }
  } else {
    try {
      const page = await renderListingPage(req.path);
      if (page) {
        const withHead = injectPreview(html, pageTags(page.page));
        html = withHead ? injectBody(withHead, page.body) : html;
        missing = page.status === 404;
      }
    } catch (error) {
      console.error("seo: couldn't build the page", (error as Error).message);
    }
  }

  // Hosting's CDN keeps the page for 10 minutes, browsers revalidate every time like the other HTML pages.
  // A page that isn't found still gets the app, which shows its own "not found" page.
  res
    .status(missing ? 404 : 200)
    .set("Cache-Control", missing ? "public, max-age=0, s-maxage=60" : "public, max-age=0, s-maxage=600")
    .type("html")
    .send(html);
});
