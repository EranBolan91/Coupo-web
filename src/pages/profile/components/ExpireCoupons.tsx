import { getExpiredCoupons } from "../../../database/databaseCalls";
import { UserAuth } from "../../../auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import RemoveCouponBtn from "./RemoveCouponBtn";
import { Coupon } from "../../../types/Types";

const ExpireCoupon = () => {
  const { user } = UserAuth();

  const { data, isLoading } = useQuery<Coupon[]>({
    queryKey: ["expireCoupons"],
    queryFn: () => getExpiredCoupons(user.uid),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="overflow-x-auto overflow-y-auto hide-scrollbar">
      {data?.length === 0 ? (
        <div>
          <span> No expired coupons</span>
        </div>
      ) : (
        <table className="table">
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
            {data?.map((coupon: Coupon, index: number) => (
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
                  <div className="text-sm text-red-600 font-bold">
                    {coupon.expiry.toDate().toDateString()}
                  </div>
                </td>
                <th>
                  <RemoveCouponBtn {...coupon} />
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpireCoupon;