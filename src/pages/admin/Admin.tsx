import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import {
  getCouponsBrands,
  saveNewCoupon,
  getCategories,
} from "../../database/databaseCalls";
import { useForm, SubmitHandler, useController } from "react-hook-form";
import { useEffect, useState } from "react";
import { Coupon } from "../../types/Types";
import Select from "./components/Select";
import { DevTool } from "@hookform/devtools";

const AdminPage = () => {
  const [couponBrands, setCouponBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const form = useForm<Coupon>();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<Coupon> = (data) => {
    data.createdAt = new Date();
    data.imgUrl = "https://cdn.worldvectorlogo.com/logos/asus-rog-1.svg";
    saveNewCoupon(data);
  };

  useEffect(() => {
    getCouponsBrands().then((brandsData) => {
      setCouponBrands(brandsData);
    });
    getCategories().then((categoriesData) => {
      setCategories(categoriesData);
    });
  }, []);

  return (
    <div className="p-3">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center items-center bg-white p-1"
        noValidate
      >
        <div className="space-y-12 w-1/2 bg-white p-3">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Add New Coupon
            </h2>

            <div className="mt-10 grid grid-cols-12 md:grid-cols-12 gap-x-6 gap-y-8 ">
              <div className="col-span-12 md:col-span-6 lg:col-span-6">
                {couponBrands.length > 0 && (
                  <Select
                    selectTitle="Choose Brand"
                    data={couponBrands}
                    control={register["name"]}
                  />
                )}
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-6">
                {categories.length > 0 && (
                  <Select
                    selectTitle="Choose Category"
                    data={categories}
                    control={control}
                  />
                )}
              </div>
              <div className="col-span-full">
                <label
                  htmlFor="about"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    {...register("description")}
                    rows={2}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    defaultValue={""}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Write some info about the coupon
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
                  <div className="text-center">
                    <PhotoIcon
                      className="mx-auto h-12 w-12 text-gray-300"
                      aria-hidden="true"
                    />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          {...register("imgUrl")}
                          // {...register("imgUrl", {
                          //   required: "Image is required",
                          // })}
                          type="file"
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                <p style={{ fontStyle: "oblique" }} className="text-red-600">
                  {" "}
                  {errors?.imgUrl?.message}{" "}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Coupon Code
                </label>
                <div className="mt-2">
                  <input
                    {...register("code", { required: "Code is required" })}
                    placeholder="#FREEWEEKEND"
                    type="text"
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <p style={{ fontStyle: "oblique" }} className="text-red-600">
                  {" "}
                  {errors?.code?.message}{" "}
                </p>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
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
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <p style={{ fontStyle: "oblique" }} className="text-red-600">
                  {" "}
                  {errors?.discount?.message}{" "}
                </p>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Expiry Date
                </label>
                <div className="mt-2">
                  <input
                    {...register("expiry", {
                      required: "Expiration date is required",
                    })}
                    type="date"
                    className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <p style={{ fontStyle: "oblique" }} className="text-red-600">
                  {" "}
                  {errors?.expiry?.message}{" "}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
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
  );
};

export default AdminPage;
