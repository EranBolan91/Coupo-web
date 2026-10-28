import { VoteKind, VotingCouponsContext } from "../../../context/VotingContext";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import { Coupon } from "../../../types/CouponType";
import { useContext, useState } from "react";
import LoginModal from "./LoginModal";
import toast from "react-hot-toast";

interface Props {
  coupon: Coupon;
  setCoupon: (coupon: Coupon) => void;
  kind: VoteKind;
}

const styles = {
  likes: { Icon: FaThumbsUp, hover: "hover:text-green-500", active: "text-green-600", count: "text-green-700" },
  dislikes: { Icon: FaThumbsDown, hover: "hover:text-red-500", active: "text-red-600", count: "text-red-700" },
};

// Like or dislike button. A user has at most one vote per coupon; see VotingContext.toggleVote.
const VoteButton = ({ coupon, setCoupon, kind }: Props) => {
  const voting = useContext(VotingCouponsContext);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const userDocument = useCurrentUser();
  const { Icon, hover, active, count } = styles[kind];
  const isActive = voting?.getUserVote(coupon.id) === kind;

  const handleShowLoginModal = () => setOpenLoginModal(!openLoginModal);

  const handleVote = async () => {
    if (!userDocument || !voting) {
      handleShowLoginModal();
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      setCoupon(await voting.toggleVote(coupon, kind));
      if (!isActive) toast.success("Thanks for voting!");
    } catch (error: any) {
      toast.error(error.message ?? "Could not save your vote");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <button
        className={`p-1 rounded ${hover} ${isActive ? active : "text-gray-500 dark:text-gray-400"}`}
        onClick={handleVote}
        disabled={isSaving}
        aria-label={kind === "likes" ? "Like" : "Dislike"}
        aria-pressed={isActive}
      >
        <Icon />
      </button>
      <span className={`font-bold ${count}`}>{coupon[kind]}</span>
      <LoginModal open={openLoginModal} onClose={handleShowLoginModal} />
    </div>
  );
};

export default VoteButton;
