import { CurrentUser } from "../../../../types/Types";
import { useState } from "react";

export const ModalPersonalInfo = ({ currentUser }: { currentUser: CurrentUser }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  return (
    <>
      <button onClick={() => setOpenModal(true)} className="btn btn-sm btn-outline">
        Edit
      </button>
      <dialog id={`modal-currentUser`} className="modal" open={openModal}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit Personal Info</h3>
          <div className="w-full my-4"></div>
          <div className="my-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">First Name</span>
              </div>
              <input
                type="text"
                value={currentUser.firstName}
                className="input input-bordered w-full"
                onChange={(e) => {}}
              />
            </label>
            {error && <p className="text-red-500 italic font-normal">This field cannot be empty</p>}
          </div>
          <div className="my-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Last Name</span>
              </div>
              <input
                type="text"
                value={currentUser.lastName}
                className="input input-bordered w-full"
                onChange={(e) => {}}
              />
            </label>
            {error && <p className="text-red-500 italic font-normal">This field cannot be empty</p>}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button onClick={() => setOpenModal(false)} className="btn">
                Close
              </button>
            </form>
            <form method="dialog">
              <button onClick={() => {}} className="btn">
                Update
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
