import { Coupon } from "../../../types/CouponType";
import Modal from "../../../layout/Modal";
import { useState } from "react";

const RemoveCouponBtn = (coupon: Coupon) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const handleOpenModal = () => setOpenModal(!openModal);

  return (
    <>
      <button onClick={handleOpenModal} className="btn btn-ghost btn-xs">
        remove
      </button>
      <Modal coupon={coupon} open={openModal} setOpen={handleOpenModal} title={coupon.name} />
    </>
  );
};

export default RemoveCouponBtn;
