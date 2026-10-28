import { PiTrashBold } from "react-icons/pi";
import { Coupon } from "../../../types/CouponType";
import Modal from "../../../layout/Modal";
import { useState } from "react";

const RemoveCouponBtn = (coupon: Coupon) => {
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenModal(true)}
        className="btn btn-ghost btn-sm h-10 min-h-10 px-3 text-error hover:bg-error/10"
      >
        <PiTrashBold className="size-4" aria-hidden />
        Remove
      </button>
      <Modal coupon={coupon} open={openModal} setOpen={setOpenModal} title={coupon.name} />
    </>
  );
};

export default RemoveCouponBtn;
