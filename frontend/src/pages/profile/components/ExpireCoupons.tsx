import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { getExpiredCoupons } from "../../../database/databaseCalls";
import CouponCard, { CouponCardSkeleton } from "../../coupons/components/CouponCard";
import EmptyState from "../../../components/ui/EmptyState";
import { Coupon } from "../../../types/CouponType";
import { useQuery } from "@tanstack/react-query";
import RemoveCouponBtn from "./RemoveCouponBtn";

const ExpireCoupon = () => {
  const userDocument = useCurrentUser();
  const { data = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["expireCoupons"],
    queryFn: () => getExpiredCoupons(userDocument?.userUID ?? ""),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading expired coupons">
        <CouponCardSkeleton />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title="Nothing expired" description="Coupons you shared will show up here after their expiry date." />;
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {data.map((coupon) => (
        <li key={coupon.id} className="flex flex-col gap-2">
          <div className="opacity-80">
            <CouponCard coupon={{ ...coupon, type: "coupon" }} preview />
          </div>
          <div className="flex justify-end rounded-btn bg-base-100 px-2 py-1">
            <RemoveCouponBtn {...coupon} type="coupon" />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ExpireCoupon;
