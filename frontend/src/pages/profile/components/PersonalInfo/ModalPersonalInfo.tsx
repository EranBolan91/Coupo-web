import { updateUserProfileDetails } from "../../../../logic/logic";
import { useForm, SubmitHandler } from "react-hook-form";
import { MdOutlineCloudUpload } from "react-icons/md";
import { User } from "../../../../types/UserType";
import { Timestamp } from "firebase/firestore";
import { GrPowerCycle } from "react-icons/gr";
import toast from "react-hot-toast";
import { useState } from "react";

export type PersonalInfoForm = {
  firstName: string;
  lastName: string;
  imageURL: string;
  birthday: Timestamp;
};

export const ModalPersonalInfo = ({ currentUser }: { currentUser: User }) => {
  const [displayImage, setDisplayImage] = useState<string | null>(currentUser.imageURL);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [imagePath, setImagePath] = useState<string>("");
  const form = useForm<PersonalInfoForm>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      birthday: currentUser.birthday?.toDate().toISOString().split("T")[0],
      imageURL: currentUser.imageURL,
    },
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const handleSubmitForm: SubmitHandler<PersonalInfoForm> = async (data) => {
    data.imageURL = imagePath;
    toast
      .promise(updateUserProfileDetails(currentUser, data), {
        success: "User details updated successfully",
        loading: "Updating user details...",
        error: "Error, something went wrong...",
      })
      .then(() => {
        setDisplayImage(null);
        setOpenModal(false);
      });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];

    if (file) {
      // Read the file and convert it to a data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setDisplayImage(imageDataUrl);
      };
      setImagePath(file);
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setDisplayImage(null);
    setImagePath("");
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
            {errors.firstName && <p className="text-red-500 italic font-normal">This field cannot be empty</p>}
          </div>
          <div className="my-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Last Name</span>
              </div>
              <input
                id="lastName"
                type="text"
                className="input input-bordered w-full"
                {...register("lastName", {
                  required: "This field cannot be empty",
                })}
              />
            </label>
            {errors.lastName && <p className="text-red-500 italic font-normal">This field cannot be empty</p>}
          </div>
          <div className="my-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Birth of Date</span>
              </div>
              <input
                id="birthday"
                type="date"
                className="input input-bordered w-full"
                {...register("birthday", {
                  required: "This field cannot be empty",
                })}
              />
            </label>
            {errors.birthday && <p className="text-red-500 italic font-normal">This field cannot be empty</p>}
          </div>
          <div className="my-4">
            <div className="label">
              <span className="label-text">Profile image</span>
            </div>
            <div className="flex items-center justify-center w-full">
              {displayImage !== null ? (
                <div>
                  <img src={displayImage} />
                  <span className="flex items-center cursor-pointer" onClick={clearSelectedImage}>
                    clear image <GrPowerCycle className="ml-2" />
                  </span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:hover:border-gray-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <MdOutlineCloudUpload fontSize={"2.3rem"} />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG, or GIF (MAX. 800x400px)</p>
                  </div>
                  <input
                    id="file-upload"
                    accept="image/*"
                    type="file"
                    className="hidden"
                    {...register("imageURL")}
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
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
