import { VoteKind, VotingCouponsContext } from "../../../context/VotingContext";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { PiThumbsDownBold, PiThumbsDownFill, PiThumbsUpBold, PiThumbsUpFill } from "react-icons/pi";
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
  likes: { Icon: PiThumbsUpBold, ActiveIcon: PiThumbsUpFill, active: "text-primary" },
  dislikes: { Icon: PiThumbsDownBold, ActiveIcon: PiThumbsDownFill, active: "text-error" },
};

// Like or dislike button. A user has at most one vote per coupon; see VotingContext.toggleVote.
const VoteButton = ({ coupon, setCoupon, kind }: Props) => {
  const voting = useContext(VotingCouponsContext);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const userDocument = useCurrentUser();
  const { Icon, ActiveIcon, active } = styles[kind];
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
    <>
      <button
        type="button"
        className={`btn btn-ghost btn-sm h-10 min-h-10 gap-1.5 px-2.5 font-semibold tabular-nums ${
          isActive ? active : "text-base-content/70"
        }`}
        onClick={handleVote}
        disabled={isSaving}
        aria-label={`${kind === "likes" ? "Like" : "Dislike"} (${coupon[kind]})`}
        aria-pressed={isActive}
      >
        {isActive ? <ActiveIcon className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
        <span aria-hidden>{coupon[kind]}</span>
      </button>
      <LoginModal open={openLoginModal} onClose={handleShowLoginModal} />
    </>
  );
};

export default VoteButton;
