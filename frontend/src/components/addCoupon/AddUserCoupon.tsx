import { getCategories, getCouponsBrands, saveUserNewCoupon } from "../../database/databaseCalls";
import { CouponBrand } from "../../types/CouponBrandType";
import { SubmitHandler, useForm } from "react-hook-form";
import Select from "../../pages/admin/components/Select";
import { UserAuth } from "../../auth/AuthProvider";
import { Coupon } from "../../types/CouponType";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AddUserCoupon = () => {
  const [brand, setBrand] = useState<CouponBrand>({ brand: "", imgURL: "" });
  const [couponBrands, setCouponBrands] = useState<CouponBrand[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const { user } = UserAuth();
  const form = useForm<Coupon>();
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = form;

  const handleBrandChange = (value: string) => {
    const imgUrl = couponBrands.find((brand) => brand.brand === value)?.imgURL;
    setBrand({ brand: value, imgURL: imgUrl ? imgUrl : "" });
  };

  const handleCategoryChange = (value: string) => setCategory(value);

  const onSubmit: SubmitHandler<Coupon> = (data) => {
    data.category = category;
    data.name = brand.brand;
    data.imgUrl = brand.imgURL;
    data.userID = user.uid;
    // data.username = user.displayName;

    toast
      .promise(saveUserNewCoupon(data, user.uid), {
        loading: "Saving coupon...",
        success: `${brand.brand} coupon saved!`,
        error: "Error saving coupon",
      })
      .then(() => {
        reset();
      })
      .catch(() => {});
  };

  useEffect(() => {
    if ((categories && categories.length === 0) || (couponBrands && couponBrands.length === 0)) {
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
      <div className="col-span-12">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center items-center h-full" noValidate>
          <div className="space-y-12 w-1/2 p-3">
            <div className="border-b border-gray-900/10">
              <h2 className="text-base font-semibold leading-7">Add New Coupon</h2>

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
                  <p className="mt-3 text-sm leading-6 text-gray-600">Write some info about the coupon</p>
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
                  <label htmlFor="last-name" className="block text-sm font-medium leading-6 ">
                    Discount
                  </label>
                  <div className="mt-2">
                    <input
                      {...register("discount", {
                        required: "Discount is required",
                        validate: (value) => {
                          return (value > 1 && value < 100) || "Discount must be between 1 and 100";
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
                  <label className="block text-sm font-medium leading-6 ">Expiry Date</label>
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

export default AddUserCoupon;
