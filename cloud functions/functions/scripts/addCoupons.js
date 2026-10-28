// Publishes coupons from a JSON file to the public Coupons collection as admin coupons (no owner).
//
// Usage, from "cloud functions/functions":
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/addCoupons.js coupons.json           # check only
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/addCoupons.js coupons.json --write   # publish
//
// coupons.json: [{ "brand": "nike", "category": "sport", "code": "SAVE20", "discount": 20,
//                  "expiry": "2026-12-31", "description": "Optional details" }, ...]
// brand and category must already exist (Brands / Category collections); the brand logo is filled in automatically.
// A coupon whose brand + code already exists is skipped, so running it twice doesn't create duplicates.
// Add "sample": true to mark a made-up demo coupon. Remove all of them later with:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/addCoupons.js --remove-samples

const admin = require("firebase-admin");
const fs = require("fs");

const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error("Usage: node scripts/addCoupons.js <coupons.json> [--write] | --remove-samples");
  process.exit(1);
}

admin.initializeApp();
const db = admin.firestore();

const removeSamples = async () => {
  const samples = await db.collection("Coupons").where("sample", "==", true).get();
  const batch = db.batch();
  samples.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`Removed ${samples.size} demo coupon(s).`);
};

(async () => {
  if (file === "--remove-samples") return removeSamples().then(() => process.exit(0));
  const input = JSON.parse(fs.readFileSync(file, "utf8"));
  const brands = new Map((await db.collection("Brands").get()).docs.map((d) => [String(d.get("brand")).toLowerCase(), d.get("imgUrl")]));
  // lowercase -> the category name exactly as stored, so coupons use the same spelling as the Category list.
  const categories = new Map((await db.collection("Category").get()).docs.map((d) => [String(d.get("category")).toLowerCase(), String(d.get("category"))]));
  const existing = new Set((await db.collection("Coupons").get()).docs.map((d) => `${String(d.get("name")).toLowerCase()}|${String(d.get("code")).toUpperCase()}`));
  const today = new Date().toISOString().split("T")[0];

  const ok = [];
  input.forEach((c, i) => {
    const row = `#${i + 1} ${c.brand} ${c.code}`;
    const problems = [];
    const brand = String(c.brand || "").toLowerCase();
    const category = String(c.category || "").toLowerCase();
    if (!brands.has(brand)) problems.push(`unknown brand "${c.brand}"`);
    if (!categories.has(category)) problems.push(`unknown category "${c.category}"`);
    if (!c.code || !String(c.code).trim()) problems.push("missing code");
    if (!Number.isInteger(c.discount) || c.discount < 1 || c.discount > 100) problems.push("discount must be a whole number 1-100");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.expiry || "") || c.expiry < today) problems.push("expiry must be a future date YYYY-MM-DD");
    if (problems.length) return console.log(`SKIP ${row}: ${problems.join(", ")}`);
    const key = `${brand}|${String(c.code).trim().toUpperCase()}`;
    if (existing.has(key)) return console.log(`SKIP ${row}: already on Coupo (or listed twice in this file)`);
    existing.add(key);
    const [y, m, d] = c.expiry.split("-").map(Number);
    const now = admin.firestore.Timestamp.now();
    ok.push({
      name: brand,
      imgUrl: brands.get(brand) || "",
      category: categories.get(category),
      code: String(c.code).trim().toUpperCase(),
      discount: c.discount,
      description: String(c.description || "").trim(),
      userID: "",
      username: "Coupo",
      likes: 0,
      dislikes: 0,
      expiry: admin.firestore.Timestamp.fromDate(new Date(y, m - 1, d, 23, 59, 59)),
      createdAt: now,
      updatedAt: now,
      type: "coupon",
      ...(c.sample === true ? { sample: true } : {}),
    });
    console.log(`OK   ${row}: ${c.discount}% until ${c.expiry}`);
  });

  if (flag !== "--write") {
    console.log(`\n${ok.length} coupon(s) ready. Run again with --write to publish.`);
  } else if (ok.length) {
    const batch = db.batch();
    ok.forEach((coupon) => batch.set(db.collection("Coupons").doc(), coupon));
    await batch.commit();
    console.log(`\nPublished ${ok.length} coupon(s).`);
  }
  process.exit(0);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
