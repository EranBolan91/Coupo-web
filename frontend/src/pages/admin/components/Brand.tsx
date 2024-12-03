import { saveImageBrand } from "../../../database/databaseCalls";
import { SubmitHandler, useForm } from "react-hook-form";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { DevTool } from "@hookform/devtools";
import toast from "react-hot-toast";
import { useState } from "react";

type NewBrand = {
  brandName: string;
  imgURL: File;
};

export default function Brand() {
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const form = useForm<NewBrand>();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<NewBrand> = async (data) => {
    toast.promise(saveImageBrand(uploadImage, data.brandName), {
      loading: "Saving brand...",
      success: `${data.brandName} brand saved!}`,
      error: "Error saving image",
    });
    reset();
    setDisplayImage(null);
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
      setUploadImage(file);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-12">
      <div className="h-screen col-span-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center items-center bg-white p-1 h-full"
          noValidate
        >
          <div className="space-y-12 w-1/2 bg-white p-3">
            <div className="border-b border-gray-900/10 pb-12">
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Brand
                  </label>
                  <div className="mt-2">
                    <input
                      {...register("brandName", {
                        required: "Brand name is required",
                      })}
                      id="brand"
                      type="text"
                      autoComplete="given-name"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p style={{ fontStyle: "oblique" }} className="text-red-600">
                    {errors?.brandName?.message}
                  </p>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Coupon Image
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    {displayImage && (
                      <div className="w-1/4 h-1/4">
                        <img src={displayImage} />
                      </div>
                    )}
                    {!displayImage && (
                      <div className="text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              id="file-upload"
                              {...register("imgURL", {
                                required: "Image is required",
                              })}
                              onChange={handleImageChange}
                              name="image"
                              multiple
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <p style={{ fontStyle: "oblique" }} className="text-red-600">
                    {" "}
                    {errors?.imgURL?.message}{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
              onClick={() => reset()}
            >
              Cancel
            </button>
            <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Save
            </button>
          </div>
        </form>
        <DevTool control={control} />
      </div>
    </div>
  );
}
