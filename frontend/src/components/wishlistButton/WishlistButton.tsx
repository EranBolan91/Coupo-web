import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { removeCouponFromWishList, saveCouponInWishList } from "../../database/wishlist";
import LoginModal from "../../pages/coupons/components/LoginModal";
import { PiBookmarkSimpleBold, PiBookmarkSimpleFill } from "react-icons/pi";
import useWishlist from "../../hooks/useWishlist";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  couponID: string;
  labelToAdd?: string;
  labelToRemove?: string;
}


const WishlistButton = ({ couponID, labelToAdd, labelToRemove }: Props) => {
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [isWishList, setIsWishList] = useState<boolean>(false);
  const userDocument = useCurrentUser();
  const { wishlists, isLoading } = useWishlist(userDocument?.userUID);
  const queryClient = useQueryClient();

  // Cached queries never go stale on their own (see main.tsx), so refresh them after a change.
  const refreshWishlistQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    queryClient.invalidateQueries({ queryKey: ["userWishlist"] });
  };

  const handleShowLoginModal = () => setOpenLoginModal(!openLoginModal);

  const addToWishlist = () => {
    if (userDocument === null) {
      handleShowLoginModal();
      return;
    }
    toast
      .promise(saveCouponInWishList(userDocument.userUID, couponID), {
        success: "Saved to your wishlist",
        loading: "Saving...",
        error: "Couldn't save it. Please try again.",
      })
      .then(refreshWishlistQueries);
    setIsWishList(true);
  };

  const removeFromWishList = () => {
    removeCouponFromWishList(userDocument?.userUID ?? "", couponID).then(refreshWishlistQueries);
    setIsWishList(false);
  };

  useEffect(() => {
    if (wishlists?.includes(couponID)) {
      setIsWishList(true);
    }
  }, [wishlists]);

  //TODO: need to write a wrapper component for auth, if not user is not logged in, show a modal to login
  const label = isWishList ? labelToRemove ?? "Saved" : labelToAdd ?? "Save";

  return (
    <>
      <button
        type="button"
        onClick={isWishList ? removeFromWishList : addToWishlist}
        disabled={isLoading}
        aria-pressed={isWishList}
        className={`btn btn-ghost btn-sm h-10 min-h-10 gap-1.5 px-2.5 font-semibold ${
          isWishList ? "text-accent" : "text-base-content/70"
        }`}
      >
        {isWishList ? (
          <PiBookmarkSimpleFill className="size-5" aria-hidden />
        ) : (
          <PiBookmarkSimpleBold className="size-5" aria-hidden />
        )}
        {label}
      </button>
      <LoginModal open={openLoginModal} onClose={handleShowLoginModal} />
    </>
  );
};

export default WishlistButton;
