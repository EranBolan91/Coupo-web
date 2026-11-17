import { Coupon } from "../types/CouponType";
import { dealText } from "./discount";

// Page of one coupon: /coupons/{id} for store coupons, /social/{id} for social ones.
export const couponPath = (coupon: Pick<Coupon, "id" | "type">) =>
  `${coupon.type === "socialCoupon" ? "/social" : "/coupons"}/${coupon.id}`;

export const couponURL = (coupon: Pick<Coupon, "id" | "type">) => `${window.location.origin}${couponPath(coupon)}`;

// Link for sharing, tagged with where it was shared (?ref=whatsapp) so visits from shares can be counted.
export const couponShareURL = (coupon: Pick<Coupon, "id" | "type">, ref: "whatsapp" | "share") =>
  `${couponURL(coupon)}?ref=${ref}`;

// Ready-made message for WhatsApp and the share sheet, e.g. "20% off at Nike on Coupo" or
// "₪50 off orders of ₪200+ at Fox on Coupo".
export const couponShareText = (coupon: Pick<Coupon, "discount" | "discountType" | "currency" | "minSpend" | "name">) => {
  const deal = dealText(coupon);
  return deal ? `${deal} at ${coupon.name} on Coupo` : `${coupon.name} coupon on Coupo`;
};
