// Grants (or removes) the `admin` custom claim that firestore.rules and storage.rules check.
//
// Usage, from "cloud functions/functions":
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/setAdmin.js user@example.com
//   GOOGLE_APPLICATION_CREDENTIALS=... node scripts/setAdmin.js user@example.com --remove
//
// Get the service-account key from Firebase console > Project settings > Service accounts.
// Never commit that key. The user must sign out and in again (or wait up to an hour) to get the new claim.

const admin = require("firebase-admin");

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node scripts/setAdmin.js <email> [--remove]");
  process.exit(1);
}

admin.initializeApp();

(async () => {
  const user = await admin.auth().getUserByEmail(email);
  const claims = { ...(user.customClaims || {}) };
  if (flag === "--remove") {
    delete claims.admin;
  } else {
    claims.admin = true;
  }
  await admin.auth().setCustomUserClaims(user.uid, claims);
  console.log(`${email}: admin = ${claims.admin === true}`);
  process.exit(0);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
