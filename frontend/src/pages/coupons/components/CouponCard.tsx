import WishlistButton from "../../../components/wishlistButton/WishlistButton";
import { Coupon } from "../../../types/CouponType";
import DislikeButton from "./DislikeButton";
import LikeButton from "./LikeButton";
import toast from "react-hot-toast";
import { useState } from "react";

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

const CouponCard = ({ coupon, innerRef }: Props) => {
  const [currentCoupon, setCurrentCoupon] = useState<Coupon>(coupon);
  const handleSetCoupon = (coupon: Coupon) => setCurrentCoupon(coupon);

  return (
    <div ref={innerRef} className="card bg-base-100 w-80 md:w-[35rem] h-44 shadow-xl p-3 rounded-md">
      <div className="w-full flex justify-end items-center px-[5%]">
        <WishlistButton key={coupon.id} couponID={coupon.id} />
      </div>
      <div className="grid grid-cols-12 h-full">
        <div
          onClick={() => copyCodeCoupon(currentCoupon.code)}
          className="absolute -top-4 md:-top-5 left-4 p-1 px-2 bg-purple-600 text-lg cursor-pointer text-white"
        >
          {currentCoupon.code}
        </div>
        <div className="col-span-7 p-1 flex flex-col">
          <div className="flex mt-auto">
            <span className="text-3xl md:text-6xl font-bold">{currentCoupon.discount}%</span>
          </div>
          <div className="mt-auto">
            <div className="text-xl md:text-lg font-semibold">
              <span>{currentCoupon.name}</span>
            </div>
            <div className="text-sm md:text-lg overflow-hidden text-ellipsis line-clamp-2">
              {currentCoupon.description}
            </div>
          </div>
        </div>
        <div className="col-span-5 flex flex-col p-1 justify-center">
          <div className="flex justify-evenly mt-auto">
            <DislikeButton coupon={currentCoupon} setCoupon={handleSetCoupon} />
            <LikeButton coupon={currentCoupon} setCoupon={handleSetCoupon} />
          </div>
          <div className="text-sm md:text-md flex justify-center mt-auto">
            Expired: {currentCoupon?.expiry?.toDate().toDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
