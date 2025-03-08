import { removeCouponFromWishList, saveCouponInWishList } from "../../database/wishlist";
import LoginModal from "../../pages/coupons/components/LoginModal";
import { FaRegStar, FaStar } from "react-icons/fa";
import { UserAuth } from "../../auth/AuthProvider";
import useWishlist from "../../hooks/useWishlist";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  couponID: string;
  labelToAdd?: string;
  labelToRemove?: string;
}

const starStyle = {
  color: "gold",
  fontSize: "1.3rem",
};

const WishlistButton = ({ couponID, labelToAdd, labelToRemove }: Props) => {
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [isWishList, setIsWishList] = useState<boolean>(false);
  const { userDocument } = UserAuth();
  const { wishlists, isLoading } = useWishlist(userDocument?.userUID!);

  const handleShowLoginModal = () => setOpenLoginModal(!openLoginModal);

  const addToWishlist = () => {
    if (userDocument === null) {
      handleShowLoginModal();
      return;
    }
    toast.promise(saveCouponInWishList(userDocument.userUID, couponID), {
      success: `Added to wishlist`,
      loading: "",
      error: "Some probles has accured",
    });
    setIsWishList(true);
  };

  const removeFromWishList = () => {
    removeCouponFromWishList(userDocument?.userUID!, couponID);
    setIsWishList(false);
  };

  useEffect(() => {
    if (wishlists?.includes(couponID)) {
      setIsWishList(true);
    }
  }, [wishlists]);

  //TODO: need to write a wrapper component for auth, if not user is not logged in, show a modal to login
  return (
    <>
      {isLoading === false ? (
        isWishList === true ? (
          <div className="flex gap-2 cursor-pointer" onClick={removeFromWishList}>
            <FaStar style={starStyle} />
            {labelToRemove && <span>{labelToRemove}</span>}
          </div>
        ) : (
          <div className="flex gap-2 cursor-pointer" onClick={addToWishlist}>
            <FaRegStar style={starStyle} />
            {labelToAdd && <span>{labelToAdd}</span>}
          </div>
        )
      ) : null}
      <LoginModal open={openLoginModal} onClose={handleShowLoginModal} />
    </>
  );
};

export default WishlistButton;
