import { Coupon } from "../types/CouponType";
import { normalizeStoreUrl, shopHost } from "./couponTerms";

// Link coupons: some deals have no code. The discount applies when you open a link (a sale page,
// a "15% off" landing page, a referral link). Those coupons store the link in `dealUrl` and an
// empty `code`. Coupons without `dealUrl` are codes, so older coupons need no change.

export type CouponKind = "code" | "link";

// The deal link to open, or undefined for a code coupon. Only http(s) links count (checked again
// on read, since admin-written or older documents never went through the form).
export const dealLink = (coupon: Partial<Pick<Coupon, "dealUrl">>) => normalizeStoreUrl(coupon.dealUrl ?? "") || undefined;

export const isLinkCoupon = (coupon: Partial<Pick<Coupon, "dealUrl">>) => !!dealLink(coupon);

export const couponKindOf = (coupon: Partial<Pick<Coupon, "dealUrl">>): CouponKind => (isLinkCoupon(coupon) ? "link" : "code");

// "nike.com" for a link coupon, "" otherwise.
export const dealHost = (coupon: Partial<Pick<Coupon, "dealUrl">>) => {
  const url = dealLink(coupon);
  return url ? shopHost(url) : "";
};

export const dealUrlError = (input: string) =>
  !input.trim() ? "Paste the deal link" : !normalizeStoreUrl(input) ? "Enter a web address, like nike.com/sale" : undefined;

// What identifies the coupon in short text: the code, or "nike.com link".
export const couponLabel = (coupon: Partial<Pick<Coupon, "code" | "dealUrl">>) =>
  isLinkCoupon(coupon) ? `${dealHost(coupon)} link` : coupon.code ?? "";
