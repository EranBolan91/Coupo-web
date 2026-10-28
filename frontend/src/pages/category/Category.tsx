import { collectionsList } from "../../../firebaseCollections";
import CouponGrid from "../../components/coupons/CouponGrid";
import PageHeader from "../../components/ui/PageHeader";
import useCouponFeed from "../../hooks/useCouponFeed";
import useShowMore from "../../hooks/useShowMore";
import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";

const Category = () => {
  const { categoryName = "" } = useParams<{ categoryName: string }>();
  const { data: coupons = [], isPending: isLoading, isError, refetch } = useCouponFeed(collectionsList.coupons);

  const inCategory = useMemo(
    () => coupons.filter((coupon) => coupon.category?.toLowerCase() === categoryName.toLowerCase()),
    [coupons, categoryName]
  );
  const { visible, lastItemRef } = useShowMore(inCategory, categoryName);

  return (
    <>
      <PageHeader title={categoryName || "Category"} description={`Coupons in ${categoryName || "this category"}.`} />
      <section className="page-container py-8">
        <CouponGrid
          coupons={visible}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          lastItemRef={lastItemRef}
          emptyTitle="No coupons in this category yet"
          emptyAction={
            <Link to="/addcoupon" className="btn btn-primary">
              Share a coupon
            </Link>
          }
        />
      </section>
    </>
  );
};

export default Category;
