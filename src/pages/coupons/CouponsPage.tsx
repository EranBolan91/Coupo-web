import { getPaginatedCoupons } from "../../database/databaseCalls";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import SearchBar from "../main/components/Searchbar";
import useDebounce from "../../hooks/useDebounce";
import { useEffect, useState } from "react";
import { Coupon } from "../../types/Types";
import CouponCard from "./CouponCard";

const CouponsPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debounceSearch = useDebounce(searchQuery, 700);
  const { ref, inView } = useInView();
  const [sortOption, setSortOption] = useState("date-desc");

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["coupons", debounceSearch],
    queryFn: ({ pageParam = null }: { pageParam?: number[] | null }) =>
      getPaginatedCoupons(debounceSearch, pageParam),
    initialPageParam: null,
    staleTime: 2000,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => {
      const lastItem = lastPage ? [lastPage?.length - 1] : undefined;
      return lastItem;
    },
  });

  const coupons: Coupon[] = (
    data?.pages.flatMap((coupon) => coupon) || []
  ).filter((coupon): coupon is Coupon => coupon !== undefined);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, debounceSearch]);

  const handleCouponsFilter = (text: string) => setSearchQuery(text);

  const sortCoupons = (coupons: Coupon[]) => {
    return [...coupons].sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.expiry).getTime() - new Date(a.expiry).getTime();
        case "date-asc":
          return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
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
  };

  const sortedCoupons = sortCoupons(coupons);

  return (
    <div className="flex flex-col items-center justify-center py-3">
      <div className="flex flex-col items-center justify-center bg-slate-800 w-full p-4 md:p-28">
        <h2 className="text-2xl md:text-7xl text-primary mb-6 md:mb-20">
          Save upto 50% online now
        </h2>
        <SearchBar filter={handleCouponsFilter} />
      </div>

      <div className="w-3/4 md:w-full max-w-sm md:max-w-md mx-auto mt-6">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="date-desc">Date (Newest First)</option>
          <option value="date-asc">Date (Oldest First)</option>
          <option value="discount-desc">Discount (Highest First)</option>
          <option value="discount-asc">Discount (Lowest First)</option>
          <option value="brand-asc">Brand (A-Z)</option>
          <option value="brand-desc">Brand (Z-A)</option>
        </select>
      </div>

      <div className="grid grid-rows-1 md:grid-cols-12 lg:grid-cols-12 gap-y-10 md:gap-10 justify-center items-center mt-11 justify-items-center">
        {sortedCoupons &&
          sortedCoupons.map((coupon: Coupon, index: number) => {
            if (index === sortedCoupons.length - 1) {
              return (
                <div
                  key={index}
                  className="flex justify-center col-span-12  md:col-span-4 w-full"
                >
                  <CouponCard innerRef={ref} coupon={coupon} key={index} />
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className="flex justify-center col-span-12 md:col-span-4 w-full"
                >
                  <CouponCard coupon={coupon} key={index} />
                </div>
              );
            }
          })}
      </div>
    </div>
  );
};

export default CouponsPage;
