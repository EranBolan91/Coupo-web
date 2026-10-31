// Link previews (WhatsApp, Telegram, Facebook, X, Slack...) for one coupon's page.
// Preview bots don't run JavaScript, so they only see the index.html that Hosting sends.
// The couponPreview function puts this coupon's title, description and image into that HTML.
// Pure helpers only (no Firebase), so they can be checked without the emulators.

// The site's public address, used in canonical links, the sitemap and robots.txt. To move to a custom
// domain, set SITE_URL in functions/.env (e.g. SITE_URL=https://coupo.com) and VITE_SITE_URL in
// frontend/.env, then deploy functions and hosting. No trailing slash.
export const SITE_URL = (process.env.SITE_URL || "https://coupo-e03c4.web.app").replace(/\/+$/, "");
export const FALLBACK_IMAGE = `${SITE_URL}/og-image.png`;

// index.html marks its default preview tags with these comments; everything between them is replaced.
const START = "<!-- preview:start -->";
const END = "<!-- preview:end -->";

export type PreviewCoupon = {
  name?: string;
  discount?: string | number;
  description?: string;
  imgUrl?: string;
  expiry?: { toDate: () => Date } | null;
};

export type CouponRoute = { collection: "coupons" | "socialCoupons"; id: string; path: string };

// "/coupons/abc" and "/social/abc" (a trailing slash is fine). Firestore auto IDs are 20 letters/digits.
export const parseCouponPath = (path: string): CouponRoute | null => {
  const match = /^\/(coupons|social)\/([A-Za-z0-9_-]{1,128})\/?$/.exec(path);
  if (!match) return null;
  return {
    collection: match[1] === "social" ? "socialCoupons" : "coupons",
    id: match[2],
    path: `/${match[1]}/${match[2]}`,
  };
};

export const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const oneLine = (value: string, max: number) => {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};

// Only public https images; anything else falls back to the Coupo card.
export const safeImage = (url?: string) => {
  if (!url) return null;
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

export const couponTitle = (coupon: Pick<PreviewCoupon, "name" | "discount">) => {
  const name = oneLine(coupon.name || "a store", 80);
  const discount = Number(coupon.discount) || 0;
  return discount > 0 ? `${discount}% off at ${name}` : `Coupon for ${name}`;
};

export const previewTags = (coupon: PreviewCoupon, path: string, jsonLd: object[] = []) => {
  const name = oneLine(coupon.name || "a store", 80);
  const title = couponTitle(coupon);

  const expiry = coupon.expiry?.toDate?.();
  const until = expiry ?
    expiry.getTime() < Date.now() ?
      "This coupon has expired." :
      `Valid until ${expiry.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}.` :
    "";
  const about = coupon.description ? oneLine(coupon.description, 160).replace(/([^.!?…])$/, "$1.") : `Get the ${name} coupon code on Coupo.`;
  const description = [about, until].filter(Boolean).join(" ");

  return pageTags({ title, description, path, image: coupon.imgUrl, imageAlt: `${name} logo`, jsonLd });
};

export type PageInfo = {
  title: string;
  description: string;
  path: string;
  // A brand logo. Without one, the wide Coupo card is used.
  image?: string;
  imageAlt?: string;
  // Structured data (schema.org) for search engines, one <script type="application/ld+json"> each.
  jsonLd?: object[];
  // Pages that shouldn't be in search results (e.g. not found).
  noindex?: boolean;
};

// JSON inside <script> can't contain "</script>"; escaping "<" keeps it valid JSON.
export const jsonLdTag = (data: object) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

// Title, description, canonical link, link-preview tags and structured data for one page.
export const pageTags = ({ title, description, path, image, imageAlt, jsonLd = [], noindex = false }: PageInfo) => {
  const logo = safeImage(image);
  const shownImage = logo ?? FALLBACK_IMAGE;
  const url = `${SITE_URL}${path}`;
  const attr = escapeHtml;

  return [
    `<title>${escapeHtml(title)} | Coupo</title>`,
    `<meta name="description" content="${attr(description)}" />`,
    ...(noindex ? ["<meta name=\"robots\" content=\"noindex\" />"] : [`<link rel="canonical" href="${attr(url)}" />`]),
    "<meta property=\"og:type\" content=\"website\" />",
    "<meta property=\"og:site_name\" content=\"Coupo\" />",
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:image" content="${attr(shownImage)}" />`,
    // Brand logos are small squares; the Coupo card is a wide 1200x630 image.
    ...(logo ? [] : ["<meta property=\"og:image:width\" content=\"1200\" />", "<meta property=\"og:image:height\" content=\"630\" />"]),
    `<meta property="og:image:alt" content="${attr(logo ? imageAlt || "Logo" : "Coupo")}" />`,
    `<meta name="twitter:card" content="${logo ? "summary" : "summary_large_image"}" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
    `<meta name="twitter:image" content="${attr(shownImage)}" />`,
    ...jsonLd.map(jsonLdTag),
  ].join("\n    ");
};

// Swap the default preview block in index.html (title, description and og: tags) for this coupon's tags.
// Returns null when the template doesn't have the markers, so the caller can serve it unchanged.
export const injectPreview = (template: string, tags: string) => {
  const start = template.indexOf(START);
  const end = template.indexOf(END);
  if (start === -1 || end === -1 || end < start) return null;
  return `${template.slice(0, start)}${START}\n    ${tags}\n    ${template.slice(end)}`;
};

// Puts the page's readable content (heading, coupon list, links) inside <div id="root">, so search
// engines and tools that don't run JavaScript see it. React replaces it as soon as the app starts.
export const injectBody = (template: string, body: string) => {
  const root = "<div id=\"root\"></div>";
  if (!template.includes(root)) return template;
  return template.replace(root, () => `<div id="root">${body}</div>`);
};

// Crawlers that build link previews. Used only to keep them out of the share counts in the logs.
export const isPreviewBot = (userAgent = "") =>
  /whatsapp|facebookexternalhit|facebot|telegrambot|twitterbot|slackbot|discordbot|linkedinbot|skypeuripreview|googlebot|bingbot|applebot/i
    .test(userAgent);
