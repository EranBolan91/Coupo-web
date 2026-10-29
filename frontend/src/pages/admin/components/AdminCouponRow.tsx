import AdminCouponActions from "../../../components/admin/AdminCouponActions";
import { BrandImage } from "../../coupons/components/CouponCard";
import { couponPath } from "../../../logic/couponLinks";
import { Coupon } from "../../../types/CouponType";
import { PiArrowSquareOutBold } from "react-icons/pi";
import { Link } from "react-router-dom";
import React from "react";

const shortDate = (coupon: Coupon) =>
  coupon.expiry?.toDate?.().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// One coupon in an admin list: what it is, who shared it, and Edit / Delete.
const AdminCouponRow = ({ coupon, children }: { coupon: Coupon; children?: React.ReactNode }) => {
  const expired = (coupon.expiry?.toMillis?.() ?? Infinity) < Date.now();
  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <BrandImage name={coupon.name} src={coupon.imgUrl} />
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-lg font-extrabold capitalize">{coupon.name}</span>
              <code className="font-mono text-sm font-bold uppercase tracking-wider">{coupon.code}</code>
              <span className="text-sm font-bold">{coupon.discount}% off</span>
            </p>
            <p className="mt-0.5 text-sm text-base-content/60">
              <span className="capitalize">{coupon.category}</span>
              {" · "}
              {coupon.type === "socialCoupon" ? "Social" : "Store"}
              {" · by "}
              {coupon.username || "Coupo"}
              {" · "}
              <span className={expired ? "font-semibold text-error" : ""}>{expired ? `Expired ${shortDate(coupon)}` : `Until ${shortDate(coupon)}`}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={couponPath(coupon)} className="btn btn-ghost btn-sm h-10 min-h-10 px-3">
            <PiArrowSquareOutBold className="size-4" aria-hidden />
            View
          </Link>
          <AdminCouponActions coupon={coupon} size="sm" />
        </div>
      </div>
      {children}
    </div>
  );
};

export default AdminCouponRow;
