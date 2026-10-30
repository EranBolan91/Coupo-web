import { Coupon } from "../types/CouponType";

// Optional extras on a coupon: where to shop and its conditions.
export type CouponTerms = Required<Pick<Coupon, "storeUrl" | "minOrder" | "usableAt" | "firstOrderOnly">>;

export const emptyTerms: CouponTerms = { storeUrl: "", minOrder: "", usableAt: "", firstOrderOnly: false };

export const MIN_ORDER_MAX_LENGTH = 30;

export const termsOf = (coupon: Partial<Coupon>): CouponTerms => ({
  storeUrl: coupon.storeUrl ?? "",
  minOrder: coupon.minOrder ?? "",
  usableAt: coupon.usableAt ?? "",
  firstOrderOnly: coupon.firstOrderOnly ?? false,
});

// The link as it should be stored: "nike.com/sale" becomes "https://nike.com/sale".
// Returns "" for an empty or unusable link. Only http(s) links are allowed, so a stored
// link can never run script when clicked.
export const normalizeStoreUrl = (input: string): string => {
  const text = input.trim();
  if (!text) return "";
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    if (!url.hostname.includes(".")) return "";
    return url.toString();
  } catch {
    return "";
  }
};

export const storeUrlError = (input: string) =>
  input.trim() && !normalizeStoreUrl(input) ? "Enter a web address, like nike.com" : undefined;

export const minOrderError = (input: string) =>
  input.trim().length > MIN_ORDER_MAX_LENGTH ? `Keep it under ${MIN_ORDER_MAX_LENGTH} characters` : undefined;

export const termsError = (terms: CouponTerms) => storeUrlError(terms.storeUrl) ?? minOrderError(terms.minOrder);

// What gets saved: trimmed, with the link normalized.
export const cleanTerms = (terms: CouponTerms): CouponTerms => ({
  storeUrl: normalizeStoreUrl(terms.storeUrl),
  minOrder: terms.minOrder.trim(),
  usableAt: terms.usableAt,
  firstOrderOnly: terms.firstOrderOnly,
});

// The store link to show, or undefined. Checked again on read, since old or admin-written
// documents never went through the form.
export const shopLink = (coupon: Partial<Coupon>) => normalizeStoreUrl(coupon.storeUrl ?? "") || undefined;

export const shopHost = (url: string) => new URL(url).hostname.replace(/^www\./, "");

const usableAtLabel: Record<string, string> = { online: "Online only", "in-store": "In store only", both: "Online and in store" };

// Short labels for the card, e.g. ["Online only", "Min. order $50", "First order only"].
export const termLabels = (coupon: Partial<Coupon>): string[] => {
  const labels: string[] = [];
  if (coupon.usableAt && usableAtLabel[coupon.usableAt]) labels.push(usableAtLabel[coupon.usableAt]);
  if (coupon.minOrder?.trim()) labels.push(`Min. order ${coupon.minOrder.trim()}`);
  if (coupon.firstOrderOnly) labels.push("First order only");
  return labels;
};
