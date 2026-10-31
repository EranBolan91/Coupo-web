import { collectionsList } from "../../../firebaseCollections";
import ExpiredToggle from "../../components/filter/ExpiredToggle";
import CouponGrid from "../../components/coupons/CouponGrid";
import { filterCoupons } from "../../logic/couponFilters";
import PageHeader from "../../components/ui/PageHeader";
import useCouponFeed from "../../hooks/useCouponFeed";
import SearchBar from "../main/components/Searchbar";
import useShowMore from "../../hooks/useShowMore";
import useCouponSearch from "../../hooks/useCouponSearch";
import useSearchLogging from "../../hooks/useSearchLogging";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const SocialCoupons = () => {
  // The search text and "Show expired" are kept in the URL (?q=...&expired=show), like on the Coupons page.
  const { search, filters, resultsKey, setSearch, setShowExpired } = useCouponSearch();
  const { data: coupons = [], isPending: isLoading, isError, refetch } = useCouponFeed(collectionsList.socialCoupons);
  useSearchLogging("social", search, coupons, !isLoading && !isError);

  const { results, expiredCount } = useMemo(() => filterCoupons(coupons, search, filters), [coupons, search, filters]);
  const { visible, lastItemRef } = useShowMore(results, resultsKey);
  const searching = search.trim() !== "";
  const onlyExpired = results.length === 0 && expiredCount > 0 && !filters.showExpired;

  return (
    <>
      <PageHeader
        title="Social Coupons"
        description="Deals people found on social media and shared here, newest first."
      >
        <SearchBar filter={setSearch} value={search} placeholder="Search by brand, code or category" />
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
          emptyTitle={
            onlyExpired ? "No active social coupons" : searching ? "No social coupons match your search" : "No social coupons yet"
          }
          emptyDescription={
            onlyExpired
              ? `${expiredCount === 1 ? "1 expired coupon is" : `${expiredCount} expired coupons are`} hidden.`
              : searching
                ? "Try another word."
                : undefined
          }
          emptyAction={
            onlyExpired ? (
              <button type="button" className="btn btn-secondary" onClick={() => setShowExpired(true)}>
                Show expired coupons
              </button>
            ) : (
              !searching && (
                <Link to="/addcoupon" className="btn btn-primary">
                  Share a coupon
                </Link>
              )
            )
          }
        />
      </section>
    </>
  );
};

export default SocialCoupons;
