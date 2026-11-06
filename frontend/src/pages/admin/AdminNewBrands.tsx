import { PiArrowsMergeBold, PiCheckBold, PiImageBold } from "react-icons/pi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collectionsList } from "../../../firebaseCollections";
import { getCouponsBrands } from "../../database/databaseCalls";
import { adminSetCouponsBrand } from "../../database/coupons";
import { uploadBrandLogo } from "../../database/brands";
import { BrandImage } from "../coupons/components/CouponCard";
import { refreshCouponQueries } from "../../logic/refreshCouponQueries";
import { findNewBrands, NewBrand } from "../../logic/newBrands";
import { CouponBrand } from "../../types/CouponBrandType";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import SearchSelect from "../../components/ui/SearchSelect";
import useCouponFeed from "../../hooks/useCouponFeed";
import { AdminLayout } from "./components/AdminSidebar";
import Modal from "../../components/Modal/Modal";
import { storePath } from "../../logic/stores";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const MAX_LOGO = 5 * 1024 * 1024; // storage.rules allows images under 5 MB

const brandLabel = (brand: CouponBrand) => brand.brand;
const brandIcon = (brand: CouponBrand, size: "sm" | "md") => (
  <BrandImage name={brand.brand} src={brand.imgURL} className={size === "sm" ? "size-7" : "size-8"} />
);

// Brands people typed in when sharing a coupon (not in the Brands list yet). For each one the admin
// adds a logo (which also adds it to the Brands list) or merges it into an existing brand (typos).
const AdminNewBrands = () => {
  const queryClient = useQueryClient();
  const brands = useQuery({ queryKey: ["brands"], queryFn: getCouponsBrands });
  const store = useCouponFeed(collectionsList.coupons);
  const [busy, setBusy] = useState<string | null>(null);
  const [merging, setMerging] = useState<NewBrand | null>(null);
  const [mergeInto, setMergeInto] = useState<CouponBrand | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadFor = useRef<NewBrand | null>(null);

  const list = brands.data && store.data ? findNewBrands(store.data, brands.data) : [];

  const done = () => {
    refreshCouponQueries(queryClient);
    queryClient.invalidateQueries({ queryKey: ["brands"] });
  };

  const run = async (
    brand: NewBrand,
    work: () => Promise<unknown>,
    messages: { loading: string; success: string; error: string }
  ) => {
    setBusy(brand.name);
    try {
      await toast.promise(work(), messages);
      done();
      return true;
    } catch {
      return false;
    } finally {
      setBusy(null);
    }
  };

  const pickLogo = (brand: NewBrand) => {
    uploadFor.current = brand;
    fileInput.current?.click();
  };

  const onLogoChosen = async (file: File | undefined) => {
    const brand = uploadFor.current;
    if (fileInput.current) fileInput.current.value = "";
    if (!brand || !file) return;
    if (!file.type.startsWith("image/") || file.size >= MAX_LOGO) {
      toast.error("Choose an image under 5 MB");
      return;
    }
    await run(
      brand,
      async () => {
        const url = await uploadBrandLogo(file, brand.name);
        await adminSetCouponsBrand(brand.coupons, brand.name, url);
      },
      {
        loading: `Adding the ${brand.name} logo...`,
        success: `${brand.name} added to the brands list`,
        error: "Couldn't add the logo",
      }
    );
  };

  const applyLogo = (brand: NewBrand) =>
    brand.logo &&
    run(brand, () => adminSetCouponsBrand(brand.coupons, brand.logo!.brand, brand.logo!.imgURL), {
      loading: "Updating coupons...",
      success: `${brand.name} coupons now show the logo`,
      error: "Couldn't update the coupons",
    });

  const merge = async () => {
    if (!merging || !mergeInto) return;
    const ok = await run(merging, () => adminSetCouponsBrand(merging.coupons, mergeInto.brand, mergeInto.imgURL), {
      loading: "Moving coupons...",
      success: `Moved to ${mergeInto.brand}`,
      error: "Couldn't move the coupons",
    });
    if (ok) {
      setMerging(null);
      setMergeInto(null);
    }
  };

  const loading = brands.isPending || store.isPending;
  const failed = brands.isError || store.isError;

  return (
    <AdminLayout
      title="New brands"
      description="Brands people added when they shared a coupon. Their coupons are already live and show the first letter instead of a logo. Add a logo, or merge a misspelled one into a brand you already have."
    >
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onLogoChosen(e.target.files?.[0])}
      />
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-20 rounded-box" />
          ))}
        </div>
      ) : failed ? (
        <LoadError
          what="new brands"
          onRetry={() => {
            brands.refetch();
            store.refetch();
          }}
        />
      ) : list.length === 0 ? (
        <EmptyState title="No new brands" description="Every store coupon uses a brand from your list. New ones show up here." />
      ) : (
        <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
          {list.map((brand) => {
            const working = busy === brand.name;
            return (
              <li key={brand.name} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <BrandImage name={brand.name} src={brand.logo?.imgURL} className="size-12" />
                  <div className="min-w-0">
                    <Link to={storePath(brand.name)} className="block truncate font-display text-lg font-black hover:underline">
                      {brand.name}
                    </Link>
                    <p className="text-sm text-base-content/60">
                      {brand.coupons.length === 1 ? "1 coupon" : `${brand.coupons.length} coupons`}
                      {brand.logo ? " without the logo" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {brand.logo ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm h-10 min-h-10 px-4"
                      disabled={working}
                      onClick={() => applyLogo(brand)}
                    >
                      {working ? (
                        <span className="loading loading-spinner loading-xs" aria-hidden />
                      ) : (
                        <PiCheckBold aria-hidden />
                      )}
                      Use logo
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm h-10 min-h-10 px-4"
                        disabled={working}
                        onClick={() => pickLogo(brand)}
                      >
                        {working ? (
                          <span className="loading loading-spinner loading-xs" aria-hidden />
                        ) : (
                          <PiImageBold aria-hidden />
                        )}
                        Add logo
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm h-10 min-h-10 px-4"
                        disabled={working}
                        onClick={() => {
                          setMergeInto(null);
                          setMerging(brand);
                        }}
                      >
                        <PiArrowsMergeBold aria-hidden />
                        Merge
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        isOpen={!!merging}
        onClose={() => setMerging(null)}
        title={`Merge ${merging?.name ?? ""}`}
        description={`Move its ${merging?.coupons.length === 1 ? "coupon" : `${merging?.coupons.length ?? 0} coupons`} to a brand you already have. Use this when the name is misspelled.`}
        footer={
          <>
            <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={() => setMerging(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary h-12 min-h-12"
              onClick={merge}
              disabled={!mergeInto || busy !== null}
            >
              {busy !== null && <span className="loading loading-spinner loading-sm" aria-hidden />}
              Merge
            </button>
          </>
        }
      >
        {/* Room below the field, so the brand list opens inside the dialog. */}
        <div className="min-h-80">
          <label htmlFor="merge-into" className="field-label">
            Into brand
          </label>
          <SearchSelect
            id="merge-into"
            options={brands.data ?? []}
            value={mergeInto}
            getLabel={brandLabel}
            renderIcon={brandIcon}
            placeholder="Type a brand name"
            labelClassName="capitalize"
            onChange={setMergeInto}
          />
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminNewBrands;
