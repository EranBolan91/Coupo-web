import { PiDownloadSimpleBold, PiTrashBold, PiUploadSimpleBold } from "react-icons/pi";
import { checkImport, couponKey, IMPORT_COLUMNS, IMPORT_TEMPLATE } from "../../logic/bulkCoupons";
import { getCategories, getCouponsBrands } from "../../database/databaseCalls";
import { deleteCoupons, publishCoupons } from "../../database/bulkCoupons";
import { refreshCouponQueries } from "../../logic/refreshCouponQueries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collectionsList } from "../../../firebaseCollections";
import LoadError from "../../components/ui/LoadError";
import useCouponFeed from "../../hooks/useCouponFeed";
import { AdminLayout } from "./components/AdminSidebar";
import Modal from "../../components/Modal/Modal";
import Field from "../../components/ui/Field";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

// Paste or upload a CSV of coupons, check every row, then publish the good ones as Coupo coupons.
const AdminImport = () => {
  const queryClient = useQueryClient();
  const brands = useQuery({ queryKey: ["brands"], queryFn: getCouponsBrands });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const feed = useCouponFeed(collectionsList.coupons);
  const [text, setText] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const ready = brands.data && categories.data && feed.data;
  const result = useMemo(() => {
    if (!ready || !text.trim()) return undefined;
    return checkImport(text, {
      brands: new Map(brands.data.map((b) => [String(b.brand).toLowerCase(), b.imgURL])),
      categories: new Map(categories.data.map((c) => [c.toLowerCase(), c])),
      existing: new Set(feed.data.map((c) => couponKey(c.name ?? "", c.code ?? ""))),
      today: localToday(),
    });
  }, [ready, text, brands.data, categories.data, feed.data]);

  const good = result?.rows.flatMap((row) => (row.coupon ? [row.coupon] : [])) ?? [];
  const skipped = (result?.rows.length ?? 0) - good.length;
  // Made-up coupons added by scripts/addCoupons.js with "sample": true.
  const demoIds = (feed.data ?? []).filter((c) => (c as { sample?: boolean }).sample === true).map((c) => c.id);

  const readFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 1_000_000) {
      toast.error("That file is too big. Keep it under 1 MB");
      return;
    }
    setText(await file.text());
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([IMPORT_TEMPLATE + "\n"], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "coupo-coupons.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const publish = async () => {
    setPublishing(true);
    try {
      await publishCoupons(good);
      toast.success(good.length === 1 ? "Published 1 coupon" : `Published ${good.length} coupons`);
      setText("");
    } catch {
      toast.error("Couldn't publish the coupons. Check the Coupons page before trying again");
    } finally {
      refreshCouponQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ["latestCoupons"] });
      setPublishing(false);
    }
  };

  const removeDemo = async () => {
    setRemoving(true);
    try {
      await deleteCoupons(demoIds);
      toast.success(`Removed ${demoIds.length} demo coupons`);
      setConfirmRemove(false);
    } catch {
      toast.error("Couldn't remove the demo coupons");
    } finally {
      refreshCouponQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ["latestCoupons"] });
      setRemoving(false);
    }
  };

  const loadError = brands.isError || categories.isError || feed.isError;

  return (
    <AdminLayout
      title="Import coupons"
      description="Add many coupons at once from a spreadsheet. They're published by Coupo, like coupons from the Add coupon page."
    >
      {loadError ? (
        <LoadError
          what="brands and categories"
          onRetry={() => [brands, categories, feed].forEach((q) => q.isError && q.refetch())}
        />
      ) : (
        <div className="space-y-8">
          <div className="max-w-3xl space-y-3 text-base-content/70">
            <p>
              Paste rows from a spreadsheet or a CSV file. The first line names the columns:{" "}
              <span className="font-mono text-sm text-base-content">{IMPORT_COLUMNS.join(", ")}</span>. The first five are
              required. Expiry can be 2026-12-31 or 31/12/2026, and usableAt is online, in-store or both.
            </p>
            <p>Only publish codes a store has made public, and check that they still work.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="btn btn-secondary h-12 min-h-12 px-5">
              <PiUploadSimpleBold aria-hidden />
              Choose a CSV file
              <input
                type="file"
                accept=".csv,.tsv,.txt,text/csv,text/plain"
                className="sr-only"
                onChange={(e) => {
                  readFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <button type="button" className="btn btn-ghost h-12 min-h-12 border-base-300 bg-base-100 px-5" onClick={downloadTemplate}>
              <PiDownloadSimpleBold aria-hidden />
              Download template
            </button>
          </div>

          <Field label="Coupons" htmlFor="import-text" error={result?.error}>
            <textarea
              id="import-text"
              className="textarea textarea-bordered min-h-48 w-full bg-base-100 font-mono text-sm"
              placeholder={IMPORT_TEMPLATE}
              value={text}
              spellCheck={false}
              aria-invalid={!!result?.error}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>

          {text.trim() && !ready && <div className="skeleton h-24 rounded-box" />}

          {result && result.rows.length > 0 && (
            <section aria-labelledby="import-check" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="import-check" className="text-2xl">
                  {good.length} ready
                  {skipped > 0 && <span className="text-base-content/60">, {skipped} skipped</span>}
                </h2>
                <button type="button" className="btn btn-primary h-12 min-h-12 px-6" onClick={publish} disabled={publishing || good.length === 0}>
                  {publishing && <span className="loading loading-spinner loading-sm" aria-hidden />}
                  {good.length === 1 ? "Publish 1 coupon" : `Publish ${good.length} coupons`}
                </button>
              </div>
              <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Line</th>
                      <th>Brand</th>
                      <th>Code</th>
                      <th>Off</th>
                      <th>Expires</th>
                      <th>Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.line}>
                        <td className="text-base-content/60">{row.line}</td>
                        <td className="font-bold capitalize">{row.brand}</td>
                        <td className="font-mono">{row.code}</td>
                        <td>{row.discount}</td>
                        <td className="whitespace-nowrap">{row.expiry}</td>
                        <td className="min-w-56">
                          {row.problems.length > 0 ? (
                            <span className="text-error">Skipped: {row.problems.join(". ")}</span>
                          ) : (
                            <span className="font-bold text-accent">Ready</span>
                          )}
                          {row.notes.map((note) => (
                            <span key={note} className="block text-sm text-base-content/60">
                              {note}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {demoIds.length > 0 && (
            <section className="max-w-3xl rounded-box border border-base-300 bg-base-100 p-6">
              <h2 className="text-2xl">Demo coupons</h2>
              <p className="mt-2 text-base-content/70">
                {demoIds.length} coupons on Coupo have made-up codes for testing. Remove them once real coupons are in, so nobody
                copies a code that doesn't work.
              </p>
              <button type="button" className="btn btn-ghost mt-4 h-12 min-h-12 border-base-300 px-5 text-error" onClick={() => setConfirmRemove(true)}>
                <PiTrashBold aria-hidden />
                Remove demo coupons
              </button>
            </section>
          )}
        </div>
      )}

      <Modal
        isOpen={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title={`Remove ${demoIds.length} demo coupons?`}
        description="They're deleted from Coupo for good, along with their likes."
        footer={
          <>
            <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={() => setConfirmRemove(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-error h-12 min-h-12" onClick={removeDemo} disabled={removing}>
              {removing && <span className="loading loading-spinner loading-sm" aria-hidden />}
              Remove demo coupons
            </button>
          </>
        }
      >
        {null}
      </Modal>
    </AdminLayout>
  );
};

export default AdminImport;
