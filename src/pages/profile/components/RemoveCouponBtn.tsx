import React, { useState } from "react";
import { Coupon } from "../../../types/Types";
import Modal from "../../../components/Modal";

const RemoveCouponBtn = (coupon: Coupon) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const handleOpenModal = () => setOpenModal(!openModal);

  return (
    <>
      <button onClick={handleOpenModal} className="btn btn-ghost btn-xs">
        Remove
      </button>
      <Modal
        coupon={coupon}
        open={openModal}
        setOpen={handleOpenModal}
        title={coupon.name}
      />
    </>
  );
};

export default RemoveCouponBtn;
