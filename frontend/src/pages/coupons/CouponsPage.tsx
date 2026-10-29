import { brandsInFeed, couponSortOptions, CouponSort, filterCoupons, sortCoupons } from "../../logic/couponFilters";
import ExpiredToggle from "../../components/filter/ExpiredToggle";
import { collectionsList } from "../../../firebaseCollections";
import FilterChip from "../../components/filterChip/FilterChip";
import CouponGrid from "../../components/coupons/CouponGrid";
import useCouponSearch from "../../hooks/useCouponSearch";
import PageHeader from "../../components/ui/PageHeader";
import useCouponFeed from "../../hooks/useCouponFeed";
import SearchBar from "../main/components/Searchbar";
import useShowMore from "../../hooks/useShowMore";
import Filter from "../../components/filter/Filter";
import { useMemo } from "react";

const CouponsPage = () => {
  const couponSearch = useCouponSearch();
  const { search, sort, filters, activeFilterCount, resultsKey, setSearch, setSort, setShowExpired } = couponSearch;

  const { data: coupons = [], isPending: isLoading, isError, refetch } = useCouponFeed(collectionsList.coupons);
  const brands = useMemo(() => brandsInFeed(coupons), [coupons]);

  // Search, filters and sort apply to every coupon, not only the ones on screen.
  // Expired coupons are hidden unless "Show expired" is on.
  const { results, expiredCount } = useMemo(() => {
    const filtered = filterCoupons(coupons, search, filters);
    return { ...filtered, results: sortCoupons(filtered.results, sort) };
  }, [coupons, search, filters, sort]);
  const onlyExpired = results.length === 0 && expiredCount > 0 && !filters.showExpired;

  const { visible, lastItemRef } = useShowMore(results, resultsKey);

  const filtering = search.trim() !== "" || activeFilterCount > 0;

  return (
    <>
      <PageHeader title="Coupons" description="Codes shared by the Coupo community. Copy one, then vote on whether it worked.">
        <SearchBar filter={setSearch} value={search} placeholder="Search by brand, code or category" />
      </PageHeader>

      <section className="page-container py-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Filter search={couponSearch} brands={brands} />
            <ExpiredToggle checked={filters.showExpired} onChange={setShowExpired} expiredCount={expiredCount} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <span className="shrink-0 text-base-content/70">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as CouponSort)}
              className="select select-bordered select-sm w-full bg-base-100 py-0 sm:w-56"
            >
              {couponSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <FilterChip search={couponSearch} />
        {!isLoading && !isError && filtering && results.length > 0 && (
          <p className="mt-4 text-sm text-base-content/70" aria-live="polite">
            {results.length === 1 ? "1 coupon" : `${results.length} coupons`}
          </p>
        )}
        <div className="mt-6">
          <CouponGrid
            coupons={visible}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            lastItemRef={lastItemRef}
            emptyTitle={onlyExpired ? "No active coupons" : filtering ? "No coupons match your search" : "No coupons yet"}
            emptyDescription={
              onlyExpired
                ? `${expiredCount === 1 ? "1 expired coupon is" : `${expiredCount} expired coupons are`} hidden.`
                : filtering
                  ? "Try another word, or clear the filters."
                  : "Be the first to share one."
            }
            emptyAction={
              onlyExpired && (
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpired(true)}>
                  Show expired coupons
                </button>
              )
            }
          />
        </div>
      </section>
    </>
  );
};

export default CouponsPage;
