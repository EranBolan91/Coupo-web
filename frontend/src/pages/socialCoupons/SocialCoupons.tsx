import { collectionsList } from "../../../firebaseCollections";
import useFetchCoupons from "../../hooks/useFetchCoupons";
import CouponGrid from "../../components/coupons/CouponGrid";
import PageHeader from "../../components/ui/PageHeader";
import { useInView } from "react-intersection-observer";
import SearchBar from "../main/components/Searchbar";
import useDebounce from "../../hooks/useDebounce";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SocialCoupons = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debounceSearch = useDebounce(searchQuery, 700);
  const { ref, inView } = useInView();

  const {
    coupons,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    status,
    setSearchQuery: setCouponsSearchQuery,
  } = useFetchCoupons({
    collection: collectionsList.socialCoupons,
  });

  const handleCouponsFilter = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
    setCouponsSearchQuery(debounceSearch);
  }, [inView, hasNextPage, debounceSearch]);

  return (
    <>
      <PageHeader
        title="Social Coupons"
        description="Deals people found on social media and shared here, newest first."
      >
        <SearchBar filter={handleCouponsFilter} placeholder="Search by exact brand name" />
      </PageHeader>
      <section className="page-container py-8">
        <CouponGrid
          coupons={coupons}
          isLoading={status === "pending"}
          isFetchingMore={isFetchingNextPage}
          lastItemRef={ref}
          emptyTitle={searchQuery ? "No social coupons match your search" : "No social coupons yet"}
          emptyAction={
            !searchQuery && (
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
