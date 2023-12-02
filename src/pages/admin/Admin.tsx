import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import { Coupon, CouponBrand } from "../../types/Types";
import Select from "./components/Select";
import { DevTool } from "@hookform/devtools";
import {
  getCouponsBrands,
  saveNewCoupon,
  getCategories,
} from "../../database/databaseCalls";
import toast from "react-hot-toast";

const AdminPage = () => {
  const [couponBrands, setCouponBrands] = useState<CouponBrand[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brand, setBrand] = useState<CouponBrand>({ brand: "", imgURL: "" });
  const [category, setCategory] = useState<string>("");
  const form = useForm<Coupon>();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = form;

  const handleBrandChange = (value: string) => {
    const imgUrl = couponBrands.find((brand) => brand.brand === value)?.imgURL;
    setBrand({ brand: value, imgURL: imgUrl ? imgUrl : "" });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const onSubmit: SubmitHandler<Coupon> = (data) => {
    data.createdAt = new Date();
    data.category = category;
    data.name = brand.brand;
    data.imgUrl = brand.imgURL;
    toast.promise(saveNewCoupon(data), {
      loading: "Saving coupon...",
      success: `${brand.brand} coupon saved!`,
      error: "Error saving coupon",
    });
    reset();
  };

  useEffect(() => {
    if (
      (categories && categories.length === 0) ||
      (couponBrands && couponBrands.length === 0)
    ) {
      getCouponsBrands().then((brandsData) => {
        setCouponBrands(brandsData);
        setBrand(brandsData[0]);
      });
      getCategories().then((categoriesData) => {
        setCategories(categoriesData);
        setCategory(categoriesData[0]);
      });
    }
  }, []);

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
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Add New Coupon
              </h2>

              <div className="mt-10 grid grid-cols-12 md:grid-cols-12 gap-x-6 gap-y-8 ">
                <div className="col-span-12 md:col-span-6 lg:col-span-6">
                  {couponBrands.length > 0 && (
                    <Select
                      selectTitle="Brand"
                      data={couponBrands.map((brand) => brand.brand)}
                      control={register["name"]}
                      handleChange={handleBrandChange}
                    />
                  )}
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-6">
                  {categories.length > 0 && (
                    <Select
                      selectTitle="Category"
                      data={categories}
                      control={control}
                      handleChange={handleCategoryChange}
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
    </div>
  );
};

export default AdminPage;
