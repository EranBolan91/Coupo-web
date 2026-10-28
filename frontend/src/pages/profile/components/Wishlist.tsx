import { useCurrentUser } from "../../../hooks/useCurrentUser";
import CouponGrid from "../../../components/coupons/CouponGrid";
import { getUserWishlistCoupons } from "../../../logic/logic";
import { Coupon } from "../../../types/CouponType";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const userDocument = useCurrentUser();
  const { data = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["userWishlist"],
    queryFn: () => getUserWishlistCoupons(userDocument?.userUID ?? ""),
  });

  return (
    <CouponGrid
      coupons={data}
      isLoading={isLoading}
      skeletonCount={3}
      emptyTitle="No saved coupons yet"
      emptyDescription="Tap Save on any coupon to keep it here for later."
      emptyAction={
        <Link to="/coupons" className="btn btn-primary">
          Browse coupons
        </Link>
      }
    />
  );
};

export default Wishlist;
