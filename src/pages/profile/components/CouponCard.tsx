import { removeUserCoupon } from "../../../database/databaseCalls";
import { UserAuth } from "../../../auth/AuthProvider";
import Modal from "../../../components/Modal";
import { Coupon } from "../../../types/Types";
import { FaThumbsDown } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useState } from "react";
import toast from "react-hot-toast";

const CouponCard = (props: Coupon) => {
  const [openModal, setOpenModal] = useState(false);
  const { user } = UserAuth();

  const handleOpenModal = (open: boolean) => {
    setOpenModal(open);
  };
  const handleRemoveCoupon = () => {
    toast.promise(removeUserCoupon(user.uid, props.id), {
      loading: `Removing ${props.code}, please wait...`,
      success: `${props.code} is removed!`,
      error: "Error removing copuon",
    });
    setOpenModal(false);
  };

  const convertDate = (seconds: any): string => {
    const milliseconds = seconds * 1000;
    const date = new Date(milliseconds);
    // Adjust for local time zone
    const localDate = new Date(date.toLocaleString());
    // Extract date components
    const day = String(localDate.getDate()).padStart(2, "0");
    const month = String(localDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = localDate.getFullYear();
    // Format the date
    const formattedDate = `${day}/${month}/${year}`;

    return formattedDate;
  };

  return (
    <div className="grid grid-cols-12 w-full h-40 bg-white rounded my-3 shadow shadow-blue-500/40 hover:shadow-indigo-500/40">
      <div className="col-span-2 flex justify-center items-center">
        <img className="h-20 w-16" src={props.imgUrl} />
      </div>
      <div className="col-span-8 flex flex-col justify-evenly">
        <div>
          <span className="text-black font-semibold text-xl">
            {props.description}
          </span>
        </div>
        <div>
          <span className="text-black">
            Code: <b>{props.code}</b>{" "}
          </span>
        </div>
        <div>
          <span className="text-black">
            Discount: <b>{props.discount}%</b>
          </span>
        </div>
        <div>
          <span className="text-black">
            Expiration: <b>{props.expiry.toString()}</b>
          </span>
        </div>
        <div>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            uploaded: <b>{convertDate(props.createdAt)}</b>
          </span>
        </div>
      </div>
      <div className="col-span-2 flex flex-col justify-between items-center">
        <div className="text-black">
          <button
            onClick={() => handleOpenModal(true)}
            className="bg-grey-light hover:bg-grey text-grey-darkest font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <span>Remove</span>
            <MdDelete className={"h-6 w-6"} />
          </button>
        </div>
        <div className="flex justify-around w-full text-center">
          <span className="text-green-600">
            <FaThumbsUp className={"h-8 w-8"} />
            2255
          </span>
          <span className="text-red-600">
            <FaThumbsDown className={"h-8 w-8"} />
            55
          </span>
        </div>
      </div>
      <Modal
        setOpen={handleOpenModal}
        func={handleRemoveCoupon}
        open={openModal}
        title={props.code}
      />
    </div>
  );
};

export default CouponCard;
