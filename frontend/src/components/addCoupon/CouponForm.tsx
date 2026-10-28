import { PiCaretUpDownBold, PiCheckBold, PiPlusBold } from "react-icons/pi";
import CouponCard, { BrandImage } from "../../pages/coupons/components/CouponCard";
import { getCategories, getCouponsBrands } from "../../database/databaseCalls";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { SubmitHandler, useForm } from "react-hook-form";
import { Listbox, Transition } from "@headlessui/react";
import { CouponBrand } from "../../types/CouponBrandType";
import { Coupon } from "../../types/CouponType";
import { useQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { Fragment, useEffect } from "react";
import Field from "../ui/Field";

export type CouponFormValues = {
  name: string; // brand
  imgUrl: string;
  category: string;
  code: string;
  discount: number;
  expiry: string; // yyyy-mm-dd from the date input
  description: string;
};

interface Props {
  // "store": brand picked from the Brands list. "social": brand typed freely (no logo).
  brandMode: "store" | "social";
  submitLabel: string;
  // Name shown as "by ..." on the preview. Defaults to the signed-in user.
  ownerName?: string;
  onSubmit: (values: CouponFormValues) => Promise<unknown>;
}

const today = () => new Date().toISOString().split("T")[0];

// Small "Try again" link next to a field label, for when its options failed to load.
const RetryLink = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} className="text-sm font-semibold text-base-content/70 hover:text-base-content hover:underline">
    Try again
  </button>
);

// Brand dropdown with logos (Headless UI Listbox, keyboard accessible).
const BrandPicker = ({
  brands,
  value,
  onChange,
  invalid,
}: {
  brands: CouponBrand[];
  value: string;
  onChange: (brand: CouponBrand) => void;
  invalid?: boolean;
}) => {
  const selected = brands.find((brand) => brand.brand === value);
  return (
    <Listbox value={selected ?? null} onChange={(brand: CouponBrand) => onChange(brand)} by="brand">
      <div className="relative">
        <Listbox.Button
          id="brand"
          className={`input input-bordered flex h-12 w-full items-center gap-3 bg-base-100 text-left ${invalid ? "input-error" : ""}`}
        >
          {selected ? (
            <>
              <BrandImage name={selected.brand} src={selected.imgURL} className="size-7" />
              <span className="flex-1 truncate font-semibold capitalize">{selected.brand}</span>
            </>
          ) : (
            <span className="flex-1 text-base-content/50">Choose a brand</span>
          )}
          <PiCaretUpDownBold className="size-4 text-base-content/50" aria-hidden />
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-box border border-base-300 bg-base-100 p-1.5 shadow-xl focus:outline-none">
            {brands.map((brand) => (
              <Listbox.Option
                key={brand.brand}
                value={brand}
                className={({ active }) =>
                  `flex cursor-pointer items-center gap-3 rounded-btn px-3 py-2 ${active ? "bg-base-200" : ""}`
                }
              >
                {({ selected: isSelected }) => (
                  <>
                    <BrandImage name={brand.brand} src={brand.imgURL} className="size-8" />
                    <span className={`flex-1 truncate capitalize ${isSelected ? "font-bold" : ""}`}>{brand.brand}</span>
                    {isSelected && <PiCheckBold className="size-4 text-accent" aria-hidden />}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

// Shared "share a coupon" form with a live ticket preview. Used by the store, social and admin flows.
const CouponForm = ({ brandMode, submitLabel, ownerName, onSubmit }: Props) => {
  const userDocument = useCurrentUser();
  const brandsQuery = useQuery({ queryKey: ["brands"], queryFn: getCouponsBrands, enabled: brandMode === "store" });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const brands = brandsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormValues>({
    defaultValues: { name: "", imgUrl: "", category: "", code: "", expiry: "", description: "" },
  });

  // Brand and category are required; register them so react-hook-form validates them.
  useEffect(() => {
    register("name", { required: brandMode === "store" ? "Choose a brand" : "Brand is required" });
    register("imgUrl");
  }, [register, brandMode]);

  const values = watch();
  const expiryDate = values.expiry ? new Date(values.expiry) : null;
  const preview: Coupon = {
    id: "preview",
    name: values.name,
    imgUrl: values.imgUrl,
    category: values.category,
    code: values.code?.toUpperCase(),
    discount: Number.isFinite(values.discount) ? values.discount : 0,
    description: values.description,
    username: ownerName ?? (userDocument ? `${userDocument.firstName} ${userDocument.lastName}`.trim() : ""),
    userID: userDocument?.userUID ?? "",
    likes: 0,
    dislikes: 0,
    expiry: (expiryDate && !isNaN(expiryDate.getTime()) ? Timestamp.fromDate(expiryDate) : undefined) as Timestamp,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    type: brandMode === "social" ? "socialCoupon" : "coupon",
  };

  const submit: SubmitHandler<CouponFormValues> = async (form) => {
    try {
      await onSubmit({ ...form, code: form.code.trim().toUpperCase() });
      reset();
    } catch {
      // The caller shows the error toast; keep what the user typed.
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-14">
      <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Brand"
            htmlFor="brand"
            error={errors.name?.message ?? (brandMode === "store" && brandsQuery.isError ? "Couldn't load the brands." : undefined)}
            labelAside={brandMode === "store" && brandsQuery.isError && <RetryLink onClick={() => brandsQuery.refetch()} />}
          >
            {brandMode === "store" ? (
              <BrandPicker
                brands={brands}
                value={values.name}
                invalid={!!errors.name}
                onChange={(brand) => {
                  setValue("name", brand.brand, { shouldValidate: true });
                  setValue("imgUrl", brand.imgURL);
                }}
              />
            ) : (
              <input
                id="brand"
                type="text"
                placeholder="e.g. Nike"
                className="input input-bordered h-12 w-full bg-base-100"
                aria-invalid={!!errors.name}
                value={values.name}
                onChange={(e) => setValue("name", e.target.value, { shouldValidate: !!errors.name })}
              />
            )}
          </Field>
          <Field
            label="Category"
            htmlFor="category"
            error={errors.category?.message ?? (categoriesQuery.isError ? "Couldn't load the categories." : undefined)}
            labelAside={categoriesQuery.isError && <RetryLink onClick={() => categoriesQuery.refetch()} />}
          >
            <select
              id="category"
              className="select select-bordered h-12 w-full bg-base-100"
              aria-invalid={!!errors.category}
              {...register("category", { required: "Choose a category" })}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1fr_9rem]">
          <Field label="Coupon code" htmlFor="code" error={errors.code?.message}>
            <input
              id="code"
              type="text"
              placeholder="SAVE20"
              autoCapitalize="characters"
              spellCheck={false}
              className="input input-bordered h-12 w-full bg-base-100 font-mono font-bold uppercase tracking-wider"
              aria-invalid={!!errors.code}
              {...register("code", { required: "Code is required", validate: (v) => v.trim() !== "" || "Code is required" })}
            />
          </Field>
          <Field label="Discount (%)" htmlFor="discount" error={errors.discount?.message}>
            <input
              id="discount"
              type="number"
              min={1}
              max={100}
              inputMode="numeric"
              placeholder="20"
              className="input input-bordered h-12 w-full bg-base-100"
              aria-invalid={!!errors.discount}
              {...register("discount", {
                valueAsNumber: true,
                required: "Discount is required",
                validate: (v) => (Number.isInteger(v) && v >= 1 && v <= 100) || "1 to 100",
              })}
            />
          </Field>
        </div>

        <Field label="Expires on" htmlFor="expiry" error={errors.expiry?.message}>
          <input
            id="expiry"
            type="date"
            min={today()}
            className="input input-bordered h-12 w-full bg-base-100 sm:w-1/2"
            aria-invalid={!!errors.expiry}
            {...register("expiry", {
              required: "Expiry date is required",
              validate: (v) => v >= today() || "The date has already passed",
            })}
          />
        </Field>

        <Field label="Details" htmlFor="description" hint="Optional. Any conditions, like a minimum order or first purchase only.">
          <textarea
            id="description"
            rows={3}
            className="textarea textarea-bordered w-full bg-base-100 text-base"
            {...register("description")}
          />
        </Field>

        <button type="submit" className="btn btn-primary h-14 min-h-14 w-full px-8 text-base sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading loading-spinner loading-sm" aria-hidden /> : <PiPlusBold aria-hidden />}
          {submitLabel}
        </button>
      </form>

      <aside className="order-first lg:order-none" aria-label="Live preview">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-base-content/50">Preview</p>
          <div className="lg:rotate-[-1.5deg]">
            <CouponCard coupon={preview} preview />
          </div>
          <p className="mt-4 text-sm text-base-content/60">This is how your coupon will look to everyone.</p>
        </div>
      </aside>
    </div>
  );
};

export default CouponForm;
