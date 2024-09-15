import { saveUserVote } from "../../database/databaseCalls";
import { UserAuth } from "../../auth/AuthProvider";
import { FaThumbsDown } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";
import { Coupon } from "../../types/Types";
import toast from "react-hot-toast";

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
  const { user }: any = UserAuth();

  const handleCouponVote = (vote: boolean) => {
    console.log(vote);
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    } else {
      toast.promise(saveUserVote({ ...coupon }, user.uid, vote), {
        loading: ``,
        success: ``,
        error: "",
      });
    }
  };

  return (
    <div
      ref={innerRef}
      className="card bg-base-100 w-80 md:w-96 h-44 shadow-xl grid grid-cols-12 p-3  rounded-md"
    >
      <div
        onClick={() => copyCodeCoupon(coupon.code)}
        className="absolute -top-4 md:-top-5 left-4 p-1 px-2 bg-purple-600 text-lg cursor-pointer text-white"
      >
        {coupon.code}
      </div>
      <div className="col-span-7 p-1 flex flex-col">
        <div className="flex mt-auto">
          <span className="text-3xl md:text-6xl font-bold">
            {coupon.discount}%
          </span>
        </div>
        <div className="mt-auto">
          <div className="text-xl md:text-lg font-semibold">
            <span>{coupon.name}</span>
          </div>
          <div className="text-sm md:text-lg overflow-hidden text-ellipsis line-clamp-2">
            {coupon.description}
          </div>
        </div>
      </div>
      {/* <div className="col-span-1">
        <div className="divide-y divide-solid divide-gray-400"></div>
      </div> */}
      <div className="col-span-5 flex flex-col p-1 justify-center">
        <div className="flex justify-evenly mt-auto">
          <div className="flex flex-col text-red-600 text-lg items-center cursor-pointer mr-1">
            <span onClick={() => handleCouponVote(false)}>
              <FaThumbsDown />
            </span>
            <span>{coupon.dislikes}</span>
          </div>
          <div className="flex flex-col text-green-600 text-lg items-center cursor-pointer">
            <span onClick={() => handleCouponVote(true)}>
              <FaThumbsUp />
            </span>
            <span>{coupon.likes}</span>
          </div>
        </div>
        <div className="text-sm md:text-md flex justify-center mt-auto">
          Expired: {coupon.expiry.toString()}
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
