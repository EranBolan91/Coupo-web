import { Coupon } from "../../types/CouponType";
import { dealHost, isLinkCoupon } from "../../logic/dealLinks";

// "code SAVE20" or "deal link to nike.com", for dialogs that name a coupon.
const CouponCodeText = ({ coupon }: { coupon: Pick<Coupon, "code" | "dealUrl"> }) =>
  isLinkCoupon(coupon) ? (
    <>
      deal link to <span className="font-bold text-base-content">{dealHost(coupon)}</span>
    </>
  ) : (
    <>
      code <span className="font-mono font-bold text-base-content">{coupon.code}</span>
    </>
  );

export default CouponCodeText;
