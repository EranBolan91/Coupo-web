import { VotingCouponsContext } from "../../../context/VotingContext";
import { saveUserVote } from "../../../database/databaseCalls";
import { useContext, useEffect, useState } from "react";
import { UserAuth } from "../../../auth/AuthProvider";
import { Coupon } from "../../../types/Types";
import { FaThumbsDown } from "react-icons/fa";
import ModalLogin from "./ModalLogin";
import toast from "react-hot-toast";

interface Props {
  coupon: Coupon;
  setCoupon: (coupon: Coupon) => void;
}

const DislikeButton = ({ coupon, setCoupon }: Props) => {
  const [isButtonAlreadyClicked, setButtonAlreadyClicked] = useState<boolean>(false);
  const { userVotes, removeVoteFromCoupon } = useContext<any>(VotingCouponsContext);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const { user }: any = UserAuth();

  const handleShowLoginModal = () => setShowLoginModal(!showLoginModal);
  const handleButtonAlreadyClicked = () => setButtonAlreadyClicked(!isButtonAlreadyClicked);

  const handleCouponVote = () => {
    if (!user) {
      handleShowLoginModal();
    } else {
      if (isButtonAlreadyClicked === false) {
        toast
          .promise(saveUserVote({ ...coupon }, user.uid, false), {
            loading: `Voting...`,
            success: `Thanks for voting!`,
            error: (err: any) => `${err}`,
          })
          .then(() => {
            coupon.dislikes = coupon.dislikes + 1;
            setCoupon({ ...coupon });
            handleButtonAlreadyClicked();
          });
      } else {
        removeVoteFromCoupon(coupon.id, false);
        handleButtonAlreadyClicked();

        coupon.dislikes = coupon.dislikes - 1;
        setCoupon({ ...coupon });
      }
    }
  };

  useEffect(() => {
    userVotes?.dislikes.map((couponVote: Coupon) => {
      if (couponVote.id === coupon.id) {
        setButtonAlreadyClicked(true);
      }
    });
  }, []);

  return (
    <div
      onClick={handleCouponVote}
      className={`flex flex-col  ${
        isButtonAlreadyClicked === true
          ? "text-red-700 hover:text-red-300"
          : "text-red-300 hover:text-red-700"
      } text-lg items-center cursor-pointer mr-1 select-none transform transition-transform duration-150 active:scale-110`}
    >
      <span>
        <FaThumbsDown />
      </span>
      <span>{coupon.dislikes}</span>
      {showLoginModal && <ModalLogin onClose={handleShowLoginModal} />}
    </div>
  );
};

export default DislikeButton;
