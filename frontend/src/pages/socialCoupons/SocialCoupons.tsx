import { collectionsList } from "../../../firebaseCollections";
import CouponGrid from "../../components/coupons/CouponGrid";
import { matchesSearch } from "../../logic/couponFilters";
import PageHeader from "../../components/ui/PageHeader";
import useCouponFeed from "../../hooks/useCouponFeed";
import SearchBar from "../main/components/Searchbar";
import useShowMore from "../../hooks/useShowMore";
import useCouponSearch from "../../hooks/useCouponSearch";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const SocialCoupons = () => {
  // The search text is kept in the URL (?q=...), like on the Coupons page.
  const { search, setSearch } = useCouponSearch();
  const { data: coupons = [], isPending: isLoading, isError, refetch } = useCouponFeed(collectionsList.socialCoupons);

  const results = useMemo(() => coupons.filter((coupon) => matchesSearch(coupon, search)), [coupons, search]);
  const { visible, lastItemRef } = useShowMore(results, search);
  const searching = search.trim() !== "";

  return (
    <>
      <PageHeader
        title="Social Coupons"
        description="Deals people found on social media and shared here, newest first."
      >
        <SearchBar filter={setSearch} value={search} placeholder="Search by brand, code or category" />
      </PageHeader>
      <section className="page-container py-8">
        <CouponGrid
          coupons={visible}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          lastItemRef={lastItemRef}
          emptyTitle={searching ? "No social coupons match your search" : "No social coupons yet"}
          emptyDescription={searching ? "Try another word." : undefined}
          emptyAction={
            !searching && (
              <Link to="/addcoupon" className="btn btn-primary">
                Share a coupon
              </Link>
            )
          }
        />
      </section>
    </>
  );
};

export default SocialCoupons;
