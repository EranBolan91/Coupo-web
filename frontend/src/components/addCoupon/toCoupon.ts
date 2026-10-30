import { CouponFormValues } from "./CouponForm";
import { Coupon } from "../../types/CouponType";
import { Timestamp } from "firebase/firestore";

// Builds the document the save functions expect. Expiry becomes a Firestore Timestamp (end of that day).
export const toCoupon = (
  values: CouponFormValues,
  owner: { userID?: string; username?: string },
  type: Coupon["type"]
): Omit<Coupon, "id"> => {
  const [year, month, day] = values.expiry.split("-").map(Number);
  return {
    name: values.name.trim(),
    imgUrl: values.imgUrl ?? "",
    category: values.category,
    code: values.code,
    discount: values.discount,
    description: values.description?.trim() ?? "",
    userID: owner.userID ?? "",
    username: owner.username ?? "",
    likes: 0,
    dislikes: 0,
    expiry: Timestamp.fromDate(new Date(year, month - 1, day, 23, 59, 59)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    type,
    ...values.terms,
  };
};
