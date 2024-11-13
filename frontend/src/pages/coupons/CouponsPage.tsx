import { getPaginatedCoupons } from "../../database/databaseCalls";
import { initFilters } from "../../redux/reducers/filterReducer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../main/components/Searchbar";
import { useEffect, useMemo, useState } from "react";
import { RootState } from "../../redux/store/store";
import { useSearchParams } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce";
import FilterChip from "../FilterChip/FilterChip";
import CouponCard from "./components/CouponCard";
import { Coupon } from "../../types/Types";
import Filter from "../Filter/Filter";

const CouponsPage = () => {
  const filters = useSelector((state: RootState) => state.filters);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState("date-desc");
  const debounceSearch = useDebounce(searchQuery, 700);
  const [searchParams] = useSearchParams();
  const { ref, inView } = useInView();
  const dispatch = useDispatch();

  const handleCouponsFilter = (text: string) => setSearchQuery(text);

  const { data, hasNextPage, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["coupons", debounceSearch],
    queryFn: ({ pageParam = null }: { pageParam?: number[] | null }) =>
      getPaginatedCoupons(debounceSearch, pageParam),
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
      const matchesSearch =
        !searchQuery || coupon.name.toLowerCase().includes(searchQuery.toLowerCase());

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
    <div className="flex flex-col items-center justify-center py-3">
      <div className="flex flex-col items-center justify-center bg-slate-800 w-full p-4 md:p-28">
        <h2 className="text-2xl md:text-7xl text-primary mb-6 md:mb-20">
          Save upto 50% online now
        </h2>
        <SearchBar filter={handleCouponsFilter} />
      </div>

      <div className="w-3/4 flex-col md:flex-row md:w-full mx-auto mt-6 flex justify-between items-start">
        <Filter />
        <div className="flex">
          <span className="flex items-center w-20">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="select select-bordered w-full max-w-xs"
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="discount-desc">Discount (Highest First)</option>
            <option value="discount-asc">Discount (Lowest First)</option>
            <option value="brand-asc">Brand (A-Z)</option>
            <option value="brand-desc">Brand (Z-A)</option>
          </select>
        </div>
      </div>
      <FilterChip />
      {isLoading === true ? (
        <span className="loading loading-spinner loading-lg ml-2"></span>
      ) : (
        <div className="grid grid-rows-1 md:grid-cols-12 lg:grid-cols-12 gap-y-10 md:gap-10 justify-center items-center mt-11 justify-items-center">
          {filteredItems &&
            filteredItems.map((coupon: Coupon, index: number) => {
              if (index === filteredItems.length - 1) {
                return (
                  <div key={index} className="flex justify-center col-span-12 md:col-span-4 w-full">
                    <CouponCard innerRef={ref} coupon={coupon} key={index} />
                  </div>
                );
              } else {
                return (
                  <div key={index} className="flex justify-center col-span-12 md:col-span-4 w-full">
                    <CouponCard coupon={coupon} key={index} />
                  </div>
                );
              }
            })}
          {/* {filteredItems.map((item: Coupon) => (
            <span>
              {item.name} : {item.category}
            </span>
          ))} */}
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
