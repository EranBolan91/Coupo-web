import { useCurrentUser } from "../../hooks/useCurrentUser";
import { saveUserNewCoupon } from "../../database/databaseCalls";
import { useQueryClient } from "@tanstack/react-query";
import CouponForm from "./CouponForm";
import { toCoupon } from "./toCoupon";
import toast from "react-hot-toast";

// Store coupon: saved under UserCoupons/{uid}/Coupons; a Cloud Function publishes it to Coupons.
const AddUserCoupon = () => {
  const userDocument = useCurrentUser();
  const queryClient = useQueryClient();

  return (
    <CouponForm
      brandMode="store"
      submitLabel="Share coupon"
      onSubmit={async (values) => {
        if (!userDocument) return;
        const coupon = toCoupon(
          values,
          { userID: userDocument.userUID, username: `${userDocument.firstName} ${userDocument.lastName}`.trim() },
          "coupon"
        );
        await toast.promise(saveUserNewCoupon(coupon, userDocument.userUID), {
          loading: "Sharing your coupon...",
          success: `${coupon.name} coupon shared. Thanks!`,
          error: "Couldn't share the coupon",
        });
        ["usercoupons", "latestCoupons", "coupons"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      }}
    />
  );
};

export default AddUserCoupon;
