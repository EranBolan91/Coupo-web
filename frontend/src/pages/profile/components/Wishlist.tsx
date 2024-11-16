import { getUserWishlistCoupons } from "../../../logic/logic";
import { UserAuth } from "../../../auth/AuthProvider";
import useWishlist from "../../../hooks/useWishlist";
import { useQuery } from "@tanstack/react-query";
import { Coupon } from "../../../types/Types";
import { User } from "firebase/auth";

const Wishlist = () => {
  const { user }: { user: User } = UserAuth();
  const { data } = useWishlist(user.uid);

  const { data: wishListData, isLoading } = useQuery<Coupon[] | undefined>({
    queryKey: ["userWishlist"],
    queryFn: async () => {
      if (data !== undefined) {
        return await getUserWishlistCoupons(data as string[]);
      }
    },
  });

  return (
    <div className="overflow-x-auto overflow-y-auto hide-scrollbar">
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
          {isLoading === false &&
            wishListData?.map((coupon: Coupon, index: number) => (
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
                  <div className="text-sm">{coupon.expiry.toDate().toDateString()}</div>
                </td>
                <th>
                  {/* <RemoveCouponBtn {...coupon} />
                  <ModalEditCoupon
                    key={index}
                    coupon={coupon}
                    index={index}
                    refetchData={refetch}
                  /> */}
                </th>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Wishlist;