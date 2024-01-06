import { useEffect, useState } from "react";
import {
  getUserCoupons,
  removeUserCoupon,
} from "../../../database/databaseCalls";
import { UserAuth } from "../../../auth/AuthProvider";
import { Coupon } from "../../../types/Types";
import Modal from "../../../components/Modal";
import toast from "react-hot-toast";

const Table = () => {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const { user } = UserAuth();

  const handleOpenModal = (open: boolean) => {
    setOpenModal(open);
  };

  // const handleRemoveCoupon = (coupon: Coupon) => {
  //   toast.promise(removeUserCoupon(user.uid, coupon.id), {
  //     loading: `Removing ${coupon.code}, please wait...`,
  //     success: `${coupon.code} is removed!`,
  //     error: "Error removing copuon",
  //   });
  //   setOpenModal(false);
  // };

  const modal = (coupon: Coupon) => {
    return (
      <Modal
        coupon={coupon}
        open={true}
        setOpen={handleOpenModal}
        title={coupon.name}
      />
    );
  };

  useEffect(() => {
    const fetchUserCoupons = async () => {
      const res = await getUserCoupons(user.uid);
      setCoupons(res);
      console.log("coupons", res);
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
          {coupons?.map((coupon, index) => (
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
                <button
                  onClick={() => handleOpenModal(true)}
                  className="btn btn-ghost btn-xs"
                >
                  Remove
                </button>
                <Modal
                  coupon={coupon}
                  open={openModal}
                  setOpen={handleOpenModal}
                  title={coupon.name}
                />
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
