// Recounts likes/dislikes on every coupon from the vote docs in UserVotes/{uid}/likes|dislikes/{couponId},
// and fixes the counters on the public coupon and the owner's copy (UserCoupons/{ownerID}/...).
//
// Usage, from "cloud functions/functions":
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/recountVotes.js           # report only
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/recountVotes.js --write   # apply fixes
//
// Safe to run more than once. Votes cast while it runs may be off by one; run it again to settle.

const admin = require("firebase-admin");

const write = process.argv.includes("--write");
admin.initializeApp();
const db = admin.firestore();

const USER_VOTES = "UserVotes";
const USER_COUPONS = "UserCoupons";
const COUPON_COLLECTIONS = ["Coupons", "SocialCoupons"];

// couponId -> number of vote docs under UserVotes/*/{field}
async function countVotes(field) {
  const counts = new Map();
  const snap = await db.collectionGroup(field).get();
  snap.forEach((voteDoc) => {
    // Only UserVotes/{uid}/{field}/{couponId}
    if (voteDoc.ref.parent.parent?.parent?.id !== USER_VOTES) return;
    counts.set(voteDoc.id, (counts.get(voteDoc.id) || 0) + 1);
  });
  return counts;
}

(async () => {
  const likes = await countVotes("likes");
  const dislikes = await countVotes("dislikes");
  const updates = []; // [ref, {likes, dislikes}]

  for (const collectionName of COUPON_COLLECTIONS) {
    const coupons = await db.collection(collectionName).get();
    for (const coupon of coupons.docs) {
      const expected = { likes: likes.get(coupon.id) || 0, dislikes: dislikes.get(coupon.id) || 0 };
      const refs = [coupon.ref];
      const ownerID = coupon.get("userID");
      if (typeof ownerID === "string" && ownerID !== "") {
        const ownerRef = db.doc(`${USER_COUPONS}/${ownerID}/${collectionName}/${coupon.id}`);
        if ((await ownerRef.get()).exists) refs.push(ownerRef);
      }

      for (const ref of refs) {
        const data = ref === coupon.ref ? coupon.data() : (await ref.get()).data();
        if (data.likes !== expected.likes || data.dislikes !== expected.dislikes) {
          console.log(
            `${ref.path}: likes ${data.likes} -> ${expected.likes}, dislikes ${data.dislikes} -> ${expected.dislikes}`
          );
          updates.push([ref, expected]);
        }
      }
    }
  }

  if (updates.length === 0) {
    console.log("All counters are correct.");
  } else if (!write) {
    console.log(`${updates.length} docs need fixing. Run again with --write to apply.`);
  } else {
    for (let i = 0; i < updates.length; i += 400) {
      const batch = db.batch();
      updates.slice(i, i + 400).forEach(([ref, counts]) => batch.update(ref, counts));
      await batch.commit();
    }
    console.log(`Fixed ${updates.length} docs.`);
  }
  process.exit(0);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
