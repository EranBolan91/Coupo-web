import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { VotingCouponsContext } from "../../../context/VotingContext";
import { saveUserVote } from "../../../database/databaseCalls";
import { useContext, useEffect, useState } from "react";
import { Coupon } from "../../../types/CouponType";
import { FaThumbsUp } from "react-icons/fa";
import LoginModal from "./LoginModal";
import toast from "react-hot-toast";

interface Props {
  coupon: Coupon;
  setCoupon: (coupon: Coupon) => void;
}

const LikeButton = ({ coupon, setCoupon }: Props) => {
  const [isButtonAlreadyClicked, setButtonAlreadyClicked] = useState<boolean>(false);
  const { userVotes, removeVoteFromCoupon } = useContext<any>(VotingCouponsContext);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const userDocument = useCurrentUser();

  const handleButtonAlreadyClicked = () => setButtonAlreadyClicked(!isButtonAlreadyClicked);
  const handleShowLoginModal = () => setOpenLoginModal(!openLoginModal);

  const handleCouponVote = () => {
    if (!userDocument) {
      handleShowLoginModal();
    } else {
      if (isButtonAlreadyClicked === false) {
        toast
          .promise(saveUserVote({ ...coupon }, userDocument.userUID, true), {
            loading: `Voting...`,
            success: `Thanks for voting!`,
            error: (err: any) => `${err}`,
          })
          .then(() => {
            coupon.likes = coupon.likes + 1;
            setCoupon({ ...coupon });
            handleButtonAlreadyClicked();
          });
      } else {
        removeVoteFromCoupon(coupon.id, true);
        handleButtonAlreadyClicked();

        coupon.likes = coupon.likes - 1;
        setCoupon({ ...coupon });
      }
    }
  };

  // Votes load after the button mounts (and change on login/logout), so sync on every change.
  useEffect(() => {
    setButtonAlreadyClicked(userVotes?.likes.some((couponVote: Coupon) => couponVote.id === coupon.id) ?? false);
  }, [userVotes, coupon.id]);

  return (
    <div className="flex flex-col justify-center items-center">
      <button
        className={`p-1 rounded hover:text-green-500 ${
          isButtonAlreadyClicked === true ? " text-green-600" : "text-gray-500 dark:text-gray-400"
        }`}
        onClick={handleCouponVote}
      >
        <FaThumbsUp />
      </button>
      <span className="font-bold text-green-700">{coupon.likes}</span>
      <LoginModal open={openLoginModal} onClose={handleShowLoginModal} />
    </div>
  );
};

export default LikeButton;
