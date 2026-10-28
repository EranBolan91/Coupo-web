import { useCurrentUser } from "../../hooks/useCurrentUser";
import { saveUserSocialCoupon } from "../../database/social";
import { useQueryClient } from "@tanstack/react-query";
import { Coupon } from "../../types/CouponType";
import CouponForm from "./CouponForm";
import { toCoupon } from "./toCoupon";
import toast from "react-hot-toast";

// Social coupon (found on social media): free-text brand, saved under UserCoupons/{uid}/SocialCoupons.
const AddUserSocialCoupon = () => {
  const userDocument = useCurrentUser();
  const queryClient = useQueryClient();

  return (
    <CouponForm
      brandMode="social"
      submitLabel="Share social coupon"
      onSubmit={async (values) => {
        if (!userDocument) return;
        const coupon = toCoupon(
          values,
          { userID: userDocument.userUID, username: `${userDocument.firstName} ${userDocument.lastName}`.trim() },
          "socialCoupon"
        );
        await toast.promise(saveUserSocialCoupon(coupon as Coupon, userDocument.userUID), {
          loading: "Sharing your coupon...",
          success: `${coupon.name} coupon shared. Thanks!`,
          error: "Couldn't share the coupon",
        });
        ["usercoupons", "coupons"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      }}
    />
  );
};

export default AddUserSocialCoupon;
