# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Coupo is a coupon-sharing web app. Users sign up, post coupons (regular and "social"), vote on them (like/dislike), keep a wishlist, and browse by category/brand. Admins add brands and coupons. The backend is entirely Firebase (Auth, Firestore, Storage, Cloud Functions); there is no custom API server.

The repo has separate npm projects (no workspace setup, no root `package.json`):

- `frontend/` — React 18 + TypeScript + Vite SPA
- `cloud functions/` — Firebase project config (`firebase.json`, `.firebaserc` → project `coupo-e03c4`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`)
  - `cloud functions/functions/` — Cloud Functions (TypeScript, Node 22 — `engines.node` in its package.json; Node 18 and 20 are decommissioned by Firebase)
  - `cloud functions/emulator-tests/` — rules + trigger tests against the local emulators

The directory name has a space in it, so quote paths in shell commands.

## Commands

Frontend (run in `frontend/`):

```bash
npm install
npm run dev       # Vite dev server
npm run build     # tsc type-check + vite build
npm run lint      # ESLint with --max-warnings 0
npx tsc --noEmit  # type-check only
```

Requires `frontend/.env` (git-ignored) with the Firebase web config: `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID`, `VITE_MEASUREMENT_ID`. The dev server always talks to the live Firebase project in `.env`; the frontend is not wired to the emulators.

Cloud Functions (run in `"cloud functions/functions"`):

```bash
npm run build     # tsc -> lib/
npm run lint      # eslint (.eslintrc.json is the active config; .eslintrc.ts is not loaded). Runs as a deploy predeploy step
npm run deploy    # build + firebase deploy --only functions
```

Emulator tests (run in `"cloud functions/emulator-tests"`, after `npm install`):

```bash
npm test          # builds functions, starts firestore/storage/functions/auth emulators on fake project demo-coupo, runs test.mjs
```

The emulators need Java 21+. The machine's default `java` is 11, so prefix the command: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 PATH=/usr/lib/jvm/java-21-openjdk-amd64/bin:$PATH npm test`. A log line `Property admin is undefined on object` is expected (it's a denied non-admin request).

Deploy (from `"cloud functions"`): `firebase deploy --only functions`, `--only firestore:rules`, `--only storage`, `--only firestore:indexes`. Nothing in this folder takes effect until it's deployed. Firebase Hosting is not configured here.

### Verifying changes

- Frontend: there are no unit tests (Jest is installed but has no config or `test` script). Check with `npm run build` and `npm run lint`. Lint has 0 errors, but it still exits non-zero because of 9 old `react-hooks/exhaustive-deps` warnings (`--max-warnings 0`). Don't add new warnings. Don't "fix" the existing ones by adding dependencies blindly: several effects drive `fetchNextPage`/URL params and would loop or refetch.
- Anything touching `firestore.rules`, `storage.rules`, Cloud Functions, or the shape of documents the client writes: run the emulator tests and add a case to `emulator-tests/test.mjs` for the new behavior.
- `src/hooks/useAuth.ts` is an unfinished draft with `// @ts-nocheck` and `/* eslint-disable */` at the top so it doesn't block the build. It is not imported anywhere.

## Firestore database structure

Collection names come from `collectionsList` in `firebaseCollections.ts`. There are two copies: `frontend/firebaseCollections.ts` (imported as `../../firebaseCollections` from `src/`) and `cloud functions/functions/src/firebaseCollections.ts`. They must stay byte-identical: edit the frontend copy, then `cp frontend/firebaseCollections.ts "cloud functions/functions/src/firebaseCollections.ts"`. Rules files can't import it, so a renamed collection must also be renamed in `firestore.rules`. Use `collectionsList.*` instead of string literals.

| Path | Contents | Written by |
|---|---|---|
| `Users/{uid}` | `UserDocument` (`types/UserType.ts`): `userUID, email, firstName, lastName, imageURL, isEmailVerified, birthday?, lastLogin, creationDate` | The user (email sign-up, profile edits, `imageURL` after a profile-image upload); Cloud Function on Google sign-up |
| `UserCoupons/{uid}/Coupons/{couponId}` | The owner's copy of a coupon | The owner (`saveUserNewCoupon`, `updateCoupon`, `removeUserCoupon`) |
| `UserCoupons/{uid}/SocialCoupons/{couponId}` | The owner's copy of a social coupon | The owner (`saveUserSocialCoupon`, `updateCoupon`, `removeUserCoupon`) |
| `Coupons/{couponId}` | Public coupon feed (same doc ID as the owner's copy) | Cloud Functions; admins directly (`saveNewCoupon` on the admin page — these have no `UserCoupons` copy and may have no `userID`) |
| `SocialCoupons/{couponId}` | Public social coupon feed | Cloud Functions only |
| `UserVotes/{uid}/likes/{couponId}`, `.../dislikes/{couponId}` | A copy of the coupon the user voted on; the doc's existence *is* the vote | The voter (`saveUserVote`, `removeUserVote`) |
| `WishList/{uid}` | One doc per user, a map `{ [couponId]: couponId }` (IDs from either feed) | The user (`database/wishlist.ts`) |
| `Brands/{autoId}` | `{ brand, imgUrl }` (the client maps `imgUrl` → `imgURL` in `CouponBrand`) | Cloud Function `uploadImage` only |
| `Category/{autoId}` | `{ category }` | Admins / Firebase console (no code writes it) |
| `notifications/{uid}` | Not used yet (`getNotifications` is a stub) | — |

`Coupon` fields (`types/CouponType.ts`): `id, name, code, imgUrl, username, category, userID, discount (1–100), likes, dislikes, expiry, description?, createdAt, updatedAt, type`. `id` and `type` ("coupon" | "socialCoupon") are added on read, not stored. Pass `coupon.type` to `updateCoupon`/`removeUserCoupon` so they find the right subcollection. Dates are Firestore `Timestamp`s. The Zod schemas in `src/types/` only derive TypeScript types; nothing calls `.parse()`, and some constraints (e.g. `uuid()` on Firebase UIDs) would fail if they were enforced.

Composite indexes (`firestore.indexes.json`) exist only for `Coupons` on `name` + `createdAt`. A new query that combines a `where` and an `orderBy` on different fields needs a new index; add it there and deploy.

Storage paths: `ProfileImage/{uid}/profile.svg` (always this name, whatever the image type) and `Brands/{brandName}.{ext}` (the file name becomes the brand name).

### Cloud Function fan-out (`cloud functions/functions/src/index.ts`)

The client writes only to user-owned paths; functions maintain the public collections and counters:

- `UserCoupons/{uid}/Coupons|SocialCoupons/{id}`: on create, copy to `Coupons|SocialCoupons/{id}`; on update, copy the edited fields (everything except `likes`/`dislikes`) to the public doc; on delete, delete the public doc.
- `UserVotes/{voter}/likes|dislikes/{couponId}` (`countVote`): a created vote doc adds 1, a deleted one subtracts 1, and re-saving an existing vote changes nothing. It updates the public coupon (looked up in `Coupons`, then `SocialCoupons`) and the **owner's** copy, found through the public doc's `userID`.
- Auth `onCreate` for non-password providers (Google) → creates `Users/{uid}`. Email/password sign-up creates it on the client (`saveUserToDatabase`).
- Storage `onFinalize` (`uploadImage`): only `Brands/{name}.{ext}` is handled. It makes the file public and adds the `Brands` doc. Profile images are handled entirely by the client (`saveProfileImage` writes the download URL to `Users/{uid}.imageURL`).

Exported function names are what Firebase deploys under; renaming one deletes the old function and creates a new one.

### Known remaining issues

- Counters on coupons voted on before the `countVote` trigger was deployed may be inflated, since un-voting used to add +1. There's no repair script yet.
- Coupons created by the admin page (`saveNewCoupon`) have no owner copy, and owner-only features (edit/remove from profile) don't apply to them.
- Nothing stops a user from both liking and disliking the same coupon.

## Security

The rules in this repo implement the model below. **Check whether they've been deployed** (`firebase deploy --only firestore:rules,storage`) before assuming production is protected. Before this change the deployed Firestore rules allowed everything and the Storage rules blocked all uploads.

- **Ownership:** a signed-in user can read and write only under their own uid (`Users/{uid}`, `UserCoupons/{uid}/**`, `UserVotes/{uid}/**`, `WishList/{uid}`). `Users` docs are private (owner or admin). New coupons must have `userID == uid` and `likes == dislikes == 0`; owners can't change `likes`, `dislikes` or `userID` afterwards.
- **Public collections** (`Coupons`, `SocialCoupons`, `Brands`, `Category`) are world-readable. Only admins can write `Coupons`, `Brands` and `Category`; nobody can write `SocialCoupons` from the client. Cloud Functions use the Admin SDK and bypass rules.
- **Storage:** `ProfileImage/{uid}/*` is writable only by that user, and `Brands/*` only by admins. Both must be images under 5 MB. Both are publicly readable.
- **Admin = Firebase Auth custom claim `admin: true`.** Grant or revoke it with `GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node scripts/setAdmin.js <email> [--remove]` (in `"cloud functions/functions"`). The user must sign in again to pick it up. Never commit the service-account key. In rules, check `request.auth.token.admin == true`. Never use a field on the user's own `Users` doc, since users can write that.
- **Admin UI is not gated yet:** `/admin` routes only require sign-in. The rules block non-admin writes, but the pages still render. To gate them, read the claim with `auth.currentUser.getIdTokenResult()` (`claims.admin`).
- When adding a collection or a new client write, add a matching `match` block and emulator tests in the same change. Any path without a rule is denied. Keep the user-owned-path pattern; don't give the client write access to public collections or counters.
- Safe deploy order after changes to both client and rules: functions → frontend → rules. Old clients that don't write a field the new rules require will start failing as soon as the rules are deployed.
- Don't log user documents or tokens (there are many `console.log` calls with user data today; don't add more).

## Frontend architecture

### Layers

- `src/firebaseConfig.ts` initializes the Firebase app and `auth`; `src/database/databaseConfig.ts` exports `db` and `storage`.
- `src/database/*.ts` — Firestore/Storage access as plain async functions (`databaseCalls.ts` is the large general one; `users`, `profile`, `wishlist`, `social`, `notification` are split by domain). New queries go here, not in components. Existing exceptions: `hooks/useFetchCoupons.ts` and `logic/logic.ts` build some queries themselves. Importing the `Timestamp` type elsewhere is fine.
- `src/logic/logic.ts` — functions that combine several database calls (user votes, wishlist coupons from both feeds, profile update).
- Pagination uses Firestore cursors (`startAfter` + `limit`) fed into React Query `useInfiniteQuery`.

### Auth flow

- `auth/AuthProvider.tsx` listens to `onAuthStateChanged`, loads `Users/{uid}` into the Redux `profile` slice, and renders a full-screen `Loader` until the first auth check finishes, so protected routes don't bounce to `/login` while the session is being restored.
- **Read the current user with `useCurrentUser()`** (`hooks/useCurrentUser.ts`): returns the `UserDocument`, or `null` when signed out. Don't read `state.profile` directly; an empty `userUID` there means "signed out".
- Users whose email isn't verified are treated as signed out (email/password requires verification; Google accounts are already verified).
- If `Users/{uid}` doesn't exist yet (the Google sign-up function may still be running), the profile is built in memory from the Firebase Auth user.
- `loginUserWithEmailPassword` and `signinWthGoogle` wait for the profile to load before returning, so callers can `navigate("/profile")` right away.
- After editing the user's own profile, call `refreshUserDocument()` from `UserAuth()`.
- On sign-out or account switch, `AuthProvider` calls `queryClient.clear()` so the next user never sees the previous user's cached data.
- `UserAuth()` exposes only actions (login, signup, logout, `sendEmailVerification`, `refreshUserDocument`), not the user. It is the only supported auth API.

### State management

Provider order in `main.tsx`: `ErrorBoundary > Redux Provider > BrowserRouter > QueryClientProvider > AuthProvider > VotingContextProvider > App`.

- **React Query** fetches server data. The global `QueryClient` sets `staleTime: Infinity` and disables refetch on focus/reconnect/mount, so cached data never refreshes on its own. After a mutation, `invalidateQueries` or `setQueryData` the affected keys yourself (see `WishlistButton.tsx`). Put the user's `uid` in the query key for per-user data (e.g. `["userVotes", uid]`, `["wishlist", uid]`) and use `enabled: !!uid` while signed out. Several old per-user keys (`["usercoupons"]`, `["userWishlist"]`, `["expireCoupons"]`) don't include the uid; that's safe only because the cache is cleared on sign-out.
- **Redux Toolkit** (`src/redux/`) holds client state: `profile`, `wishlist`, `filters`. Use `RootState` from `redux/store/store.ts`. `store.ts` logs the whole state on every change, and Firestore `Timestamp`s in `profile` trigger RTK's non-serializable warning in development; both are known.
- **React Context:** `AuthProvider` (actions) and `context/VotingContext.tsx` (the current user's likes/dislikes; children render immediately and the vote buttons update when the votes arrive).

Which one to use for new code:

1. Data stored in Firestore/Storage → **React Query** calling a function in `src/database/`. Don't copy server data into Redux or Context (the current user in Redux `profile` is the one exception).
2. UI/session state shared across distant components that isn't in Firestore → a **Redux** slice in `src/redux/reducers/`, registered in `rootReducer.ts`.
3. State used by one component or a small subtree → `useState` or props.
4. Don't add new React Contexts.

### Routing and UI

Routes are in `src/App.tsx`. `/addcoupon`, `/profile`, `/admin` and `/admin/addBrand` are wrapped in `auth/components/ProtectedRoute`, which redirects to `/login` when `useCurrentUser()` is null. Paths containing `/admin` render `AdminSidebar` instead of `Navbar`.

Styling is Tailwind with DaisyUI (custom `coupoThem` theme in `tailwind.config.js`) and `@tailwindcss/forms`. Forms use `react-hook-form`; toasts use `react-hot-toast`. Page-specific components live in `pages/<page>/components/`, shared ones in `src/components/`.

## Git conventions

- Default branch is `main`. Work on a feature branch named `<issue-number>-<short-kebab-description>` (e.g. `19-enable-upload-multi-brands-pictures`), or `<short-kebab-description>` when there is no issue, and merge through a pull request.
- Commit messages: one short past-tense line saying what changed (e.g. `added social coupons database functions`). One logical change per commit; don't bundle unrelated work.
- Before committing: `npm run build` passes and `npm run lint` has 0 errors (and no new warnings) in every project you touched. If you touched rules or functions, the emulator tests pass.
- If you changed `firebaseCollections.ts`, confirm both copies are identical: `diff frontend/firebaseCollections.ts "cloud functions/functions/src/firebaseCollections.ts"`.
