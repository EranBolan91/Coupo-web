import { PiCheckBold, PiShareNetworkBold } from "react-icons/pi";
import { couponURL } from "../../logic/couponLinks";
import { Coupon } from "../../types/CouponType";
import toast from "react-hot-toast";
import { useState } from "react";

// Opens the phone's share sheet when there is one, otherwise copies the coupon's link.
const ShareCouponButton = ({ coupon, className = "" }: { coupon: Coupon; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const url = couponURL(coupon);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${coupon.discount}% off at ${coupon.name}`, text: `Coupon code for ${coupon.name} on Coupo`, url });
        return;
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return; // closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <button type="button" onClick={share} className={`btn btn-ghost h-12 min-h-12 border-2 border-base-300 px-5 ${className}`}>
      {copied ? <PiCheckBold className="size-5 text-accent" aria-hidden /> : <PiShareNetworkBold className="size-5" aria-hidden />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
};

export default ShareCouponButton;
