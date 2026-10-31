// Rebuilds SharerStats/{uid} (points, copies, "worked" votes, this month and all time) from the
// copy docs (UserCopies/{uid}/coupons/{couponId}) and the "it worked" votes (UserVotes/{uid}/likes/{couponId}).
// Run it once after the first deploy of the points functions, so votes from before then count too.
// Points follow functions/src/sharerPoints.ts: +1 per copy by someone else, +5 per "worked" vote by someone else.
//
// Usage, from "cloud functions/functions":
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/recountPoints.js           # report only
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/recountPoints.js --write   # save
//
// Safe to run more than once. Votes older than the "votedAt" field (added with "Did it work?") count for
// all time but not for this month. Copies only exist from the deploy of this feature on.

const admin = require("firebase-admin");

const write = process.argv.includes("--write");
admin.initializeApp();
const db = admin.firestore();

const POINTS = { copy: 1, worked: 5 };
const month = new Date().toISOString().slice(0, 7);
const inMonth = (ts) => !!ts && typeof ts.toDate === "function" && ts.toDate().toISOString().slice(0, 7) === month;

(async () => {
  // couponId -> { ownerID, username, createdAt }
  const owners = new Map();
  for (const name of ["Coupons", "SocialCoupons"]) {
    (await db.collection(name).get()).forEach((c) => {
      const ownerID = c.get("userID");
      if (typeof ownerID !== "string" || ownerID === "") return;
      owners.set(c.id, { ownerID, username: c.get("username") || "", createdAt: c.get("createdAt")?.toMillis?.() ?? 0 });
    });
  }

  const stats = new Map(); // ownerID -> counts
  const statsFor = (ownerID) => {
    if (!stats.has(ownerID)) stats.set(ownerID, { name: "", newest: -1, copies: 0, worked: 0, monthCopies: 0, monthWorked: 0 });
    return stats.get(ownerID);
  };
  for (const [, c] of owners) {
    const s = statsFor(c.ownerID);
    if (c.createdAt > s.newest && c.username.trim()) {
      s.newest = c.createdAt;
      s.name = c.username.trim();
    }
  }

  // Docs at {parent}/{uid}/{sub}/{couponId}, by someone other than the coupon's owner.
  const each = async (parent, sub, fn) => {
    (await db.collectionGroup(sub).get()).forEach((d) => {
      if (d.ref.parent.parent?.parent?.id !== parent) return;
      const coupon = owners.get(d.id);
      if (!coupon || coupon.ownerID === d.ref.parent.parent.id) return;
      fn(statsFor(coupon.ownerID), d);
    });
  };
  await each("UserCopies", "coupons", (s, d) => {
    s.copies++;
    if (inMonth(d.get("copiedAt"))) s.monthCopies++;
  });
  await each("UserVotes", "likes", (s, d) => {
    s.worked++;
    if (inMonth(d.get("votedAt"))) s.monthWorked++;
  });

  const writes = [];
  for (const [uid, s] of stats) {
    const doc = {
      name: s.name || "Coupo member",
      points: s.copies * POINTS.copy + s.worked * POINTS.worked,
      copies: s.copies,
      worked: s.worked,
      month,
      monthPoints: s.monthCopies * POINTS.copy + s.monthWorked * POINTS.worked,
      monthCopies: s.monthCopies,
      monthWorked: s.monthWorked,
    };
    const ref = db.collection("SharerStats").doc(uid);
    const current = (await ref.get()).data();
    const same = current && Object.keys(doc).every((k) => current[k] === doc[k]);
    if (same || (!current && doc.points === 0)) continue;
    console.log(`SharerStats/${uid} (${doc.name}): ${doc.points} points (${doc.monthPoints} this month), ${doc.copies} copies, ${doc.worked} worked`);
    writes.push([ref, doc]);
  }

  if (writes.length === 0) {
    console.log("All points are correct.");
  } else if (!write) {
    console.log(`${writes.length} sharer(s) need updating. Run again with --write to save.`);
  } else {
    for (let i = 0; i < writes.length; i += 400) {
      const batch = db.batch();
      writes.slice(i, i + 400).forEach(([ref, doc]) => batch.set(ref, { ...doc, updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
      await batch.commit();
    }
    console.log(`Updated ${writes.length} sharer(s).`);
  }
  process.exit(0);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
