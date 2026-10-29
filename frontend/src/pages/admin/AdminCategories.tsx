import { addCategory, CategoryDoc, deleteCategory, getCategoryDocs } from "../../database/categories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collectionsList } from "../../../firebaseCollections";
import { PiPlusBold, PiTrashBold } from "react-icons/pi";
import LoadError from "../../components/ui/LoadError";
import useCouponFeed from "../../hooks/useCouponFeed";
import { AdminLayout } from "./components/AdminSidebar";
import Modal from "../../components/Modal/Modal";
import Field from "../../components/ui/Field";
import toast from "react-hot-toast";
import { useState } from "react";

// Add categories, and delete ones no coupon uses (a coupon's category is stored by name, so deleting
// a used one would leave those coupons pointing at nothing).
const AdminCategories = () => {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ["categoryDocs"], queryFn: getCategoryDocs });
  const store = useCouponFeed(collectionsList.coupons);
  const social = useCouponFeed(collectionsList.socialCoupons);
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<CategoryDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  const usage = [...(store.data ?? []), ...(social.data ?? [])].reduce<Record<string, number>>((counts, coupon) => {
    const key = coupon.category?.toLowerCase() ?? "";
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
  const countsReady = !store.isPending && !social.isPending && !store.isError && !social.isError;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["categoryDocs"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim().toLowerCase().replace(/\s+/g, " ");
    if (!/^[a-z0-9][a-z0-9 &-]{1,29}$/.test(clean)) {
      setError("Use 2 to 30 letters, numbers, spaces, - or &");
      return;
    }
    if (categories.data?.some((c) => c.category.toLowerCase() === clean)) {
      setError(`"${clean}" already exists`);
      return;
    }
    setAdding(true);
    try {
      await addCategory(clean);
      toast.success(`Added ${clean}`);
      setName("");
      refresh();
    } catch {
      toast.error("Couldn't add the category");
    } finally {
      setAdding(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(toDelete.id);
      toast.success(`Deleted ${toDelete.category}`);
      setToDelete(null);
      refresh();
    } catch {
      toast.error("Couldn't delete the category");
    } finally {
      setDeleting(false);
    }
  };

  const sorted = [...(categories.data ?? [])].sort((a, b) => a.category.localeCompare(b.category));

  return (
    <AdminLayout title="Categories" description="Categories people choose when they share a coupon. A category can only be deleted when no coupon uses it.">
      <form onSubmit={add} className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start" noValidate>
        <Field label="New category" htmlFor="new-category" error={error} className="flex-1">
          <input
            id="new-category"
            className="input input-bordered h-12 w-full bg-base-100"
            placeholder="e.g. electronics"
            value={name}
            aria-invalid={!!error}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
          />
        </Field>
        <button type="submit" className="btn btn-primary h-12 min-h-12 px-6 sm:mt-7" disabled={adding}>
          {adding ? <span className="loading loading-spinner loading-sm" aria-hidden /> : <PiPlusBold aria-hidden />}
          Add category
        </button>
      </form>

      <div className="mt-10">
        {categories.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="skeleton h-16 rounded-box" />
            ))}
          </div>
        ) : categories.isError ? (
          <LoadError what="categories" onRetry={() => categories.refetch()} />
        ) : (
          <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
            {sorted.map((category) => {
              const count = usage[category.category.toLowerCase()] ?? 0;
              const inUse = !countsReady || count > 0;
              return (
                <li key={category.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="font-display text-lg font-extrabold capitalize">{category.category}</p>
                    <p className="text-sm text-base-content/60">
                      {!countsReady ? "Counting coupons..." : count === 1 ? "1 coupon" : `${count} coupons`}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm h-10 min-h-10 px-3 text-error disabled:bg-transparent"
                    onClick={() => setToDelete(category)}
                    disabled={inUse}
                    title={inUse ? "Move or delete its coupons first" : undefined}
                    aria-label={`Delete ${category.category}`}
                  >
                    <PiTrashBold className="size-4" aria-hidden />
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete ${toDelete?.category ?? ""}?`}
        description="People won't be able to choose it anymore. No coupons use it."
        footer={
          <>
            <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={() => setToDelete(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-error h-12 min-h-12" onClick={remove} disabled={deleting}>
              {deleting && <span className="loading loading-spinner loading-sm" aria-hidden />}
              Delete category
            </button>
          </>
        }
      >
        {null}
      </Modal>
    </AdminLayout>
  );
};

export default AdminCategories;
