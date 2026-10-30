import { getCategories, updateCoupon } from "../../../database/databaseCalls";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import Modal from "../../../components/Modal/Modal";
import Field from "../../../components/ui/Field";
import { Coupon } from "../../../types/CouponType";
import { useQuery } from "@tanstack/react-query";
import { PiPencilSimpleBold } from "react-icons/pi";
import toast from "react-hot-toast";
import { useState } from "react";
import CouponTermsFields from "../../../components/coupons/CouponTermsFields";
import { cleanTerms, termsError, termsOf } from "../../../logic/couponTerms";

interface Props {
  coupon: Coupon;
  index: number;
  refetchData: () => void;
}

// Owner edits category, discount and description. The Cloud Function copies the change to the public coupon.
const ModalEditCoupon = ({ coupon, refetchData }: Props) => {
  const [discount, setDiscount] = useState<string>(String(coupon.discount));
  const [description, setDescription] = useState<string>(coupon.description ?? "");
  const [category, setCategory] = useState<string>(coupon.category);
  const [terms, setTerms] = useState(() => termsOf(coupon));
  const [open, setOpen] = useState<boolean>(false);
  const userDocument = useCurrentUser();

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories, enabled: open });

  const discountNumber = Number(discount);
  const discountError =
    discount === "" || !Number.isInteger(discountNumber) || discountNumber < 1 || discountNumber > 100
      ? "Enter a whole number from 1 to 100"
      : undefined;

  const save = () => {
    if (discountError || termsError(terms)) return;
    setOpen(false);
    toast
      .promise(updateCoupon(category, discountNumber, description, coupon.id, userDocument?.userUID ?? "", coupon.type, cleanTerms(terms)), {
        loading: "Saving changes...",
        success: "Coupon updated",
        error: "Couldn't update the coupon",
      })
      .then(() => refetchData())
      .catch(() => {});
  };

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm h-10 min-h-10 px-3" onClick={() => setOpen(true)}>
        <PiPencilSimpleBold className="size-4" aria-hidden />
        Edit
      </button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`Edit ${coupon.name}`}
        description={
          <>
            Code <span className="font-mono font-bold text-base-content">{coupon.code}</span>
          </>
        }
        footer={
          <>
            <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary h-12 min-h-12" onClick={save} disabled={!!discountError || !!termsError(terms)}>
              Save changes
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor={`category-${coupon.id}`}>
              <select
                id={`category-${coupon.id}`}
                className="select select-bordered h-12 w-full bg-base-100 capitalize"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {!categories.includes(category) && <option value={category}>{category}</option>}
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Discount (%)" htmlFor={`discount-${coupon.id}`} error={discountError}>
              <input
                id={`discount-${coupon.id}`}
                type="number"
                min={1}
                max={100}
                inputMode="numeric"
                className="input input-bordered h-12 w-full bg-base-100"
                value={discount}
                aria-invalid={!!discountError}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </Field>
          </div>
          <CouponTermsFields idPrefix={`edit-${coupon.id}`} value={terms} onChange={setTerms} />
          <Field label="Description" htmlFor={`description-${coupon.id}`} hint="Optional. Anything else people should know.">
            <textarea
              id={`description-${coupon.id}`}
              rows={3}
              className="textarea textarea-bordered w-full bg-base-100 text-base"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
};

export default ModalEditCoupon;
