import { brandsInFeed, couponSortOptions, CouponSort, matchesFilters, matchesSearch, sortCoupons } from "../../logic/couponFilters";
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
  const { search, sort, filters, activeFilterCount, resultsKey, setSearch, setSort } = couponSearch;

  const { data: coupons = [], isPending: isLoading, isError, refetch } = useCouponFeed(collectionsList.coupons);
  const brands = useMemo(() => brandsInFeed(coupons), [coupons]);

  // Search, filters and sort apply to every coupon, not only the ones on screen.
  const results = useMemo(() => {
    const now = Date.now();
    const matching = coupons.filter((coupon) => matchesSearch(coupon, search) && matchesFilters(coupon, filters, now));
    return sortCoupons(matching, sort);
  }, [coupons, search, filters, sort]);

  const { visible, lastItemRef } = useShowMore(results, resultsKey);

  const filtering = search.trim() !== "" || activeFilterCount > 0;

  return (
    <>
      <PageHeader title="Coupons" description="Codes shared by the Coupo community. Copy one, then vote on whether it worked.">
        <SearchBar filter={setSearch} value={search} placeholder="Search by brand, code or category" />
      </PageHeader>

      <section className="page-container py-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Filter search={couponSearch} brands={brands} />
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
            emptyTitle={filtering ? "No coupons match your search" : "No coupons yet"}
            emptyDescription={filtering ? "Try another word, or clear the filters." : "Be the first to share one."}
          />
        </div>
      </section>
    </>
  );
};

export default CouponsPage;
