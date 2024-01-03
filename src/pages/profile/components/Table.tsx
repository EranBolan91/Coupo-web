import { useEffect, useState } from "react";
import { getUserCoupons } from "../../../database/databaseCalls";
import { UserAuth } from "../../../auth/AuthProvider";
import { Coupon } from "../../../types/Types";

const Table = () => {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const { user }: any = UserAuth();

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
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
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
          {/* row 1 */}
          {coupons?.map((coupon, index) => (
            <tr key={index}>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-14 h-14">
                      <img src={coupon.imgUrl} style={{ objectFit: "fill" }} />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{coupon.name}</div>
                    {/* <div className="text-sm opacity-50">United States</div> */}
                  </div>
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
                <button className="btn btn-ghost btn-xs">details</button>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
