import { Coupon } from "../types/CouponType";

// Page of one coupon: /coupons/{id} for store coupons, /social/{id} for social ones.
export const couponPath = (coupon: Pick<Coupon, "id" | "type">) =>
  `${coupon.type === "socialCoupon" ? "/social" : "/coupons"}/${coupon.id}`;

export const couponURL = (coupon: Pick<Coupon, "id" | "type">) => `${window.location.origin}${couponPath(coupon)}`;
