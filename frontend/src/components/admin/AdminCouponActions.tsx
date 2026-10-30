import { adminDeleteCoupon, adminUpdateCoupon } from "../../database/coupons";
import { PiPencilSimpleBold, PiTrashBold } from "react-icons/pi";
import { getCategories } from "../../database/databaseCalls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dismissReports } from "../../database/reports";
import { refreshCouponQueries } from "../../logic/refreshCouponQueries";
import { Coupon } from "../../types/CouponType";
import { Timestamp } from "firebase/firestore";
import Modal from "../Modal/Modal";
import Field from "../ui/Field";
import toast from "react-hot-toast";
import { useState } from "react";
import CouponTermsFields from "../coupons/CouponTermsFields";
import { cleanTerms, termsError, termsOf } from "../../logic/couponTerms";

const toDateInput = (expiry?: Timestamp) => {
  const date = expiry?.toDate?.();
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

interface Props {
  coupon: Coupon;
  // Called after the coupon is deleted (e.g. leave its page).
  onDeleted?: () => void;
  size?: "sm" | "md";
}

// Admin-only Edit / Delete for any coupon, including users' coupons (their profile copy changes too).
const AdminCouponActions = ({ coupon, onDeleted, size = "md" }: Props) => {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState(coupon.code);
  const [category, setCategory] = useState(coupon.category);
  const [discount, setDiscount] = useState(String(coupon.discount));
  const [expiry, setExpiry] = useState(toDateInput(coupon.expiry));
  const [description, setDescription] = useState(coupon.description ?? "");
  const [terms, setTerms] = useState(() => termsOf(coupon));

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories, enabled: editOpen });

  const openEdit = () => {
    setCode(coupon.code);
    setCategory(coupon.category);
    setDiscount(String(coupon.discount));
    setExpiry(toDateInput(coupon.expiry));
    setDescription(coupon.description ?? "");
    setTerms(termsOf(coupon));
    setEditOpen(true);
  };

  const discountNumber = Number(discount);
  const errors = {
    code: code.trim() ? undefined : "Code is required",
    discount: Number.isInteger(discountNumber) && discountNumber >= 1 && discountNumber <= 100 ? undefined : "Enter a whole number from 1 to 100",
    expiry: expiry ? undefined : "Expiry date is required",
    terms: termsError(terms),
  };
  const invalid = Object.values(errors).some(Boolean);

  const save = async () => {
    if (invalid) return;
    setBusy(true);
    const [y, m, d] = expiry.split("-").map(Number);
    try {
      await adminUpdateCoupon(coupon, {
        code: code.trim().toUpperCase(),
        category,
        discount: discountNumber,
        expiry: Timestamp.fromDate(new Date(y, m - 1, d, 23, 59, 59)),
        description: description.trim(),
        ...cleanTerms(terms),
      });
      toast.success("Coupon updated");
      setEditOpen(false);
      refreshCouponQueries(queryClient);
    } catch {
      toast.error("Couldn't update the coupon");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminDeleteCoupon(coupon);
      await dismissReports(coupon.id).catch(() => {});
      toast.success(`${coupon.code} deleted`);
      setDeleteOpen(false);
      refreshCouponQueries(queryClient);
      onDeleted?.();
    } catch {
      toast.error("Couldn't delete the coupon");
    } finally {
      setBusy(false);
    }
  };

  const buttonSize = size === "sm" ? "btn-sm h-10 min-h-10 px-3" : "h-12 min-h-12 px-4";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`btn btn-ghost border-2 border-base-300 ${buttonSize}`} onClick={openEdit}>
          <PiPencilSimpleBold className="size-4" aria-hidden />
          Edit
        </button>
        <button
          type="button"
          className={`btn btn-ghost border-2 border-base-300 text-error hover:border-error hover:bg-error hover:text-error-content ${buttonSize}`}
          onClick={() => setDeleteOpen(true)}
        >
          <PiTrashBold className="size-4" aria-hidden />
          Delete
        </button>
      </div>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit ${coupon.name}`}
        description={coupon.userID ? `Shared by ${coupon.username || "a user"}. Their profile shows the change too.` : "Published by Coupo."}
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary h-12 min-h-12" onClick={save} disabled={invalid || busy}>
              {busy && <span className="loading loading-spinner loading-sm" aria-hidden />}
              Save changes
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
            <Field label="Coupon code" htmlFor={`admin-code-${coupon.id}`} error={errors.code}>
              <input
                id={`admin-code-${coupon.id}`}
                className="input input-bordered h-12 w-full bg-base-100 font-mono font-bold uppercase tracking-wider"
                value={code}
                spellCheck={false}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>
            <Field label="Discount (%)" htmlFor={`admin-discount-${coupon.id}`} error={errors.discount}>
              <input
                id={`admin-discount-${coupon.id}`}
                type="number"
                min={1}
                max={100}
                inputMode="numeric"
                className="input input-bordered h-12 w-full bg-base-100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor={`admin-category-${coupon.id}`}>
              <select
                id={`admin-category-${coupon.id}`}
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
            <Field label="Expires on" htmlFor={`admin-expiry-${coupon.id}`} error={errors.expiry}>
              <input
                id={`admin-expiry-${coupon.id}`}
                type="date"
                className="input input-bordered h-12 w-full bg-base-100"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </Field>
          </div>
          <CouponTermsFields idPrefix={`admin-${coupon.id}`} value={terms} onChange={setTerms} />
          <Field label="Details" htmlFor={`admin-description-${coupon.id}`} hint="Optional">
            <textarea
              id={`admin-description-${coupon.id}`}
              rows={3}
              className="textarea textarea-bordered w-full bg-base-100 text-base"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this coupon?"
        description={
          <>
            {coupon.name}, code <span className="font-mono font-bold text-base-content">{coupon.code}</span>.{" "}
            {coupon.userID ? "It's also removed from the profile of the person who shared it. " : ""}This can't be undone.
          </>
        }
        footer={
          <>
            <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={() => setDeleteOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-error h-12 min-h-12" onClick={remove} disabled={busy}>
              {busy && <span className="loading loading-spinner loading-sm" aria-hidden />}
              Delete coupon
            </button>
          </>
        }
      >
        {null}
      </Modal>
    </>
  );
};

export default AdminCouponActions;
