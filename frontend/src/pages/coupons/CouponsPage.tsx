import { getPaginatedCoupons } from "../../database/databaseCalls";
import { initFilters } from "../../redux/reducers/filterReducer";
import FilterChip from "../../components/filterChip/FilterChip";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../main/components/Searchbar";
import { useEffect, useMemo, useState } from "react";
import Filter from "../../components/filter/Filter";
import { RootState } from "../../redux/store/store";
import { useSearchParams } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce";
import CouponGrid from "../../components/coupons/CouponGrid";
import PageHeader from "../../components/ui/PageHeader";
import { Coupon } from "../../types/CouponType";

const CouponsPage = () => {
  const filters = useSelector((state: RootState) => state.filters);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState("date-desc");
  const debounceSearch = useDebounce(searchQuery, 700);
  const [searchParams] = useSearchParams();
  const { ref, inView } = useInView();
  const dispatch = useDispatch();

  const handleCouponsFilter = (text: string) => setSearchQuery(text);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["coupons", debounceSearch],
    queryFn: ({ pageParam = null }: { pageParam?: number[] | null }) => getPaginatedCoupons(debounceSearch, pageParam),
    initialPageParam: null,
    staleTime: 2000,
    getNextPageParam: (lastPage) => {
      return lastPage ? [lastPage?.length - 1] : undefined;
    },
  });

  const filteredItems = useMemo(() => {
    if (!data?.pages) return [];

    const coupons: Coupon[] = data?.pages.flatMap((coupon) => coupon || []);

    const filteredCoupons = coupons.filter((coupon: Coupon) => {
      const matchesCategory = Object.values(filters).every(
        (filterArray) => filterArray.length === 0 || filterArray.includes(coupon.category)
      );
      const matchesSearch = !searchQuery || coupon.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    const sortedCoupons = [...filteredCoupons].sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.expiry.toDate()).getTime() - new Date(a.expiry.toDate()).getTime();
        case "date-asc":
          return new Date(a.expiry.toDate()).getTime() - new Date(b.expiry.toDate()).getTime();
        case "discount-desc":
          return Number(b.discount) - Number(a.discount);
        case "discount-asc":
          return Number(a.discount) - Number(b.discount);
        case "brand-asc":
          return a.name?.localeCompare(b.name ?? "") ?? 0;
        case "brand-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    return sortedCoupons;
  }, [data?.pages, filters, debounceSearch, sortOption]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, debounceSearch, searchParams]);

  useEffect(() => {
    const filters: { [key: string]: string[] } = {};
    searchParams.forEach((value, key) => {
      if (!filters[key]) {
        filters[key] = [];
      }
      filters[key].push(value);
    });
    dispatch(initFilters(filters));
  }, []);

  return (
    <>
      <PageHeader title="Coupons" description="Codes shared by the Coupo community. Copy one, then vote on whether it worked.">
        <SearchBar filter={handleCouponsFilter} />
      </PageHeader>

      <section className="page-container py-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Filter />
          <label className="flex items-center gap-2 text-sm font-medium">
            <span className="shrink-0 text-base-content/70">Sort by</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="select select-bordered select-sm w-full bg-base-100 py-0 sm:w-56"
            >
              <option value="date-desc">Expires latest</option>
              <option value="date-asc">Expires soonest</option>
              <option value="discount-desc">Biggest discount</option>
              <option value="discount-asc">Smallest discount</option>
              <option value="brand-asc">Brand (A-Z)</option>
              <option value="brand-desc">Brand (Z-A)</option>
            </select>
          </label>
        </div>
        <FilterChip />
        <div className="mt-6">
          <CouponGrid
            coupons={filteredItems}
            isLoading={isLoading}
            isFetchingMore={isFetchingNextPage}
            lastItemRef={ref}
            emptyTitle={searchQuery ? "No coupons match your search" : "No coupons yet"}
            emptyDescription={
              searchQuery ? "Try another brand name, or clear the filters." : "Be the first to share one."
            }
          />
        </div>
      </section>
    </>
  );
};

export default CouponsPage;
