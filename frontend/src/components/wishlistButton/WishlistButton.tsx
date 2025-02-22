import { removeCouponFromWishList, saveCouponInWishList } from "../../database/wishlist";
import { FaRegStar, FaStar } from "react-icons/fa";
import { UserAuth } from "../../auth/AuthProvider";
import useWishlist from "../../hooks/useWishlist";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
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
  const [isWishList, setIsWishList] = useState<boolean>(false);
  const { user }: { user: User } = UserAuth();
  const { wishlists, isLoading } = useWishlist(user.uid);

  const addToWishlist = () => {
    toast.promise(saveCouponInWishList(user.uid, couponID), {
      success: `Added to wishlist`,
      loading: "",
      error: "Some probles has accured",
    });
    setIsWishList(true);
  };

  const removeFromWishList = () => {
    removeCouponFromWishList(user.uid, couponID);
    setIsWishList(false);
  };

  useEffect(() => {
    if (wishlists?.includes(couponID)) {
      setIsWishList(true);
    }
  }, [wishlists]);

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
    </>
  );
};

export default WishlistButton;
