import WishlistButton from "../../../components/wishlistButton/WishlistButton";
import { Coupon } from "../../../types/CouponType";
import DislikeButton from "./DislikeButton";
import { CgCopy } from "react-icons/cg";
import LikeButton from "./LikeButton";
import toast from "react-hot-toast";
import { useState } from "react";
import type React from "react";

interface Props {
  coupon: Coupon;
  innerRef?: React.Ref<HTMLParagraphElement>;
}

const copyCodeCoupon = async (codeCoupon: string) => {
  try {
    await navigator.clipboard.writeText(codeCoupon);
    toast.success(`copied ${codeCoupon}`, {
      position: "bottom-right",
    });
  } catch (error: any) {
    toast.error(error);
  }
};

export default function ModernCouponCard({ coupon, innerRef }: Props) {
  const [currentCoupon, setCurrentCoupon] = useState<Coupon>(coupon);
  const handleSetCoupon = (coupon: Coupon) => setCurrentCoupon(coupon);

  return (
    <div
      ref={innerRef}
      className={`w-full mx-auto max-w-sm  sm:max-w-md lg:max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300`}
    >
      <div className={"block"}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{currentCoupon.name}</h2>
            <span className="px-3 py-1 text-sm font-semibold text-white bg-purple-600 rounded-full">
              {currentCoupon.discount}% OFF
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{currentCoupon.description}</p>
          <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>Uploaded by: {"uploadedBy"}</span>
            <span>Expires: {currentCoupon.expiry.toDate().toDateString()}</span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-center relative">
            <span className="font-mono font-bold text-lg text-gray-800 dark:text-gray-200">{currentCoupon.code}</span>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => copyCodeCoupon(currentCoupon.code)}
            >
              <CgCopy />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
          <WishlistButton couponID={currentCoupon.id} labelToAdd="Add to Wishlist" labelToRemove="Wishlisted" />
          <div className="flex space-x-2">
            <DislikeButton coupon={currentCoupon} setCoupon={handleSetCoupon} />
            <LikeButton coupon={currentCoupon} setCoupon={handleSetCoupon} />
          </div>
        </div>
      </div>
    </div>
  );
}
