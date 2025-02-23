import { getCategories, updateCoupon } from "../../../database/databaseCalls";
import { UserAuth } from "../../../auth/AuthProvider";
import { Coupon } from "../../../types/CouponType";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";

interface Props {
  coupon: Coupon;
  index: number;
  refetchData: () => void;
}

const ModalEditCoupon = ({ coupon, index, refetchData }: Props) => {
  const [discountPercentage, setDiscountPercentage] = useState<number>(coupon.discount);
  const [description, setDescription] = useState<string>(coupon.description ?? "");
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [category, setCategory] = useState<string>(coupon.category);
  const [error, setError] = useState<boolean>(false);
  const { user } = UserAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: openEditModal,
  });

  const updateCouponData = async () => {
    toast
      .promise(updateCoupon(category, discountPercentage, description, coupon.id, user.uid), {
        success: "successfully updated",
        loading: "updating",
        error: "error in updaing",
      })
      .then(() => refetchData());
  };

  const handleDiscount = (event: string) => {
    const discountNumber = parseInt(event);
    if (discountNumber < 0 || discountNumber > 100) {
      setError(true);
    } else {
      setDiscountPercentage(parseInt(event));
      setError(false);
    }
  };

  const handleOpenEditModal = () => setOpenEditModal(!openEditModal);

  return (
    <>
      <button className="btn" onClick={handleOpenEditModal}>
        edit
      </button>
      <dialog id={`modal-${index}`} className="modal" open={openEditModal}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit coupon - {coupon.name}</h3>
          <div className="w-full my-4">
            {isLoading ? (
              ""
            ) : (
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Category</span>
                </div>
                <select
                  className="select select-bordered w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {data?.map((category: string) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="my-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Discount percentage</span>
              </div>
              <input
                max={100}
                min={0}
                placeholder="15%"
                type="number"
                value={discountPercentage}
                className="input input-bordered w-full"
                onChange={(e) => handleDiscount(e.target.value)}
              />
            </label>
            {error && <p className="text-red-500 italic font-normal">Value cannot be less 0 or more then 100</p>}
          </div>
          <div className="w-full my-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Coupon description</span>
              </div>
              <textarea
                value={description}
                placeholder="description"
                className="textarea textarea-bordered textarea-lg w-full"
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </label>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button onClick={() => setOpenEditModal(false)} className="btn">
                Close
              </button>
            </form>
            <form method="dialog">
              <button onClick={updateCouponData} className="btn">
                Update
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default ModalEditCoupon;
