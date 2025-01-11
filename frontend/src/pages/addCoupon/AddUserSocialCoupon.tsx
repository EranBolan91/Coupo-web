import { saveUserSocialCoupon } from "../../database/social";
import { SubmitHandler, useForm } from "react-hook-form";
import { UserAuth } from "../../auth/AuthProvider";
import { Coupon } from "../../types/Types";
import toast from "react-hot-toast";

const AddUserSocialCoupon = () => {
  const form = useForm<Coupon>();
  const { user } = UserAuth();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<Coupon> = (data) => {
    toast
      .promise(saveUserSocialCoupon(data, user.uid), {
        loading: "Saving coupon...",
        success: `${data.name} coupon saved!`,
        error: "Error saving coupon",
      })
      .then(() => {
        reset();
      })
      .catch(() => {});
  };

  return (
    <div className="grid grid-cols-12 bg-base-200 py-3">
      <div className="col-span-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center items-center h-full"
          noValidate
        >
          <div className="space-y-12 w-1/2">
            <div className="border-b border-gray-900/10">
              <h2 className="text-base font-semibold leading-7">Add New Social Coupon</h2>

              <div className="mt-10 grid grid-cols-12 md:grid-cols-12 gap-x-6 gap-y-8 ">
                <div className="col-span-full">
                  <label htmlFor="brand-name" className="block text-sm font-medium leading-6">
                    Brand
                  </label>
                  <div className="mt-2">
                    <input
                      {...register("name", {
                        required: "Brand name is required",
                        validate: (value) => {
                          return value !== "" || "Must provide brand name";
                        },
                      })}
                      type="text"
                      autoComplete="brand-name"
                      className="block w-full input input-bordered rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p style={{ fontStyle: "oblique" }} className="text-red-600">
                    {" "}
                    {errors?.name?.message}{" "}
                  </p>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-12 md:grid-cols-12 gap-x-6 gap-y-8 ">
                <div className="col-span-full">
                  <label htmlFor="about" className="block text-sm font-medium leading-6">
                    Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      {...register("description")}
                      rows={2}
                      className="block w-full rounded-md textarea textarea-bordered border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6">Write some info about the coupon</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-900/10">
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="first-name" className="block text-sm font-medium leading-6">
                    Coupon Code
                  </label>
                  <div className="mt-2">
                    <input
                      {...register("code", { required: "Code is required" })}
                      placeholder="#FREEWEEKEND"
                      type="text"
                      autoComplete="given-name"
                      className="block w-full input input-bordered rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p style={{ fontStyle: "oblique" }} className="text-red-600">
                    {" "}
                    {errors?.code?.message}{" "}
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="last-name" className="block text-sm font-medium leading-6">
                    Discount
                  </label>
                  <div className="mt-2">
                    <input
                      {...register("discount", {
                        required: "Discount is required",
                        validate: (value) => {
                          return (
                            (parseInt(value) > 1 && parseInt(value) < 100) ||
                            "Discount must be between 1 and 100"
                          );
                        },
                      })}
                      placeholder="15%"
                      type="number"
                      autoComplete="family-name"
                      className="block w-full input input-bordered rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p style={{ fontStyle: "oblique" }} className="text-red-600">
                    {" "}
                    {errors?.discount?.message}{" "}
                  </p>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium leading-6">Expiry Date</label>
                  <div className="mt-2">
                    <input
                      {...register("expiry", {
                        required: "Expiration date is required",
                      })}
                      type="date"
                      className="block w-1/2 input input-bordered rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p style={{ fontStyle: "oblique" }} className="text-red-600">
                    {" "}
                    {errors?.expiry?.message}{" "}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-6">
              <button className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserSocialCoupon;
