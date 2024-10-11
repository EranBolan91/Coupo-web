import { useForm, SubmitHandler } from "react-hook-form";
import { CurrentUser } from "../../../../types/Types";
import { useState } from "react";
import { updatePersonalUserDetails } from "../../../../database/databaseCalls";
import toast from "react-hot-toast";

type PersonalInfoForm = {
  firstName: string;
  lastName: string;
  imageUrl: string;
};

export const ModalPersonalInfo = ({ currentUser }: { currentUser: CurrentUser }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const form = useForm<PersonalInfoForm>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
    },
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const handleSubmitForm: SubmitHandler<PersonalInfoForm> = async (data) => {
    toast
      .promise(updatePersonalUserDetails(currentUser.userUID, data), {
        success: "User details updated successfully",
        loading: "Updating user details...",
        error: "Error, something went wrong...",
      })
      .then(() => setOpenModal(false));
  };

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
                id="firstName"
                className="input input-bordered w-full"
                type="text"
                {...register("firstName", {
                  required: "This field cannot be empty",
                })}
              />
            </label>
            {errors.firstName && (
              <p className="text-red-500 italic font-normal">This field cannot be empty</p>
            )}
          </div>
          <div className="my-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Last Name</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full"
                {...register("lastName", {
                  required: "This field cannot be empty",
                })}
              />
            </label>
            {errors.lastName && (
              <p className="text-red-500 italic font-normal">This field cannot be empty</p>
            )}
          </div>
          <div className="modal-action">
            <form method="dialog" onSubmit={handleSubmit(handleSubmitForm)}>
              <button type="button" onClick={() => setOpenModal(false)} className="btn">
                Close
              </button>
              <button type="submit" className="btn ml-2">
                Update
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
