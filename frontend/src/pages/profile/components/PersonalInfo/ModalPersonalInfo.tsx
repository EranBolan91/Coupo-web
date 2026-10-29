import { PiArrowCounterClockwiseBold, PiImageSquareBold } from "react-icons/pi";
import { updateUserProfileDetails } from "../../../../logic/logic";
import { maxProfileImageBytes } from "../../../../database/profile";
import { UserAuth } from "../../../../auth/AuthProvider";
import { useForm, SubmitHandler } from "react-hook-form";
import { UserDocument } from "../../../../types/UserType";
import Modal from "../../../../components/Modal/Modal";
import Field from "../../../../components/ui/Field";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { useState } from "react";

interface Props {
  currentUser: UserDocument;
  open: boolean;
  onClose: () => void;
}

type ProfileForm = { firstName: string; lastName: string; birthday?: string };

export const ModalPersonalInfo = ({ currentUser, open, onClose }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { refreshUserDocument } = UserAuth();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      birthday: currentUser.birthday?.toDate().toISOString().split("T")[0],
    },
  });

  const clearImage = () => {
    setPreview(null);
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // so picking the same file again still triggers onChange
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    if (file.size >= maxProfileImageBytes) {
      toast.error("Please pick an image under 5 MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save: SubmitHandler<ProfileForm> = async (form) => {
    const update: UserDocument = {
      ...currentUser,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      birthday: form.birthday ? Timestamp.fromDate(new Date(form.birthday)) : currentUser.birthday,
    };
    await toast
      .promise(updateUserProfileDetails(update, imageFile), {
        loading: "Saving your profile...",
        success: "Profile updated",
        error: "Couldn't save your profile. Please try again.",
      })
      .then(async () => {
        await refreshUserDocument();
        clearImage();
        onClose();
      })
      .catch((error) => console.error(error?.code ?? error?.message));
  };

  const currentImage = preview ?? currentUser.imageURL;

  return (
    <Modal isOpen={open} onClose={onClose} title="Edit profile" size="lg">
      <form id="profile-form" onSubmit={handleSubmit(save)} className="space-y-6" noValidate>
        <div className="flex items-center gap-5">
          <div className="size-20 shrink-0 overflow-hidden rounded-box bg-base-200 ring-4 ring-primary">
            {currentImage ? (
              <img src={currentImage} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center font-display text-3xl font-extrabold">
                {currentUser.firstName?.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="btn btn-ghost btn-sm h-10 min-h-10 cursor-pointer border-2 border-base-300 px-4">
              <PiImageSquareBold className="size-4" aria-hidden />
              {currentImage ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
            </label>
            {preview && (
              <button type="button" className="btn btn-ghost btn-sm h-10 min-h-10 px-4" onClick={clearImage}>
                <PiArrowCounterClockwiseBold className="size-4" aria-hidden />
                Undo
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              className="input input-bordered h-12 w-full bg-base-100"
              {...register("firstName", { required: "First name is required" })}
            />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              className="input input-bordered h-12 w-full bg-base-100"
              {...register("lastName", { required: "Last name is required" })}
            />
          </Field>
        </div>
        <Field label="Date of birth" htmlFor="birthday" hint="Optional" error={errors.birthday?.message}>
          <input
            id="birthday"
            type="date"
            autoComplete="bday"
            max={new Date().toISOString().split("T")[0]}
            className="input input-bordered h-12 w-full bg-base-100 sm:w-1/2"
            {...register("birthday", {
              validate: (value) => !value || value <= new Date().toISOString().split("T")[0] || "That date is in the future",
            })}
          />
        </Field>
      </form>
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" form="profile-form" className="btn btn-primary h-12 min-h-12" disabled={isSubmitting}>
          {isSubmitting && <span className="loading loading-spinner loading-sm" aria-hidden />}
          Save profile
        </button>
      </div>
    </Modal>
  );
};
