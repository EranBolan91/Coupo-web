import { getPaginatedCoupons } from "../../database/databaseCalls";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import SearchBar from "../main/components/Searchbar";
import useDebounce from "../../hooks/useDebounce";
import { useEffect, useState } from "react";
import { Coupon } from "../../types/Types";
import CouponTest from "./CouponTest";

const CouponsPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debounceSearch = useDebounce(searchQuery, 700);
  const { ref, inView } = useInView();

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

  return (
    <div className="flex flex-col items-center justify-center py-3">
      <div className="flex flex-col items-center justify-center bg-slate-800 w-full p-4 md:p-28">
        <h2 className="text-2xl md:text-7xl text-primary mb-6 md:mb-20">
          Save upto 50% online now
        </h2>
        <SearchBar filter={handleCouponsFilter} />
      </div>
      <div className="grid grid-rows-1 md:grid-cols-12 lg:grid-cols-12 gap-y-10 md:gap-10 justify-center items-center mt-11 justify-items-center">
        {coupons &&
          coupons.map((coupon: Coupon, index: number) => {
            if (index === coupons.length - 1) {
              return (
                <div
                  key={index}
                  className="flex justify-center col-span-12  md:col-span-4 w-full"
                >
                  <CouponTest innerRef={ref} coupon={coupon} key={index} />
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className="flex justify-center col-span-12 md:col-span-4 w-full"
                >
                  <CouponTest coupon={coupon} key={index} />
                </div>
              );
            }
          })}
      </div>
    </div>
  );
};

export default CouponsPage;
