// Search-engine pages: store pages (/store/{slug}), the store list (/stores), category pages
// (/categories, /categories/{name}), the readable part of coupon pages, the sitemap and robots.txt.
// Pure helpers only (no Firebase), so they can be checked without the emulators. seoServer.ts loads
// the coupons and calls these.
import { PageInfo, SITE_URL, couponTitle, escapeHtml, oneLine } from "./couponPreview";

// One coupon from either public feed, with dates already converted.
export type FeedCoupon = {
  id: string;
  type: "coupon" | "socialCoupon";
  name: string;
  code: string;
  discount: number;
  category: string;
  description: string;
  imgUrl: string;
  username: string;
  likes: number;
  dislikes: number;
  expiry: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type Store = {
  slug: string;
  name: string;
  imgUrl: string;
  coupons: FeedCoupon[];
  active: FeedCoupon[];
  expired: FeedCoupon[];
  categories: string[];
  bestDiscount: number;
  updatedAt: Date | null;
};

export type RenderedPage = { status: number; page: PageInfo; body: string };

// Same as storeSlug in frontend/src/logic/stores.ts; keep them identical.
// "Tommy Hilfiger" -> "tommy-hilfiger". Letters of any language are kept.
export const storeSlug = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

export const storePath = (name: string) => `/store/${encodeURIComponent(storeSlug(name))}`;
export const categoryPath = (category: string) => `/categories/${encodeURIComponent(category.toLowerCase())}`;
export const couponPagePath = (coupon: Pick<FeedCoupon, "id" | "type">) =>
  `${coupon.type === "socialCoupon" ? "/social" : "/coupons"}/${coupon.id}`;

export const isExpired = (coupon: Pick<FeedCoupon, "expiry">, now: number) =>
  coupon.expiry !== null && coupon.expiry.getTime() < now;

// "October 2026", in UTC so every server says the same month.
export const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

const shortDate = (date: Date) =>
  date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const latest = (dates: (Date | null)[]) =>
  dates.reduce<Date | null>((max, date) => (date && (!max || date > max) ? date : max), null);

// Best first: codes people said worked, then bigger discounts, then newer.
const byQuality = (a: FeedCoupon, b: FeedCoupon) =>
  b.likes - b.dislikes - (a.likes - a.dislikes) ||
  b.discount - a.discount ||
  (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);

// Groups both feeds by store name (ignoring case and punctuation), A-Z.
export const groupStores = (coupons: FeedCoupon[], now: number): Store[] => {
  const bySlug = new Map<string, FeedCoupon[]>();
  for (const coupon of coupons) {
    const slug = storeSlug(coupon.name || "");
    if (!slug) continue;
    bySlug.set(slug, [...(bySlug.get(slug) ?? []), coupon]);
  }
  return [...bySlug.entries()]
    .map(([slug, list]) => {
      const sorted = [...list].sort(byQuality);
      const active = sorted.filter((coupon) => !isExpired(coupon, now));
      const expired = sorted.filter((coupon) => isExpired(coupon, now));
      // The most common spelling of the name, and the newest logo.
      const names = new Map<string, number>();
      list.forEach((coupon) => names.set(coupon.name.trim(), (names.get(coupon.name.trim()) ?? 0) + 1));
      const spelling = [...names.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const name = spelling.charAt(0).toUpperCase() + spelling.slice(1);
      const newest = [...list].sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      return {
        slug,
        name,
        imgUrl: newest.find((coupon) => coupon.imgUrl)?.imgUrl ?? "",
        coupons: sorted,
        active,
        expired,
        categories: [...new Set(list.map((coupon) => coupon.category?.toLowerCase()).filter(Boolean))].sort(),
        bestDiscount: Math.max(0, ...active.map((coupon) => coupon.discount)),
        updatedAt: latest(list.map((coupon) => coupon.updatedAt ?? coupon.createdAt)),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
};

// Categories that have at least one coupon, A-Z, lowercase.
export const categoriesOf = (coupons: FeedCoupon[]) =>
  [...new Set(coupons.map((coupon) => coupon.category?.toLowerCase().trim()).filter(Boolean))].sort();

// Stores that share a category with this one, most active codes first.
export const relatedStores = (store: Store, stores: Store[], count = 6) =>
  stores
    .filter((other) => other.slug !== store.slug && other.categories.some((c) => store.categories.includes(c)))
    .sort((a, b) => b.active.length - a.active.length || a.name.localeCompare(b.name))
    .slice(0, count);

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

// ---------- Structured data (schema.org JSON-LD) ----------

const breadcrumbs = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map(([name, path], index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": name,
    "item": `${SITE_URL}${path}`,
  })),
});

const offer = (coupon: FeedCoupon, now: number) => ({
  "@type": "Offer",
  "name": couponTitle(coupon),
  "url": `${SITE_URL}${couponPagePath(coupon)}`,
  ...(coupon.description ? { description: oneLine(coupon.description, 300) } : {}),
  ...(coupon.category ? { category: coupon.category } : {}),
  ...(coupon.expiry ? { validThrough: coupon.expiry.toISOString() } : {}),
  "availability": isExpired(coupon, now) ? "https://schema.org/Discontinued" : "https://schema.org/InStock",
  "seller": { "@type": "Organization", "name": coupon.name },
});

const offerList = (name: string, path: string, coupons: FeedCoupon[], now: number) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": name,
  "url": `${SITE_URL}${path}`,
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": coupons.length,
    "itemListElement": coupons.slice(0, 50).map((coupon, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": offer(coupon, now),
    })),
  },
});

export const couponJsonLd = (coupon: FeedCoupon, now: number) => [
  { "@context": "https://schema.org", ...offer(coupon, now) },
  breadcrumbs([
    ["Coupo", "/"],
    ["Stores", "/stores"],
    [coupon.name, storePath(coupon.name)],
    [couponTitle(coupon), couponPagePath(coupon)],
  ]),
];

// ---------- Readable HTML (what crawlers see before JavaScript runs) ----------

const h = escapeHtml;
const link = (path: string, text: string) => `<a href="${h(path)}">${h(text)}</a>`;

// Light styling for the moment before the app starts, using the site's theme colors.
const style = `<style>
.ssr{max-width:72rem;margin:0 auto;padding:3rem 1rem;font-family:"Plus Jakarta Sans Variable",system-ui,sans-serif;color:oklch(var(--bc,0.2 0 0));line-height:1.5}
.ssr h1{font-size:2.5rem;line-height:1;font-weight:800;margin:0 0 1rem}.ssr h2{font-size:1.5rem;font-weight:800;margin:2rem 0 .75rem}
.ssr ul{padding-left:1.25rem}.ssr li{margin:.4rem 0}.ssr a{color:inherit;text-decoration:underline}.ssr code{font-weight:700}.ssr nav{font-size:.875rem;opacity:.7;margin-bottom:1rem}
</style>`;

const crumbsHtml = (items: [string, string][]) =>
  `<nav aria-label="Breadcrumb">${items.map(([name, path]) => link(path, name)).join(" / ")}</nav>`;

const couponLine = (coupon: FeedCoupon, now: number, withStore: boolean) => {
  const bits = [
    `<a href="${h(couponPagePath(coupon))}">${h(withStore ? couponTitle(coupon) : coupon.discount > 0 ? `${coupon.discount}% off` : "Coupon")}</a>`,
    coupon.code ? `code <code>${h(oneLine(coupon.code, 60))}</code>` : "",
    coupon.description ? h(oneLine(coupon.description, 140)) : "",
    coupon.expiry ? (isExpired(coupon, now) ? `expired ${shortDate(coupon.expiry)}` : `valid until ${shortDate(coupon.expiry)}`) : "",
    coupon.likes > 0 ? `worked for ${plural(coupon.likes, "person", "people")}` : "",
  ].filter(Boolean);
  return `<li>${bits.join(" · ")}</li>`;
};

const wrap = (inner: string) => `${style}<main class="ssr">${inner}</main>`;

export const storeDescription = (store: Store) => {
  const count = store.active.length;
  const best = store.bestDiscount > 0 ? `, up to ${store.bestDiscount}% off` : "";
  const where = store.categories.length ? ` ${capitalize(store.name)} is in ${store.categories.join(", ")}.` : "";
  return count > 0 ?
    `${plural(count, "working coupon code")} for ${store.name}${best}, shared and checked by Coupo shoppers.${where}` :
    `No working ${store.name} coupon codes right now. See expired codes and coupons from similar stores on Coupo.${where}`;
};

export const storePage = (store: Store, stores: Store[], now: number): RenderedPage => {
  const path = storePath(store.name);
  const title = `${store.name} coupon codes, ${monthLabel(new Date(now))}`;
  const description = storeDescription(store);
  const related = relatedStores(store, stores);
  const crumbs: [string, string][] = [["Coupo", "/"], ["Stores", "/stores"], [store.name, path]];

  const body = wrap([
    crumbsHtml(crumbs),
    `<h1>${h(title)}</h1>`,
    `<p>${h(description)}</p>`,
    store.active.length ? `<h2>Working codes</h2><ul>${store.active.map((c) => couponLine(c, now, false)).join("")}</ul>` : "",
    store.expired.length ? `<h2>Expired codes</h2><ul>${store.expired.slice(0, 20).map((c) => couponLine(c, now, false)).join("")}</ul>` : "",
    store.categories.length ? `<p>More coupons in ${store.categories.map((c) => link(categoryPath(c), c)).join(", ")}.</p>` : "",
    related.length ? `<h2>Similar stores</h2><ul>${related.map((s) => `<li>${link(storePath(s.name), `${s.name} coupons`)}</li>`).join("")}</ul>` : "",
  ].join(""));

  return {
    status: 200,
    body,
    page: {
      title,
      description,
      path,
      image: store.imgUrl,
      imageAlt: `${store.name} logo`,
      jsonLd: [offerList(title, path, [...store.active, ...store.expired], now), breadcrumbs(crumbs)],
    },
  };
};

export const storesPage = (stores: Store[]): RenderedPage => {
  const path = "/stores";
  const withCodes = stores.filter((store) => store.active.length > 0).length;
  const description = `Coupon codes for ${plural(stores.length, "store")}, A to Z. ${withCodes} have working codes right now.`;
  const body = wrap([
    crumbsHtml([["Coupo", "/"], ["Stores", path]]),
    "<h1>All stores</h1>",
    `<p>${h(description)}</p>`,
    `<ul>${stores.map((s) => `<li>${link(storePath(s.name), s.name)} (${plural(s.active.length, "code")})</li>`).join("")}</ul>`,
  ].join(""));
  return {
    status: 200,
    body,
    page: { title: "All stores with coupon codes", description, path, jsonLd: [breadcrumbs([["Coupo", "/"], ["Stores", path]])] },
  };
};

export const categoriesPage = (categories: string[]): RenderedPage => {
  const path = "/categories";
  const description = `Browse coupon codes by category: ${categories.slice(0, 8).join(", ")}${categories.length > 8 ? " and more" : ""}.`;
  const body = wrap([
    crumbsHtml([["Coupo", "/"], ["Categories", path]]),
    "<h1>Categories</h1>",
    `<p>${h(description)}</p>`,
    `<ul>${categories.map((c) => `<li>${link(categoryPath(c), capitalize(c))}</li>`).join("")}</ul>`,
  ].join(""));
  return {
    status: 200,
    body,
    page: { title: "Coupon categories", description, path, jsonLd: [breadcrumbs([["Coupo", "/"], ["Categories", path]])] },
  };
};

// Category pages list store coupons only, like the app's category page.
export const categoryPage = (category: string, coupons: FeedCoupon[], stores: Store[], now: number): RenderedPage | null => {
  const inCategory = coupons
    .filter((coupon) => coupon.type === "coupon" && coupon.category?.toLowerCase() === category)
    .sort(byQuality);
  if (inCategory.length === 0) return null;
  const active = inCategory.filter((coupon) => !isExpired(coupon, now));
  const expired = inCategory.filter((coupon) => isExpired(coupon, now));
  const storesHere = stores.filter((store) => store.categories.includes(category));
  const path = categoryPath(category);
  const name = capitalize(category);
  const title = `${name} coupon codes, ${monthLabel(new Date(now))}`;
  const description =
    `${plural(active.length, "working coupon code")} in ${category} from ${plural(storesHere.length, "store")}` +
    `${storesHere.length ? `, including ${storesHere.slice(0, 3).map((s) => s.name).join(", ")}` : ""}.`;
  const crumbs: [string, string][] = [["Coupo", "/"], ["Categories", "/categories"], [name, path]];

  const body = wrap([
    crumbsHtml(crumbs),
    `<h1>${h(title)}</h1>`,
    `<p>${h(description)}</p>`,
    storesHere.length ? `<h2>Stores</h2><ul>${storesHere.map((s) => `<li>${link(storePath(s.name), `${s.name} coupons`)}</li>`).join("")}</ul>` : "",
    active.length ? `<h2>Working codes</h2><ul>${active.map((c) => couponLine(c, now, true)).join("")}</ul>` : "",
    expired.length ? `<h2>Expired codes</h2><ul>${expired.slice(0, 20).map((c) => couponLine(c, now, true)).join("")}</ul>` : "",
  ].join(""));

  return {
    status: 200,
    body,
    page: { title, description, path, jsonLd: [offerList(title, path, [...active, ...expired], now), breadcrumbs(crumbs)] },
  };
};

// The readable part of a coupon page; its head tags come from previewTags in couponPreview.ts.
export const couponBody = (coupon: FeedCoupon, now: number) => {
  const expired = isExpired(coupon, now);
  return wrap([
    crumbsHtml([["Coupo", "/"], ["Stores", "/stores"], [coupon.name, storePath(coupon.name)]]),
    `<h1>${h(couponTitle(coupon))}</h1>`,
    coupon.code ? `<p>Code: <code>${h(oneLine(coupon.code, 60))}</code></p>` : "",
    coupon.description ? `<p>${h(oneLine(coupon.description, 600))}</p>` : "",
    coupon.expiry ? `<p>${expired ? "Expired" : "Valid until"} ${shortDate(coupon.expiry)}.</p>` : "",
    `<p>${link(storePath(coupon.name), `All ${coupon.name} coupon codes`)}${coupon.category ? ` · ${link(categoryPath(coupon.category), `More ${coupon.category} coupons`)}` : ""}</p>`,
  ].join(""));
};

// ---------- Sitemap and robots.txt ----------

const xml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// Every page Google should know about. Expired coupons are left out; their store page still lists them.
export const sitemapXml = (coupons: FeedCoupon[], now: number) => {
  const stores = groupStores(coupons, now);
  const newest = latest(coupons.map((coupon) => coupon.updatedAt ?? coupon.createdAt));
  const entries: [string, Date | null][] = [
    ["/", newest],
    ["/coupons", newest],
    ["/social", newest],
    ["/stores", newest],
    ["/categories", newest],
    ["/top-sharers", null],
    ...categoriesOf(coupons.filter((coupon) => coupon.type === "coupon")).map((category): [string, Date | null] => [
      categoryPath(category),
      latest(coupons.filter((coupon) => coupon.category?.toLowerCase() === category).map((c) => c.updatedAt ?? c.createdAt)),
    ]),
    ...stores.map((store): [string, Date | null] => [storePath(store.name), store.updatedAt]),
    ...coupons
      .filter((coupon) => !isExpired(coupon, now))
      .map((coupon): [string, Date | null] => [couponPagePath(coupon), coupon.updatedAt ?? coupon.createdAt]),
  ];
  const urls = entries.map(
    ([path, lastmod]) =>
      `  <url><loc>${xml(`${SITE_URL}${path}`)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ""}</url>`
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
};

// Private pages stay out of search results. Shared links (?ref=...) and search filters (?q=...)
// point back to the plain page through the canonical link, so they don't need rules here.
export const robotsTxt = () =>
  [
    "User-agent: *",
    "Disallow: /admin",
    "Disallow: /profile",
    "Disallow: /addcoupon",
    "Disallow: /login",
    "Disallow: /signup",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
