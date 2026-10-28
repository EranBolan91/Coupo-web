import { VoteKind, VotingCouponsContext } from "../../../context/VotingContext";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { PiThumbsDownBold, PiThumbsDownFill, PiThumbsUpBold, PiThumbsUpFill } from "react-icons/pi";
import { Coupon } from "../../../types/CouponType";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useContext, useState } from "react";
import LoginModal from "./LoginModal";
import toast from "react-hot-toast";

interface Props {
  coupon: Coupon;
  setCoupon: (coupon: Coupon) => void;
  kind: VoteKind;
}

const styles = {
  likes: { Icon: PiThumbsUpBold, ActiveIcon: PiThumbsUpFill, active: "text-accent" },
  dislikes: { Icon: PiThumbsDownBold, ActiveIcon: PiThumbsDownFill, active: "text-error" },
};

// Like or dislike button. A user has at most one vote per coupon; see VotingContext.toggleVote.
const VoteButton = ({ coupon, setCoupon, kind }: Props) => {
  const voting = useContext(VotingCouponsContext);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const userDocument = useCurrentUser();
  const reduceMotion = useReducedMotion();
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
        <motion.span
          key={isActive ? "on" : "off"}
          initial={reduceMotion ? false : { scale: 0.6, rotate: kind === "likes" ? -18 : 18 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="inline-flex"
        >
          {isActive ? <ActiveIcon className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
        </motion.span>
        <span className="relative inline-flex h-5 min-w-[1ch] overflow-hidden" aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={coupon[kind]}
              initial={reduceMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.2 }}
            >
              {coupon[kind]}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
      <LoginModal open={openLoginModal} onClose={handleShowLoginModal} />
    </>
  );
};

export default VoteButton;
