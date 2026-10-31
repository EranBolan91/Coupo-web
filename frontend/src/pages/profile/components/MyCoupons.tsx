import { PiCopyBold, PiThumbsDownBold, PiThumbsUpBold } from "react-icons/pi";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { getUserCoupons } from "../../../database/databaseCalls";
import CouponCard, { CouponCardSkeleton } from "../../coupons/components/CouponCard";
import EmptyState from "../../../components/ui/EmptyState";
import { Coupon } from "../../../types/CouponType";
import { useQuery } from "@tanstack/react-query";
import RemoveCouponBtn from "./RemoveCouponBtn";
import ModalEditCoupon from "./ModalEditCoupon";
import { Link } from "react-router-dom";

// The user's own active coupons: ticket preview + an owner bar with votes, Edit and Remove.
const MyCoupons = () => {
  const userDocument = useCurrentUser();
  const { data = [], isLoading, refetch } = useQuery<Coupon[]>({
    queryKey: ["usercoupons"],
    queryFn: () => getUserCoupons(userDocument?.userUID ?? ""),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading your coupons">
        <CouponCardSkeleton />
        <CouponCardSkeleton />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="You haven't shared a coupon yet"
        description="Got a code that worked for you? Share it and help everyone save."
        action={
          <Link to="/addcoupon" className="btn btn-primary">
            Share a coupon
          </Link>
        }
      />
    );
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {data.map((coupon, index) => (
        <li key={coupon.id} className="flex flex-col gap-2">
          <CouponCard coupon={coupon} preview />
          <div className="flex items-center justify-between rounded-btn bg-base-100 px-2 py-1">
            <span className="flex items-center gap-3 px-2 text-sm font-semibold text-base-content/70">
              <span className="inline-flex items-center gap-1" title="Copied">
                <PiCopyBold aria-hidden /> {coupon.copies ?? 0}
                <span className="sr-only">copies</span>
              </span>
              <span className="inline-flex items-center gap-1" title="Likes">
                <PiThumbsUpBold aria-hidden /> {coupon.likes}
                <span className="sr-only">likes</span>
              </span>
              <span className="inline-flex items-center gap-1" title="Dislikes">
                <PiThumbsDownBold aria-hidden /> {coupon.dislikes}
                <span className="sr-only">dislikes</span>
              </span>
            </span>
            <span className="flex">
              <ModalEditCoupon coupon={coupon} index={index} refetchData={refetch} />
              <RemoveCouponBtn {...coupon} />
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MyCoupons;
