import { categoryPath, groupStores, monthLabel, relatedStores, storeDescription, storeSlug } from "../../logic/stores";
import StoreTiles from "../../components/stores/StoreTiles";
import { BrandImage } from "../coupons/components/CouponCard";
import CouponGrid from "../../components/coupons/CouponGrid";
import { isExpired } from "../../logic/couponFilters";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useStoreCoupons, useStoresInCategories } from "../../hooks/useStores";
import usePageMeta from "../../hooks/usePageMeta";
import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";

// One store: /store/:storeSlug. Working codes first, expired ones in their own section below,
// then similar stores. The couponPreview Cloud Function sends search engines the same content.
const StorePage = () => {
  const { storeSlug: param = "" } = useParams<{ storeSlug: string }>();
  const slug = storeSlug(param);
  // Only this store's coupons, and only the stores that share a category with it.
  const { data: coupons = [], isPending: loadingCoupons, isError, refetch } = useStoreCoupons(slug);
  const isPending = !!slug && loadingCoupons;

  const store = useMemo(() => groupStores(coupons).find((s) => s.slug === slug), [coupons, slug]);
  const { data: nearby = [] } = useStoresInCategories(store?.categories ?? []);
  const now = Date.now();
  const active = store?.coupons.filter((coupon) => !isExpired(coupon, now)) ?? [];
  const expired = store?.coupons.filter((coupon) => isExpired(coupon, now)) ?? [];
  const related = store ? relatedStores(store, nearby) : [];

  const title = store ? `${store.name} coupon codes, ${monthLabel()}` : "";
  usePageMeta(
    store
      ? { title, description: storeDescription(store), image: store.imgUrl || undefined }
      : isPending
        ? null
        : { title: "Store not found" }
  );

  if (!isPending && !isError && !store) {
    return (
      <section className="page-container py-10">
        <EmptyState
          title="No coupons for this store yet"
          description="Know a code that works here? Share it and be the first."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/addcoupon" className="btn btn-primary">
                Share a coupon
              </Link>
              <Link to="/stores" className="btn btn-secondary">
                All stores
              </Link>
            </div>
          }
        />
      </section>
    );
  }

  return (
    <>
      <PageHeader
        title={store ? title : <span className="skeleton inline-block h-14 w-72 max-w-full rounded-box" />}
        description={store ? storeDescription(store) : undefined}
        aside={store && <BrandImage name={store.name} src={store.imgUrl} className="size-24 md:size-28" />}
      >
        {store && store.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {store.categories.map((category) => (
              <Link key={category} to={categoryPath(category)} className="btn btn-sm h-10 min-h-10 max-w-full rounded-btn border-base-300 bg-base-200">
                <span className="truncate">More {category} coupons</span>
              </Link>
            ))}
          </div>
        )}
      </PageHeader>

      <section className="page-container py-8">
        <h2 className="sr-only">Working codes</h2>
        <CouponGrid
          coupons={active}
          isLoading={isPending}
          isError={isError}
          onRetry={() => refetch()}
          emptyTitle={`No working ${store?.name ?? ""} codes right now`}
          emptyDescription={expired.length > 0 ? "Expired codes are below. Some stores accept old codes, so they may be worth a try." : undefined}
          emptyAction={
            <Link to="/addcoupon" className="btn btn-primary">
              Share a coupon
            </Link>
          }
        />
      </section>

      {expired.length > 0 && (
        <section className="page-container pb-12">
          <div className="perf-x mb-10 w-full text-base-300" aria-hidden="true" />
          <h2 className="mb-2 text-4xl font-extrabold leading-[1] tracking-tight md:text-5xl">Expired codes</h2>
          <p className="mb-8 text-base-content/70">These have passed their end date. They're here for reference.</p>
          <div className="opacity-75">
            <CouponGrid coupons={expired} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="page-container pb-20">
          <div className="perf-x mb-10 w-full text-base-300" aria-hidden="true" />
          <h2 className="mb-8 text-4xl font-extrabold leading-[1] tracking-tight md:text-5xl">Similar stores</h2>
          <StoreTiles stores={related} />
        </section>
      )}
    </>
  );
};

export default StorePage;
