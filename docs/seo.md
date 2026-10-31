# SEO: deploy, Google Search Console and custom domain

## 1. Deploy (in this order)

From the repo, on an up-to-date `main`:

```bash
cd frontend && npm run build          # check it builds
cd "../cloud functions"
firebase deploy --only functions      # the couponPreview function now also serves store/category pages, the sitemap and robots.txt
firebase deploy --only hosting        # new pages + the new rewrites in firebase.json
```

Functions first: the new Hosting rewrites send `/store/...`, `/sitemap.xml` and `/robots.txt` to the function, so it must already know how to answer them.

Check it worked (all should load):

- https://coupo-e03c4.web.app/robots.txt
- https://coupo-e03c4.web.app/sitemap.xml
- https://coupo-e03c4.web.app/stores
- `curl -s https://coupo-e03c4.web.app/stores | grep "<h1>"` shows "All stores" (that's what Google sees before JavaScript runs).

## 1b. Faster store pages (stores summary): deploy order

Store pages read only their own store's coupons, using a `storeSlug` field on each coupon and a small `Stores` collection. Both are filled in by Cloud Functions. Deploy in this order, from `cloud functions`:

```bash
firebase deploy --only firestore:rules      # lets everyone read the new Stores collection
firebase deploy --only functions            # syncStore triggers + the updated couponPreview
cd functions && npm run build
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/backfillStores.js           # report: what will change
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node scripts/backfillStores.js --write   # fill storeSlug + Stores
cd ..
firebase deploy --only hosting              # the app now reads by storeSlug
```

Hosting must come after the backfill: until coupons have `storeSlug`, the new store pages would show "No coupons for this store yet". No new Firestore index is needed.

Check: open https://coupo-e03c4.web.app/stores (every store listed) and one store page. In the Firebase console, `Stores` should have one document per store.

## 2. Google Search Console

1. Go to https://search.google.com/search-console and sign in with the Google account that should own the site.
2. Click **Add property**, choose **URL prefix** (the right-hand box), and enter `https://coupo-e03c4.web.app/`. ("Domain" properties need DNS access, which you don't have on a `web.app` address.)
3. Verify ownership. The easiest way on Firebase Hosting is **HTML file**:
   - Download the file Google gives you (e.g. `google1234abcd.html`).
   - Put it in `frontend/public/` and deploy hosting again (`firebase deploy --only hosting` from `cloud functions`).
   - Open `https://coupo-e03c4.web.app/google1234abcd.html` to check it loads, then click **Verify**.
   - Keep the file in the repo; if it disappears, Google un-verifies the site.
   - Alternative: **HTML tag**. Copy the `<meta name="google-site-verification" ...>` tag into `frontend/index.html` just above `<!-- preview:start -->` (not inside it), deploy hosting, click **Verify**.
4. In the left menu open **Sitemaps**, type `sitemap.xml` in "Add a new sitemap" and click **Submit**. Status should turn to "Success" within a few minutes to a day.
5. Optional, to speed things up: open **URL inspection**, paste `https://coupo-e03c4.web.app/stores`, then **Request indexing**. Do the same for two or three big store pages.
6. Come back after a week: **Pages** shows what got indexed and why some didn't; **Performance** shows searches people found you with.

It's normal for a new site to take a few weeks before pages show up in search.

## 3. Later: custom domain

1. Buy the domain, then in the Firebase console: **Hosting → Add custom domain**, and follow the DNS steps.
2. Point the code at it:
   - `cloud functions/functions/.env`: `SITE_URL=https://yourdomain.com`
   - `frontend/.env`: `VITE_SITE_URL=https://yourdomain.com`
3. Deploy functions, then hosting.
4. In Search Console, add the new domain as a new property (this time **Domain** works, verified by DNS) and submit `sitemap.xml` again.
5. In the old `web.app` property, use **Settings → Change of address** to tell Google the site moved.
6. Fix the reset-email spam issue at the same time (Firebase Auth custom email domain).
