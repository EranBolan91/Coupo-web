// Gives every public coupon its `storeSlug` and rebuilds the Stores/{slug} summaries from scratch.
// Run once after deploying the syncStore functions (new coupons get both automatically from then on).
// Safe to run again at any time, e.g. if the Stores list ever looks wrong.
//
// Usage, from "cloud functions/functions" (build first, the script uses the compiled code in lib/):
//   npm run build
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/backfillStores.js           # report only
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/backfillStores.js --write   # apply
//
// With the functions deployed, each storeSlug it sets also makes syncStore rebuild that store once
// more. That's harmless (same result), just extra reads.

const admin = require("firebase-admin");

const write = process.argv.includes("--write");
admin.initializeApp();
const db = admin.firestore();

const { couponCollections, slugOf, summarize, toFeedCoupon } = require("../lib/stores");
const { collectionsList } = require("../lib/firebaseCollections");

(async () => {
  const slugUpdates = []; // [ref, slug]
  const bySlug = new Map(); // slug -> FeedCoupon[]

  for (const [collectionName, type] of couponCollections) {
    const snapshot = await db.collection(collectionName).get();
    for (const coupon of snapshot.docs) {
      const data = coupon.data();
      const slug = slugOf(data);
      if (data.storeSlug !== slug) {
        slugUpdates.push([coupon.ref, slug]);
        console.log(`${collectionName}/${coupon.id} (${data.name}): storeSlug "${data.storeSlug ?? ""}" -> "${slug}"`);
      }
      if (slug) bySlug.set(slug, [...(bySlug.get(slug) || []), toFeedCoupon(coupon.id, type, data)]);
    }
  }

  const existing = await db.collection(collectionsList.stores).get();
  const stale = existing.docs.filter((store) => !bySlug.has(store.id));
  stale.forEach((store) => console.log(`${collectionsList.stores}/${store.id}: no coupons left, will be deleted`));

  console.log(`\n${slugUpdates.length} coupons need a storeSlug, ${bySlug.size} stores, ${stale.length} old store docs.`);
  if (!write) {
    console.log("Report only. Run again with --write to apply.");
    return;
  }

  // Firestore batches hold at most 500 writes.
  const writes = [
    ...slugUpdates.map(([ref, slug]) => (batch) => batch.update(ref, { storeSlug: slug })),
    ...[...bySlug.entries()].map(([slug, coupons]) => (batch) =>
      batch.set(db.collection(collectionsList.stores).doc(slug), summarize(slug, coupons))
    ),
    ...stale.map((store) => (batch) => batch.delete(store.ref)),
  ];
  for (let i = 0; i < writes.length; i += 400) {
    const batch = db.batch();
    writes.slice(i, i + 400).forEach((add) => add(batch));
    await batch.commit();
  }
  console.log(`Done: ${slugUpdates.length} coupons updated, ${bySlug.size} stores written, ${stale.length} deleted.`);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
