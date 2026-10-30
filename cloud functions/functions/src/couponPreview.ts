// Link previews (WhatsApp, Telegram, Facebook, X, Slack...) for one coupon's page.
// Preview bots don't run JavaScript, so they only see the index.html that Hosting sends.
// The couponPreview function puts this coupon's title, description and image into that HTML.
// Pure helpers only (no Firebase), so they can be checked without the emulators.

export const SITE_URL = "https://coupo-e03c4.web.app";
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

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const oneLine = (value: string, max: number) => {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};

// Only public https images; anything else falls back to the Coupo card.
const safeImage = (url?: string) => {
  if (!url) return null;
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

export const previewTags = (coupon: PreviewCoupon, path: string) => {
  const name = oneLine(coupon.name || "a store", 80);
  const discount = Number(coupon.discount) || 0;
  const title = discount > 0 ? `${discount}% off at ${name}` : `Coupon for ${name}`;

  const expiry = coupon.expiry?.toDate?.();
  const until = expiry ?
    expiry.getTime() < Date.now() ?
      "This coupon has expired." :
      `Valid until ${expiry.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}.` :
    "";
  const about = coupon.description ? oneLine(coupon.description, 160).replace(/([^.!?…])$/, "$1.") : `Get the ${name} coupon code on Coupo.`;
  const description = [about, until].filter(Boolean).join(" ");

  const logo = safeImage(coupon.imgUrl);
  const image = logo ?? FALLBACK_IMAGE;
  const url = `${SITE_URL}${path}`;
  const attr = escapeHtml;

  return [
    `<title>${escapeHtml(title)} | Coupo</title>`,
    `<meta name="description" content="${attr(description)}" />`,
    `<link rel="canonical" href="${attr(url)}" />`,
    "<meta property=\"og:type\" content=\"website\" />",
    "<meta property=\"og:site_name\" content=\"Coupo\" />",
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:image" content="${attr(image)}" />`,
    // Brand logos are small squares; the Coupo card is a wide 1200x630 image.
    ...(logo ? [] : ["<meta property=\"og:image:width\" content=\"1200\" />", "<meta property=\"og:image:height\" content=\"630\" />"]),
    `<meta property="og:image:alt" content="${attr(logo ? `${name} logo` : "Coupo")}" />`,
    `<meta name="twitter:card" content="${logo ? "summary" : "summary_large_image"}" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
    `<meta name="twitter:image" content="${attr(image)}" />`,
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

// Crawlers that build link previews. Used only to keep them out of the share counts in the logs.
export const isPreviewBot = (userAgent = "") =>
  /whatsapp|facebookexternalhit|facebot|telegrambot|twitterbot|slackbot|discordbot|linkedinbot|skypeuripreview|googlebot|bingbot|applebot/i
    .test(userAgent);
