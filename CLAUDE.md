# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Coupo is a coupon-sharing web app, live at https://coupo-e03c4.web.app (Firebase Hosting). Users sign up, post coupons (regular and "social"), vote on them (like/dislike), keep a wishlist, browse by category/brand, report bad coupons, and appear on a top-sharers leaderboard with a public page. Admins have a dashboard, add brands, coupons and categories, edit or delete any coupon, and handle reports. The backend is entirely Firebase (Auth, Firestore, Storage, Cloud Functions); there is no custom API server.

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

Deploy (from `"cloud functions"`): `firebase deploy --only functions`, `--only firestore:rules`, `--only storage`, `--only firestore:indexes`. Nothing in this folder takes effect until it's deployed. The frontend is deployed with `firebase deploy --only hosting` (site `https://coupo-e03c4.web.app`): its predeploy step builds `frontend/` into `cloud functions/public/` (git-ignored; Firebase can't serve files outside this folder) using the local `frontend/.env`, and every path falls back to `index.html` for client-side routing. It deploys whatever is checked out, so deploy from an up-to-date `main`.

### Verifying changes

- Frontend: there are no unit tests (Jest is installed but has no config or `test` script). Check with `npm run build` and `npm run lint`. Lint has 0 errors, but it still exits non-zero because of 2 old warnings (`--max-warnings 0`). Don't add new warnings. Don't "fix" the old `react-hooks/exhaustive-deps` ones by adding dependencies blindly: those effects are meant to run once (e.g. the auth listener) and would loop or refetch.
- Anything touching `firestore.rules`, `storage.rules`, Cloud Functions, or the shape of documents the client writes: run the emulator tests and add a case to `emulator-tests/test.mjs` for the new behavior.

## Firestore database structure

Collection names come from `collectionsList` in `firebaseCollections.ts`. There are two copies: `frontend/firebaseCollections.ts` (imported as `../../firebaseCollections` from `src/`) and `cloud functions/functions/src/firebaseCollections.ts`. They must stay byte-identical: edit the frontend copy, then `cp frontend/firebaseCollections.ts "cloud functions/functions/src/firebaseCollections.ts"`. Rules files can't import it, so a renamed collection must also be renamed in `firestore.rules`. Use `collectionsList.*` instead of string literals.

| Path | Contents | Written by |
|---|---|---|
| `Users/{uid}` | `UserDocument` (`types/UserType.ts`): `userUID, email, firstName, lastName, imageURL, isEmailVerified, birthday?, lastLogin, creationDate` | The user (email sign-up, profile edits, `imageURL` after a profile-image upload); Cloud Function on Google sign-up |
| `UserCoupons/{uid}/Coupons/{couponId}` | The owner's copy of a coupon | The owner (`saveUserNewCoupon`, `updateCoupon`, `removeUserCoupon`); admins (`adminUpdateCoupon`, `adminDeleteCoupon` in `database/coupons.ts`) |
| `UserCoupons/{uid}/SocialCoupons/{couponId}` | The owner's copy of a social coupon | The owner (`saveUserSocialCoupon`, `updateCoupon`, `removeUserCoupon`); admins |
| `Coupons/{couponId}` | Public coupon feed (same doc ID as the owner's copy) | Cloud Functions; admins directly (`saveNewCoupon` on the admin page — these have no `UserCoupons` copy and may have no `userID`) |
| `SocialCoupons/{couponId}` | Public social coupon feed | Cloud Functions; admins (edit/delete tools) |
| `UserVotes/{uid}/likes/{couponId}`, `.../dislikes/{couponId}` | A copy of the coupon the user voted on; the doc's existence *is* the vote | The voter (`saveUserVote`, `removeUserVote`) |
| `WishList/{uid}` | One doc per user, a map `{ [couponId]: couponId }` (IDs from either feed) | The user (`database/wishlist.ts`) |
| `Brands/{autoId}` | `{ brand, imgUrl }` (the client maps `imgUrl` → `imgURL` in `CouponBrand`) | Cloud Function `uploadImage` only |
| `Category/{autoId}` | `{ category }` (lowercase) | Admins, on `/admin/categories` (`database/categories.ts`) |
| `notifications/{uid}` | `{ seen: { [notificationKey]: true } }`: which notifications the user has already seen. The notifications themselves are computed in the browser (`hooks/useNotifications`) | The user (`saveSeenNotifications`) |
| `Reports/{couponId}_{uid}` | `{ couponID, couponType, reason, details, reporterUID, createdAt }`; the ID makes it one report per user per coupon | The reporter (`reportCoupon`); only admins can list or delete them |

`Coupon` fields (`types/CouponType.ts`): `id, name, code, imgUrl, username, category, userID, discount (1–100), likes, dislikes, expiry, description?, createdAt, updatedAt, type`, plus optional terms `storeUrl?, minOrder?` (free text, e.g. "$50"), `usableAt?` ("online" | "in-store" | "both" | ""), `firstOrderOnly?`. Terms are edited with `components/coupons/CouponTermsFields` and handled by `logic/couponTerms.ts`; only show a store link through `shopLink(coupon)`, which allows only http(s) URLs. `id` and `type` ("coupon" | "socialCoupon") are added on read, not stored. Pass `coupon.type` to `updateCoupon`/`removeUserCoupon` so they find the right subcollection. Dates are Firestore `Timestamp`s. The Zod schemas in `src/types/` only derive TypeScript types; nothing calls `.parse()`, and some constraints (e.g. `uuid()` on Firebase UIDs) would fail if they were enforced.

Composite indexes (`firestore.indexes.json`) exist only for `Coupons` on `name` + `createdAt`. A new query that combines a `where` and an `orderBy` on different fields needs a new index; add it there and deploy.

Storage paths: `ProfileImage/{uid}/profile.svg` (always this name, whatever the image type) and `Brands/{brandName}.{ext}` (the file name becomes the brand name).

### Cloud Function fan-out (`cloud functions/functions/src/index.ts`)

The client writes only to user-owned paths; functions maintain the public collections and counters:

- `UserCoupons/{uid}/Coupons|SocialCoupons/{id}`: on create, copy to `Coupons|SocialCoupons/{id}`; on update, copy the edited fields (everything except `likes`/`dislikes`) to the public doc; on delete, delete the public doc.
- `UserVotes/{voter}/likes|dislikes/{couponId}` (`countVote`): a created vote doc adds 1, a deleted one subtracts 1, and re-saving an existing vote changes nothing. A new vote also deletes the same user's opposite vote on that coupon (one vote per user per coupon), whose deletion then subtracts 1 from the other counter. It updates the public coupon (looked up in `Coupons`, then `SocialCoupons`) and the **owner's** copy, found through the public doc's `userID`.
- Auth `onCreate` for non-password providers (Google) → creates `Users/{uid}`. Email/password sign-up creates it on the client (`saveUserToDatabase`).
- Storage `onFinalize` (`uploadImage`): only `Brands/{name}.{ext}` is handled. It makes the file public and adds the `Brands` doc. Profile images are handled entirely by the client (`saveProfileImage` writes the download URL to `Users/{uid}.imageURL`).

Exported function names are what Firebase deploys under; renaming one deletes the old function and creates a new one.

### Known remaining issues

- Counters on coupons voted on before the `countVote` trigger was deployed may be inflated, since un-voting used to add +1. `functions/scripts/recountVotes.js` recounts them from the vote docs: run it without flags to see what's wrong, then with `--write` to fix it (needs a service-account key, like `setAdmin.js`).
- `functions/scripts/addCoupons.js` publishes admin coupons in bulk from a JSON file (dry run by default, `--write` to publish; same service-account key as `setAdmin.js`). Coupons marked `"sample": true` are demo data with made-up codes; remove them all with `--remove-samples` before real launch.
- Coupons created by the admin page (`saveNewCoupon`) have no owner copy, and owner-only features (edit/remove from profile) don't apply to them.

## Security

The rules in this repo implement the model below. They only protect production once deployed (`firebase deploy --only firestore:rules,storage`); after changing them, deploy them and don't assume an earlier deploy covers the new rules. Features that need new rules (e.g. reports, admin edits of users' coupons) are refused on the live site until then.

- **Ownership:** a signed-in user can read and write only under their own uid (`Users/{uid}`, `UserCoupons/{uid}/**`, `UserVotes/{uid}/**`, `WishList/{uid}`). `Users` docs are private (owner or admin). New coupons must have `userID == uid` and `likes == dislikes == 0`; owners can't change `likes`, `dislikes` or `userID` afterwards.
- **Public collections** (`Coupons`, `SocialCoupons`, `Brands`, `Category`) are world-readable. Only admins can write them from the client. Cloud Functions use the Admin SDK and bypass rules.
- **Admin dashboard** (`pages/admin/AdminDashboard`) computes its numbers from both coupon feeds and the reports; only the user count is a query of its own (`getUserCounts`, a `getCountFromServer` on `Users`, allowed because admins can read every `Users` doc).
- **Admin coupon tools:** admins can also read, edit and delete any `UserCoupons/{uid}/**` copy (still never `likes`, `dislikes` or `userID`). `adminUpdateCoupon` / `adminDeleteCoupon` change the public doc and the owner's copy in one batch.
- **Reports:** anyone signed in can create `Reports/{couponId}_{theirUid}` (fixed fields, known `reason`, `details` up to 500 chars, `createdAt == request.time`). Users can only `get` their own report (to show "You reported this"); only admins can list and delete. Reports aren't removed when an owner deletes a coupon; the Reports page shows those as "Coupon was removed".
- **Storage:** `ProfileImage/{uid}/*` is writable only by that user, and `Brands/*` only by admins. Both must be images under 5 MB. Both are publicly readable.
- **Admin = Firebase Auth custom claim `admin: true`.** Grant or revoke it with `GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node scripts/setAdmin.js <email> [--remove]` (in `"cloud functions/functions"`). The user must sign in again to pick it up. Never commit the service-account key. In rules, check `request.auth.token.admin == true`. Never use a field on the user's own `Users` doc, since users can write that.
- **Admin UI:** `AuthProvider` reads the claim from `getIdTokenResult()` and exposes it as `isAdmin` on `UserAuth()`. `auth/components/AdminRoute` sends non-admins away from `/admin` pages. That only hides the UI; the rules are what enforce the admin check.
- When adding a collection or a new client write, add a matching `match` block and emulator tests in the same change. Any path without a rule is denied. Keep the user-owned-path pattern; don't give the client write access to public collections or counters.
- Safe deploy order after changes to both client and rules: functions → frontend → rules. Old clients that don't write a field the new rules require will start failing as soon as the rules are deployed.
- Don't log user documents, the Firebase `User` object, credentials or tokens. Logging error messages/codes is fine.

## Frontend architecture

### Layers

- `src/firebaseConfig.ts` initializes the Firebase app and `auth`; `src/database/databaseConfig.ts` exports `db` and `storage`.
- `src/database/*.ts` — Firestore/Storage access as plain async functions (`databaseCalls.ts` is the large general one; `users`, `profile`, `wishlist`, `social`, `notification` are split by domain). New queries go here, not in components. Existing exception: `logic/logic.ts` builds some queries itself. Importing the `Timestamp` type elsewhere is fine.
- Read lists with `getDocsFromServer`, not `getDocs`: when Firestore can't reach the server, `getDocs` returns an empty list instead of failing, and the app would cache "nothing here" forever. Don't catch errors in read functions and return `[]`; let them throw so the page can show an error.
- `src/logic/logic.ts` — functions that combine several database calls (user votes, wishlist coupons from both feeds, profile update).
- The Coupons, Social Coupons and single-category pages load the whole feed once (`getCouponFeed` via `hooks/useCouponFeed`, key `["coupons", collection]`), then search, filter and sort in the browser (`logic/couponFilters.ts`) and render it a page at a time (`hooks/useShowMore`). Search text, sort and filters live in the URL, not in Redux: `hooks/useCouponSearch` reads and writes `?q=&sort=&category=&brand=&discount=&expiring=week&expired=show` (`category`/`brand` repeat), so links and refreshes keep the results. Add new filters there and in `matchesFilters`. Expired coupons are hidden from these lists and the home page unless `expired=show` (the "Show expired" switch, `components/filter/ExpiredToggle`); `filterCoupons` returns the results plus how many expired ones matched. The home page search just navigates to `/coupons?q=...`. Search matches every word anywhere in brand, code, category, details or sharer, ignoring case. This is fine for hundreds of coupons; with many thousands it needs a search service (e.g. Algolia).

### Auth flow

- `auth/AuthProvider.tsx` listens to `onAuthStateChanged`, loads `Users/{uid}` into the Redux `profile` slice, and renders a full-screen `Loader` until the first auth check finishes, so protected routes don't bounce to `/login` while the session is being restored.
- **Read the current user with `useCurrentUser()`** (`hooks/useCurrentUser.ts`): returns the `UserDocument`, or `null` when signed out. Don't read `state.profile` directly; an empty `userUID` there means "signed out".
- Users whose email isn't verified are treated as signed out (email/password requires verification; Google accounts are already verified).
- If `Users/{uid}` doesn't exist yet (the Google sign-up function may still be running), the profile is built in memory from the Firebase Auth user. Some older accounts have no `Users` doc at all; `updatePersonalDocument` uses `setDoc(..., { merge: true })` so the first profile save creates it. Don't switch it back to `updateDoc`, which fails on a missing doc.
- `loginUserWithEmailPassword` and `signinWthGoogle` wait for the profile to load before returning, so callers can `navigate("/profile")` right away.
- After editing the user's own profile, call `refreshUserDocument()` from `UserAuth()`.
- On sign-out or account switch, `AuthProvider` calls `queryClient.clear()` so the next user never sees the previous user's cached data.
- `UserAuth()` exposes actions (login, signup, logout, `sendEmailVerification`, `refreshUserDocument`) and `isAdmin`, not the user document. It is the only supported auth API.

### State management

Provider order in `main.tsx`: `ErrorBoundary > Redux Provider > BrowserRouter > QueryClientProvider > AuthProvider > VotingContextProvider > App`.

- **React Query** fetches server data. The global `QueryClient` sets `staleTime: Infinity` and disables refetch on focus, so data that loaded fine never refreshes on its own; a query that *failed* is retried on mount and on reconnect. Show skeletons while `isPending` (not `isLoading`, which is false while a request is paused offline), and show `components/ui/LoadError` (or `CouponGrid`'s `isError`/`onRetry`) when `isError`, so a failed load never looks like an empty list. After a mutation, `invalidateQueries` or `setQueryData` the affected keys yourself (see `WishlistButton.tsx`). Put the user's `uid` in the query key for per-user data (e.g. `["userVotes", uid]`, `["wishlist", uid]`) and use `enabled: !!uid` while signed out. Several old per-user keys (`["usercoupons"]`, `["userWishlist"]`, `["expireCoupons"]`) don't include the uid; that's safe only because the cache is cleared on sign-out.
- **Redux Toolkit** (`src/redux/`) holds client state: `profile`, `wishlist`. Use `RootState` from `redux/store/store.ts`. Firestore `Timestamp`s in `profile` trigger RTK's non-serializable warning in development; that's known.
- **React Context:** `AuthProvider` (actions) and `context/VotingContext.tsx` (the current user's likes/dislikes; children render immediately and the vote buttons update when the votes arrive). Voting goes through `toggleVote(coupon, "likes" | "dislikes")`, used by `pages/coupons/components/VoteButton.tsx`.

Which one to use for new code:

1. Data stored in Firestore/Storage → **React Query** calling a function in `src/database/`. Don't copy server data into Redux or Context (the current user in Redux `profile` is the one exception).
2. UI/session state shared across distant components that isn't in Firestore → a **Redux** slice in `src/redux/reducers/`, registered in `rootReducer.ts`.
3. State used by one component or a small subtree → `useState` or props.
4. Don't add new React Contexts.

### Routing and UI

Routes are in `src/App.tsx`. `/addcoupon` and `/profile` are wrapped in `auth/components/ProtectedRoute`, which redirects to `/login` when `useCurrentUser()` is null. Every `/admin...` route (`/admin` dashboard, `/admin/add` add coupon, `/admin/coupons`, `/admin/reports`, `/admin/categories`, `/admin/addBrand`) is wrapped in `AdminRoute` (signed out → `/login`, not admin → `/`) and renders inside `AdminLayout` (admin menu with an open-reports count). One coupon has its own page: `/coupons/:couponId` and `/social/:couponId` (`pages/coupon/CouponPage`, with Share, Report and admin Edit/Delete). Build links with `couponPath(coupon)` from `logic/couponLinks.ts`; a card's brand name links there. `/top-sharers` ranks everyone who shared a coupon by likes received, and `/users/:userId` is a sharer's public page (`pages/sharers/`). Both are built only from the public coupon feeds (`rankSharers` in `logic/sharers.ts`), since `Users` docs are private: the name is the `username` on their newest coupon and the avatar is initials. Coupons with no `userID` (published by Coupo) don't count. A card's "by ..." links to the sharer's page (`sharerPath`).

Forms use `react-hook-form`; toasts use `react-hot-toast`. Page-specific components live in `pages/<page>/components/`, shared ones in `src/components/`.

## Design system

**Direction: "bold ticket stub".** Coupons are drawn as physical tickets (notches, perforated tear lines, a stamped discount stub), with big confident display type, ink-and-paper neutrals and one electric-lime accent. Audience is everyone (all ages), so readability and contrast come first. Tailwind 3.4 + DaisyUI 4; all tokens are in the two themes in `frontend/tailwind.config.js`: `coupo` (light) and `coupo-dark`.

- **Lime is a fill, never text on light backgrounds.** `bg-primary` / `btn-primary` / `.marker` put ink (`primary-content`) on lime. For lime-family *text* (active votes, checkmarks) use `text-accent`: deep olive in light mode, lime in dark mode. Don't use `text-primary` for text.
- **Other colors:** semantic classes only. `bg-base-100` (cards, header), `bg-base-200` (page), `border-base-300`, `text-base-content` (`/70`, `/60` for secondary), `btn-secondary` (ink button), `text-error` / `btn-error` (destructive, expired). No raw palette colors (`gray-*`, `indigo-*`) and no hex in components.
- **Light/dark:** `data-theme` on `<html>`, set before first paint by the script in `index.html`, changed by `hooks/useTheme.ts` (saved as `coupo-theme` in `localStorage`; follows the OS until the user picks). `ThemeToggle` is in the navbar. `dark:` utilities follow the theme. The footer is an ink block in light mode and a raised surface in dark mode.
- **Type:** headings (`h1`-`h3`) use `font-display` (Bricolage Grotesque) automatically, `font-extrabold` + tight tracking. Body is `font-sans` (Plus Jakarta Sans), codes are `font-mono` (JetBrains Mono). All self-hosted via `@fontsource-variable/*` imports in `main.tsx`. Page titles: `text-5xl md:text-6xl`; section titles: `text-4xl md:text-5xl`.
- **Shape:** interactive elements (buttons, inputs, chips, tabs) are pills (`rounded-btn`); containers (cards, panels, dialogs) are `rounded-box` (1.25rem). Textareas are overridden to 1rem in `index.css`.
- **Ticket vocabulary (`index.css`):** `.ticket` (mask that cuts two notches at the tear line; set `--stub` to the stub width), `.perf-x` / `.perf-y` (dotted perforation in `currentColor`), `.stamp` (rubber-stamp badge), `.marker` (lime label behind a word in a headline), `.edge-scallop` (stamp-edge top/bottom on a band). Pages end their header with a `.perf-x` line instead of a border. Use these instead of inventing new decorations.
- **Components:** `PageHeader`, `EmptyState`, `Field` (label above, hint/error below) in `components/ui/`; `CouponGrid` + `CouponCard` (ticket with lime stub; `preview` prop for static previews) for every coupon list; `components/Modal/Modal` for every dialog (`title`, `description`, `footer`, Escape/backdrop close); `components/addCoupon/CouponForm` is the one coupon form (store, social and admin flows) with a live ticket preview; `components/motion/Reveal` for scroll-in sections; `auth/components/ui/*` for the auth screens; `pages/admin/components/AdminSidebar` exports `AdminLayout`; `components/admin/AdminCouponActions` (Edit/Delete any coupon, then `refreshCouponQueries`); `components/coupons/ShareCouponButton` and `ReportCouponButton`; `components/notifications/Notifications` (navbar bell).
- **Icons:** Phosphor via `react-icons/pi` (`Pi...Bold`, `Pi...Fill` for active). Icon-only buttons need `aria-label`. The Google "G" in `GoogleButton` is the one allowed hand-written SVG (brand requirement).
- **Logo:** `components/logo/Logo.tsx` (lime ticket mark with ink outline + "coupo" wordmark; `LogoMark` alone). Same shape as `public/favicon.svg`. The older files in `public/` (`coupo_logo*`, `just_logo.png`) are not the brand.
- **Motion (`motion/react`, expressive but meaningful):** copying a code tears the stub (rotate + spring back), votes pop and the count rolls, cards lift on hover, hero tickets fan in, sections reveal on scroll, profile tabs slide a lime indicator. Every animation checks `useReducedMotion()`, and `index.css` disables transitions under `prefers-reduced-motion`. **Never put primary content (forms, page text) inside an entry animation that starts at `opacity: 0`**: if the animation stalls, the content stays invisible. Motion owns the `transform` of a `motion.*` element, so put Tailwind `rotate-*`/`translate-*` on an inner element.
- **Forms:** DaisyUI `input` / `select` / `textarea` (h-12) inside `Field`. `@tailwindcss/forms` is also loaded, so an `input` nested in a DaisyUI `input` wrapper needs `border-0 bg-transparent p-0 focus:ring-0` (see `Searchbar.tsx`).
- **Copy:** plain, short, friendly. Reuse one label per intent ("Share a coupon", "Browse coupons", "Log in", "Sign up"). No template text, no emoji in UI, no em dashes, no fake numbers or sample data. Empty states invite the next action.
- **Checking UI changes:** run the dev server and look at the page in both themes, on desktop and at phone width. Headless Chrome works: `google-chrome --headless=new --screenshot=out.png --window-size=1440,1000 --virtual-time-budget=12000 --blink-settings=preferredColorScheme=0` (0 = dark, 1 = light). Its minimum window width is 500px, so check phone layouts inside a 390px-wide `<iframe>`. Pages behind login need a signed-in session; don't commit any auth bypass used for screenshots.

## Git conventions

- Default branch is `main`. Work on a feature branch named `<issue-number>-<short-kebab-description>` (e.g. `19-enable-upload-multi-brands-pictures`), or `<short-kebab-description>` when there is no issue, and merge through a pull request.
- Commit messages: one short past-tense line saying what changed (e.g. `added social coupons database functions`). One logical change per commit; don't bundle unrelated work.
- Before committing: `npm run build` passes and `npm run lint` has 0 errors (and no new warnings) in every project you touched. If you touched rules or functions, the emulator tests pass.
- If you changed `firebaseCollections.ts`, confirm both copies are identical: `diff frontend/firebaseCollections.ts "cloud functions/functions/src/firebaseCollections.ts"`.
