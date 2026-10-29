// Rules + Cloud Function trigger tests. Run with `npm test` in this folder (starts the emulators on a fake project).
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const RULES_DIR = fileURLToPath(new URL("..", import.meta.url));
const env = await initializeTestEnvironment({
  projectId: "demo-coupo",
  firestore: { rules: readFileSync(`${RULES_DIR}/firestore.rules`, "utf8") },
  storage: { rules: readFileSync(`${RULES_DIR}/storage.rules`, "utf8") },
});

let failures = 0;
const check = async (name, fn) => {
  try {
    await fn();
    console.log("PASS", name);
  } catch (e) {
    failures++;
    console.log("FAIL", name, "-", e.message);
  }
};
const waitFor = async (fn, ms = 20000) => {
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) {
    last = await fn();
    if (last === true) return;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("timed out waiting, last=" + JSON.stringify(last));
};

const anon = env.unauthenticatedContext().firestore();
const alice = env.authenticatedContext("alice").firestore();
const bob = env.authenticatedContext("bob").firestore();
const adminCtx = env.authenticatedContext("boss", { admin: true });
const admin = adminCtx.firestore();
const readRaw = async (path) => {
  let data;
  await env.withSecurityRulesDisabled(async (ctx) => {
    const s = await getDoc(doc(ctx.firestore(), path));
    data = s.exists() ? s.data() : null;
  });
  return data;
};

const coupon = (userID) => ({
  name: "Nike", code: "SAVE10", imgUrl: "https://x/y.png", username: "Alice A", category: "Sports",
  userID, discount: 10, likes: 0, dislikes: 0, description: "d",
  expiry: Timestamp.fromDate(new Date(Date.now() + 86400000)), createdAt: Timestamp.now(),
});

// ---------- Firestore rules ----------
await check("anon can read Coupons", () => assertSucceeds(getDoc(doc(anon, "Coupons/x"))));
await check("anon cannot write Coupons", () => assertFails(setDoc(doc(anon, "Coupons/x"), { a: 1 })));
await check("user cannot write Coupons", () => assertFails(setDoc(doc(alice, "Coupons/x"), coupon("alice"))));
await check("admin can write Coupons", () => assertSucceeds(setDoc(doc(admin, "Coupons/admin1"), coupon("boss"))));
await check("user cannot write SocialCoupons", () => assertFails(setDoc(doc(alice, "SocialCoupons/x"), coupon("alice"))));
await check("anon can read SocialCoupons", () => assertSucceeds(getDoc(doc(anon, "SocialCoupons/x"))));

await check("alice can create own Users doc", () => assertSucceeds(setDoc(doc(alice, "Users/alice"), { userUID: "alice", firstName: "A" })));
await check("alice can update own Users doc", () => assertSucceeds(updateDoc(doc(alice, "Users/alice"), { firstName: "B", isEmailVerified: true })));
await check("alice cannot read bob's Users doc", () => assertFails(getDoc(doc(alice, "Users/bob"))));
await check("alice cannot write bob's Users doc", () => assertFails(setDoc(doc(alice, "Users/bob"), { userUID: "bob" })));
await check("anon cannot read Users", () => assertFails(getDoc(doc(anon, "Users/alice"))));
// Profile saves use set + merge (updatePersonalDocument), which also creates a missing Users doc.
const carol = env.authenticatedContext("carol").firestore();
await check("carol can create a missing Users doc with set+merge", () =>
  assertSucceeds(setDoc(doc(carol, "Users/carol"), { userUID: "carol", firstName: "C", imageURL: "https://x/p.png" }, { merge: true })));
await check("carol can merge just imageURL into her existing doc", () =>
  assertSucceeds(setDoc(doc(carol, "Users/carol"), { userUID: "carol", imageURL: "https://x/new.png" }, { merge: true })));
await check("set+merge without userUID cannot create a doc", () =>
  assertFails(setDoc(doc(bob, "Users/bob"), { firstName: "B" }, { merge: true })));

await check("alice cannot create coupon with likes>0", () => assertFails(setDoc(doc(alice, "UserCoupons/alice/Coupons/bad"), { ...coupon("alice"), likes: 99 })));
await check("alice cannot create coupon owned by bob", () => assertFails(setDoc(doc(alice, "UserCoupons/alice/Coupons/bad"), coupon("bob"))));
await check("alice cannot create under bob's uid", () => assertFails(setDoc(doc(alice, "UserCoupons/bob/Coupons/bad"), coupon("alice"))));
await check("alice cannot create unknown coupon type", () => assertFails(setDoc(doc(alice, "UserCoupons/alice/Other/bad"), coupon("alice"))));
await check("bob cannot read alice's UserCoupons", () => assertFails(getDoc(doc(bob, "UserCoupons/alice/Coupons/c1"))));

await check("alice cannot read bob's votes", () => assertFails(getDoc(doc(alice, "UserVotes/bob/likes/c1"))));
await check("alice cannot vote as bob", () => assertFails(setDoc(doc(alice, "UserVotes/bob/likes/c1"), { a: 1 })));
await check("alice wishlist own ok", () => assertSucceeds(setDoc(doc(alice, "WishList/alice"), { c1: "c1" }, { merge: true })));
await check("alice wishlist bob denied", () => assertFails(getDoc(doc(alice, "WishList/bob"))));
await check("user cannot write Brands", () => assertFails(setDoc(doc(alice, "Brands/x"), { brand: "x" })));
await check("admin can write Brands", () => assertSucceeds(setDoc(doc(admin, "Brands/x"), { brand: "x", imgUrl: "u" })));
await check("anon can read Brands/Category", async () => {
  await assertSucceeds(getDoc(doc(anon, "Brands/x")));
  await assertSucceeds(getDoc(doc(anon, "Category/x")));
});
await check("user cannot write Category", () => assertFails(setDoc(doc(alice, "Category/x"), { category: "x" })));
await check("admin can delete Category", () => assertSucceeds(deleteDoc(doc(admin, "Category/x"))));

// ---------- Reports ----------
const report = (uid, extra = {}) => ({
  couponID: "c9", couponType: "coupon", reason: "not-working", details: "", reporterUID: uid, createdAt: serverTimestamp(), ...extra,
});
await check("alice can report a coupon", () => assertSucceeds(setDoc(doc(alice, "Reports/c9_alice"), report("alice"))));
await check("alice cannot report the same coupon twice", () => assertFails(setDoc(doc(alice, "Reports/c9_alice"), report("alice"))));
await check("alice can check her own report", () => assertSucceeds(getDoc(doc(alice, "Reports/c9_alice"))));
await check("alice can check a report she hasn't made (missing)", () => assertSucceeds(getDoc(doc(alice, "Reports/c8_alice"))));
await check("bob cannot read alice's report", () => assertFails(getDoc(doc(bob, "Reports/c9_alice"))));
await check("users cannot list reports", () => assertFails(getDocs(collection(alice, "Reports"))));
await check("anon cannot report", () => assertFails(setDoc(doc(anon, "Reports/c9_x"), report("x"))));
await check("bob cannot report as alice", () => assertFails(setDoc(doc(bob, "Reports/c9_alice2"), report("alice"))));
await check("report id must be couponID_uid", () => assertFails(setDoc(doc(bob, "Reports/other_bob"), report("bob"))));
await check("report reason must be known", () => assertFails(setDoc(doc(bob, "Reports/c9_bob"), report("bob", { reason: "meh" }))));
await check("report details max 500", () => assertFails(setDoc(doc(bob, "Reports/c9_bob"), report("bob", { details: "x".repeat(501) }))));
await check("report has no extra fields", () => assertFails(setDoc(doc(bob, "Reports/c9_bob"), report("bob", { likes: 1 }))));
await check("alice cannot delete her report", () => assertFails(deleteDoc(doc(alice, "Reports/c9_alice"))));
await check("admin can list and delete reports", async () => {
  await assertSucceeds(getDocs(collection(admin, "Reports")));
  await assertSucceeds(deleteDoc(doc(admin, "Reports/c9_alice")));
});

// ---------- notifications (seen markers) ----------
await check("alice can save her seen notifications", () =>
  assertSucceeds(setDoc(doc(alice, "notifications/alice"), { seen: { "expiring-c1": true } })));
await check("alice can read her seen notifications", () => assertSucceeds(getDoc(doc(alice, "notifications/alice"))));
await check("seen notifications: no other fields", () =>
  assertFails(setDoc(doc(alice, "notifications/alice"), { seen: {}, admin: true })));
await check("bob cannot touch alice's notifications", () =>
  assertFails(setDoc(doc(bob, "notifications/alice"), { seen: {} })));

// ---------- Admin coupon tools ----------
await check("admin can write SocialCoupons", () => assertSucceeds(setDoc(doc(admin, "SocialCoupons/adm"), coupon("boss"))));
await check("user still cannot write SocialCoupons", () => assertFails(updateDoc(doc(alice, "SocialCoupons/adm"), { discount: 1 })));
await check("bob cannot read alice's coupon copy", () => assertFails(getDoc(doc(bob, "UserCoupons/alice/Coupons/zzz"))));
await check("admin can read a user's coupon copy", () => assertSucceeds(getDoc(doc(admin, "UserCoupons/alice/Coupons/zzz"))));

// ---------- Storage rules ----------
const png = new Uint8Array([137, 80, 78, 71]);
const aliceStorage = env.authenticatedContext("alice").storage();
await check("alice can upload own profile image", () =>
  assertSucceeds(uploadBytes(ref(aliceStorage, "ProfileImage/alice/profile.svg"), png, { contentType: "image/png" })));
await check("alice cannot upload bob's profile image", () =>
  assertFails(uploadBytes(ref(aliceStorage, "ProfileImage/bob/profile.svg"), png, { contentType: "image/png" })));
await check("alice cannot upload non-image", () =>
  assertFails(uploadBytes(ref(aliceStorage, "ProfileImage/alice/x.txt"), png, { contentType: "text/plain" })));
await check("non-admin cannot upload brand", () =>
  assertFails(uploadBytes(ref(aliceStorage, "Brands/Nike.png"), png, { contentType: "image/png" })));
await check("admin can upload brand", () =>
  assertSucceeds(uploadBytes(ref(adminCtx.storage(), "Brands/Nike.png"), png, { contentType: "image/png" })));

// ---------- Cloud Function triggers ----------
await check("alice creates coupon -> mirrored to Coupons", async () => {
  await assertSucceeds(setDoc(doc(alice, "UserCoupons/alice/Coupons/c1"), coupon("alice")));
  await waitFor(async () => (await readRaw("Coupons/c1")) !== null);
});
await check("bob likes c1 -> likes=1 on public and owner copy", async () => {
  await assertSucceeds(setDoc(doc(bob, "UserVotes/bob/likes/c1"), coupon("alice")));
  await waitFor(async () => (await readRaw("Coupons/c1"))?.likes === 1 && (await readRaw("UserCoupons/alice/Coupons/c1"))?.likes === 1);
});
await check("bob re-saves same vote -> still 1", async () => {
  await assertSucceeds(setDoc(doc(bob, "UserVotes/bob/likes/c1"), coupon("alice")));
  await new Promise((r) => setTimeout(r, 2500));
  const p = await readRaw("Coupons/c1");
  if (p.likes !== 1) throw new Error("likes=" + p.likes);
});
await check("bob removes like -> likes=0", async () => {
  await assertSucceeds(deleteDoc(doc(bob, "UserVotes/bob/likes/c1")));
  await waitFor(async () => (await readRaw("Coupons/c1"))?.likes === 0 && (await readRaw("UserCoupons/alice/Coupons/c1"))?.likes === 0);
});
await check("bob dislikes c1 -> dislikes=1", async () => {
  await assertSucceeds(setDoc(doc(bob, "UserVotes/bob/dislikes/c1"), coupon("alice")));
  await waitFor(async () => (await readRaw("Coupons/c1"))?.dislikes === 1);
});
await check("bob switches dislike -> like: dislike removed, likes=1 dislikes=0", async () => {
  await assertSucceeds(setDoc(doc(bob, "UserVotes/bob/likes/c1"), coupon("alice")));
  await waitFor(async () => {
    const p = await readRaw("Coupons/c1");
    const o = await readRaw("UserCoupons/alice/Coupons/c1");
    const oldVote = await readRaw("UserVotes/bob/dislikes/c1");
    return p?.likes === 1 && p?.dislikes === 0 && o?.likes === 1 && o?.dislikes === 0 && oldVote === null;
  });
});
await check("alice cannot edit own likes", () => assertFails(updateDoc(doc(alice, "UserCoupons/alice/Coupons/c1"), { likes: 50 })));
await check("alice edits description -> mirrored, counters kept", async () => {
  await assertSucceeds(updateDoc(doc(alice, "UserCoupons/alice/Coupons/c1"), { description: "new", discount: 20 }));
  await waitFor(async () => {
    const p = await readRaw("Coupons/c1");
    return p?.description === "new" && p?.discount === 20 && p?.likes === 1 && p?.dislikes === 0;
  });
});
await check("vote on admin coupon (no owner copy) -> public likes=1", async () => {
  await assertSucceeds(setDoc(doc(bob, "UserVotes/bob/likes/admin1"), { a: 1 }));
  await waitFor(async () => (await readRaw("Coupons/admin1"))?.likes === 1);
});
await check("social coupon create/vote/delete", async () => {
  await assertSucceeds(setDoc(doc(alice, "UserCoupons/alice/SocialCoupons/s1"), coupon("alice")));
  await waitFor(async () => (await readRaw("SocialCoupons/s1")) !== null);
  await assertSucceeds(setDoc(doc(bob, "UserVotes/bob/likes/s1"), { a: 1 }));
  await waitFor(async () => (await readRaw("SocialCoupons/s1"))?.likes === 1 && (await readRaw("UserCoupons/alice/SocialCoupons/s1"))?.likes === 1);
  await assertSucceeds(deleteDoc(doc(alice, "UserCoupons/alice/SocialCoupons/s1")));
  await waitFor(async () => (await readRaw("SocialCoupons/s1")) === null);
});
await check("alice deletes coupon -> removed from Coupons", async () => {
  await assertSucceeds(deleteDoc(doc(alice, "UserCoupons/alice/Coupons/c1")));
  await waitFor(async () => (await readRaw("Coupons/c1")) === null);
});

await check("admin edits a user's coupon -> mirrored; cannot touch counters", async () => {
  await assertSucceeds(setDoc(doc(alice, "UserCoupons/alice/Coupons/a1"), coupon("alice")));
  await waitFor(async () => (await readRaw("Coupons/a1")) !== null);
  await assertFails(updateDoc(doc(admin, "UserCoupons/alice/Coupons/a1"), { likes: 9 }));
  await assertSucceeds(updateDoc(doc(admin, "UserCoupons/alice/Coupons/a1"), { code: "FIXED", discount: 30 }));
  await waitFor(async () => (await readRaw("Coupons/a1"))?.code === "FIXED");
});
await check("bob cannot delete alice's coupon", () => assertFails(deleteDoc(doc(bob, "UserCoupons/alice/Coupons/a1"))));
await check("admin deletes a user's coupon -> removed from Coupons", async () => {
  await assertSucceeds(deleteDoc(doc(admin, "UserCoupons/alice/Coupons/a1")));
  await waitFor(async () => (await readRaw("Coupons/a1")) === null);
});

// ---------- scripts/recountVotes.js ----------
await check("recountVotes reports, then fixes inflated counters", async () => {
  await assertSucceeds(setDoc(doc(alice, "UserCoupons/alice/Coupons/r1"), coupon("alice")));
  await waitFor(async () => (await readRaw("Coupons/r1")) !== null);
  await assertSucceeds(setDoc(doc(bob, "UserVotes/bob/likes/r1"), { a: 1 }));
  await waitFor(async () => (await readRaw("Coupons/r1"))?.likes === 1);
  // Simulate counters inflated by the old trigger.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await updateDoc(doc(db, "Coupons/r1"), { likes: 7, dislikes: 3 });
    await updateDoc(doc(db, "UserCoupons/alice/Coupons/r1"), { likes: 5 });
  });
  const script = fileURLToPath(new URL("../functions/scripts/recountVotes.js", import.meta.url));
  const run = (...args) =>
    execFileSync("node", [script, ...args], { env: { ...process.env, GCLOUD_PROJECT: "demo-coupo" } }).toString();

  const report = run();
  if (!report.includes("Coupons/r1: likes 7 -> 1, dislikes 3 -> 0")) throw new Error("report: " + report);
  if ((await readRaw("Coupons/r1")).likes !== 7) throw new Error("report mode changed data");

  run("--write");
  const pub = await readRaw("Coupons/r1");
  const own = await readRaw("UserCoupons/alice/Coupons/r1");
  if (pub.likes !== 1 || pub.dislikes !== 0 || own.likes !== 1 || own.dislikes !== 0) {
    throw new Error(`after write: public ${pub.likes}/${pub.dislikes}, owner ${own.likes}/${own.dislikes}`);
  }
  if (run().includes("Coupons/r1")) throw new Error("still reports r1 after write");
});

await env.cleanup();
console.log(failures === 0 ? "ALL PASSED" : `${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
