import { getPaginatedCoupons } from "../../database/databaseCalls";
import { useInfiniteQuery } from "@tanstack/react-query";
import CouponCard from "../main/components/CouponCard";
import SearchBar from "../main/components/Searchbar";
import { useEffect, useState } from "react";
import { Coupon } from "../../types/Types";
import { useInView } from "react-intersection-observer";

const CouponsPage = () => {
  const [globalCoupons, setGlobalCoupons] = useState<Coupon[] | null>(null);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[] | null>(null);
  const { ref, inView } = useInView();
  const { data, status, error, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["coupons"],
    queryFn: getPaginatedCoupons,
    initialPageParam: 1,
    staleTime: Infinity,
    getNextPageParam: (lastPage, allPages) => {
      console.log("lastPage", lastPage);
      const nextPage = lastPage?.length ? allPages.length + 1 : undefined;
      return nextPage;
    },
  });

  const coupons = data?.pages.flatMap((coupon) => coupon);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleCouponsFilter = (text: string) => {
    if (text === "") {
      setFilteredCoupons(globalCoupons);
      return;
    }
    const filteredData = filteredCoupons?.filter((coupon) =>
      coupon.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCoupons(filteredData ? filteredData : []);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="flex w-3/4 items-center justify-center">
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
