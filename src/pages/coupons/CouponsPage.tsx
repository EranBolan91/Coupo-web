import { getPaginatedCoupons } from "../../database/databaseCalls";
import { useInfiniteQuery } from "@tanstack/react-query";
import CouponCard from "../main/components/CouponCard";
import SearchBar from "../main/components/Searchbar";
import { useEffect, useState } from "react";
import { Coupon } from "../../types/Types";
import { useInView } from "react-intersection-observer";
import useDebounce from "../../hooks/useDebounce";

const CouponsPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { ref, inView } = useInView();
  const debounceSearch = useDebounce(searchQuery, 1000);
  const { data, status, error, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["coupons", debounceSearch],
    queryFn: ({
      pageParam = null,
      searchQuery,
    }: {
      pageParam?: number[] | null;
      searchQuery?: string;
    }) => getPaginatedCoupons(debounceSearch, pageParam),
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

  const handleCouponsFilter = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col w-3/4 items-center justify-center bg-slate-800 w-full p-28">
        <h2 className="text-7xl text-primary mb-20">
          Save upto 50% online now
        </h2>
        <SearchBar filter={handleCouponsFilter} />
      </div>
      <div className="grid grid-rows-1 md:grid-cols-12 lg:grid-cols-12 p-0 md:p-0 lg:p-0 justify-center items-center mt-11 justify-items-center">
        {coupons &&
          coupons.map((coupon, index) => {
            if (index === coupons.length - 1) {
              return (
                <div
                  key={index}
                  className="flex justify-center col-span-12 sm:col-span-12 md:col-span-4 w-full"
                >
                  {coupon && (
                    <CouponCard innerRef={ref} card={coupon} key={index} />
                  )}{" "}
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className="flex justify-center col-span-12 sm:col-span-12 md:col-span-4 w-full"
                >
                  {coupon && <CouponCard card={coupon} key={index} />}{" "}
                </div>
              );
            }
          })}
      </div>
    </div>
  );
};

export default CouponsPage;
