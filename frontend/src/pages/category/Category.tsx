import { getPaginatedCouponsByCategory } from "../../database/databaseCalls";
import CouponGrid from "../../components/coupons/CouponGrid";
import PageHeader from "../../components/ui/PageHeader";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Coupon } from "../../types/CouponType";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const Category = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { ref, inView } = useInView();

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["categorycoupons", categoryName],
    queryFn: ({ pageParam = null }: { pageParam?: number[] | null; searchQuery?: string }) =>
      getPaginatedCouponsByCategory(pageParam, categoryName),
    initialPageParam: null,
    staleTime: 2000,
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

  const coupons: Coupon[] = (data?.pages.flatMap((coupon) => coupon) || []).filter(
    (coupon): coupon is Coupon => coupon !== undefined
  );

  return (
    <>
      <PageHeader title={categoryName ?? "Category"} description={`Coupons in ${categoryName ?? "this category"}.`} />
      <section className="page-container py-8">
        <CouponGrid
          coupons={coupons}
          isLoading={isLoading}
          isFetchingMore={isFetchingNextPage}
          lastItemRef={ref}
          emptyTitle="No coupons in this category yet"
        />
      </section>
    </>
  );
};

export default Category;
