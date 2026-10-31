import { collectionsList } from "../../../firebaseCollections";
import ExpiredToggle from "../../components/filter/ExpiredToggle";
import CouponGrid from "../../components/coupons/CouponGrid";
import { filterCoupons } from "../../logic/couponFilters";
import useCouponSearch from "../../hooks/useCouponSearch";
import PageHeader from "../../components/ui/PageHeader";
import useCouponFeed from "../../hooks/useCouponFeed";
import useShowMore from "../../hooks/useShowMore";
import { Link, useParams } from "react-router-dom";
import { groupStores, monthLabel, storePath } from "../../logic/stores";
import usePageMeta from "../../hooks/usePageMeta";
import { useMemo } from "react";

const Category = () => {
  const { categoryName = "" } = useParams<{ categoryName: string }>();
  // Only "Show expired" (?expired=show) is used here; the category comes from the path.
  const { filters, setShowExpired } = useCouponSearch();
  const { data: coupons = [], isPending: isLoading, isError, refetch } = useCouponFeed(collectionsList.coupons);

  const { results, expiredCount } = useMemo(
    () =>
      filterCoupons(
        coupons.filter((coupon) => coupon.category?.toLowerCase() === categoryName.toLowerCase()),
        "",
        { categories: [], brands: [], minDiscount: 0, expiringSoon: false, showExpired: filters.showExpired }
      ),
    [coupons, categoryName, filters.showExpired]
  );
  const name = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  const stores = useMemo(
    () => groupStores(coupons.filter((coupon) => coupon.category?.toLowerCase() === categoryName.toLowerCase())),
    [coupons, categoryName]
  );
  const activeCount = stores.reduce((sum, store) => sum + store.activeCount, 0);
  // Same wording as the server-rendered page (categoryPage in seoPages.ts).
  usePageMeta(
    isLoading
      ? null
      : {
          title: `${name} coupon codes, ${monthLabel()}`,
          description:
            `${activeCount} working coupon code${activeCount === 1 ? "" : "s"} in ${categoryName.toLowerCase()} from ` +
            `${stores.length} store${stores.length === 1 ? "" : "s"}` +
            `${stores.length ? `, including ${stores.slice(0, 3).map((s) => s.name).join(", ")}` : ""}.`,
        }
  );
  const { visible, lastItemRef } = useShowMore(results, `${categoryName}|${filters.showExpired}`);
  const onlyExpired = results.length === 0 && expiredCount > 0 && !filters.showExpired;

  return (
    <>
      <PageHeader
        title={categoryName ? `${name} coupon codes` : "Category"}
        description={`Coupons in ${categoryName || "this category"}, checked by Coupo shoppers.`}
      >
        {stores.length > 0 && (
          <nav aria-label="Stores in this category" className="flex flex-wrap gap-2">
            {stores.map((store) => (
              <Link key={store.slug} to={storePath(store.name)} className="btn btn-sm h-10 min-h-10 rounded-btn border-base-300 bg-base-200">
                {store.name}
              </Link>
            ))}
          </nav>
        )}
      </PageHeader>
      <section className="page-container py-8">
        <div className="mb-6 empty:hidden">
          <ExpiredToggle checked={filters.showExpired} onChange={setShowExpired} expiredCount={expiredCount} />
        </div>
        <CouponGrid
          coupons={visible}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          lastItemRef={lastItemRef}
          emptyTitle={onlyExpired ? "No active coupons in this category" : "No coupons in this category yet"}
          emptyDescription={
            onlyExpired
              ? `${expiredCount === 1 ? "1 expired coupon is" : `${expiredCount} expired coupons are`} hidden.`
              : undefined
          }
          emptyAction={
            onlyExpired ? (
              <button type="button" className="btn btn-secondary" onClick={() => setShowExpired(true)}>
                Show expired coupons
              </button>
            ) : (
              <Link to="/addcoupon" className="btn btn-primary">
                Share a coupon
              </Link>
            )
          }
        />
      </section>
    </>
  );
};

export default Category;
