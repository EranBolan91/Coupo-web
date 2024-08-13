import { getUserCoupons } from "../../../database/databaseCalls";
import { UserAuth } from "../../../auth/AuthProvider";
import RemoveCouponBtn from "./RemoveCouponBtn";
import { Coupon } from "../../../types/Types";
import { useEffect, useState } from "react";

const Table = () => {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const { user } = UserAuth();

  useEffect(() => {
    const fetchUserCoupons = async () => {
      const res = await getUserCoupons(user.uid);
      setCoupons(res);
    };
    fetchUserCoupons();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Code</th>
            <th>Discount</th>
            <th>Likes</th>
            <th>Dislikes</th>
            <th>Expiration</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {coupons?.map((coupon: Coupon, index: number) => (
            <tr key={index}>
              <th>
                <div className="avatar">
                  <div className="mask mask-squircle w-14 h-14">
                    <img src={coupon.imgUrl} style={{ objectFit: "fill" }} />
                  </div>
                </div>
              </th>
              <td>
                <div className="flex items-center gap-3">
                  <div className="font-bold">{coupon.name}</div>
                </div>
              </td>
              <td className="w-1/4">
                <div className="text-sm">{coupon.description}</div>
              </td>
              <td>
                <div className="text-sm">{coupon.category}</div>
              </td>
              <td>
                <div className="text-sm">{coupon.code}</div>
              </td>
              <td>
                <div className="text-sm">{coupon.discount}%</div>
              </td>
              <td>
                <div className="text-sm">{coupon.likes}</div>
              </td>
              <td>
                <div className="text-sm">{coupon.dislikes}</div>
              </td>
              <td>
                <div className="text-sm">{coupon.expiry.toString()}</div>
              </td>
              <th>
                <RemoveCouponBtn {...coupon} />
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
