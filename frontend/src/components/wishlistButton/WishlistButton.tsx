import { removeCouponFromWishList, saveCouponInWishList } from "../../database/wishlist";
import { FaRegStar, FaStar } from "react-icons/fa";
import { UserAuth } from "../../auth/AuthProvider";
import useWishlist from "../../hooks/useWishlist";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import toast from "react-hot-toast";

const WishlistButton = ({ couponID }: { couponID: string }) => {
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
          <FaStar style={{ color: "gold", cursor: "pointer", fontSize: "1.3rem" }} onClick={removeFromWishList} />
        ) : (
          <FaRegStar style={{ color: "gold", cursor: "pointer", fontSize: "1.3rem" }} onClick={addToWishlist} />
        )
      ) : null}
    </>
  );
};

export default WishlistButton;
