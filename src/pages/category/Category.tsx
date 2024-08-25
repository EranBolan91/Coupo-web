import { getPaginatedCouponsByCategory } from "../../database/databaseCalls";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import CouponTest from "../coupons/CouponTest";
import { useParams } from "react-router-dom";
import { Coupon } from "../../types/Types";
import { useEffect } from "react";

const Category = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { ref, inView } = useInView();

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["categorycoupons", categoryName],
    queryFn: ({
      pageParam = null,
    }: {
      pageParam?: number[] | null;
      searchQuery?: string;
    }) => getPaginatedCouponsByCategory(pageParam, categoryName),
    initialPageParam: null,
    staleTime: 2000,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => {
      const lastItem = lastPage ? [lastPage?.length - 1] : undefined;
      return lastItem;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  const coupons: Coupon[] = (
    data?.pages.flatMap((coupon) => coupon) || []
  ).filter((coupon): coupon is Coupon => coupon !== undefined);

  return (
    <>
      <div className=" text-lg md:text-6xl p-2">{categoryName}</div>
      <div className="grid grid-rows-1 md:grid-cols-12 lg:grid-cols-12 gap-y-10 md:gap-10 justify-center items-center mt-11 justify-items-center p-2">
        {coupons &&
          coupons.map((coupon: Coupon, index: number) => {
            if (index === coupons.length - 1) {
              return (
                <div
                  key={index}
                  className="flex justify-center col-span-12  md:col-span-3 w-full"
                >
                  <CouponTest innerRef={ref} coupon={coupon} key={index} />
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className="flex justify-center col-span-12 md:col-span-3 w-full"
                >
                  <CouponTest coupon={coupon} key={index} />
                </div>
              );
            }
          })}
      </div>
    </>
  );
};

export default Category;
