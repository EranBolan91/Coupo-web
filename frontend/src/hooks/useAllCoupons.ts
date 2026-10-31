import { collectionsList } from "../../firebaseCollections";
import useCouponFeed from "./useCouponFeed";

// Both public feeds (store and social coupons) together, for store pages. Reuses the cached feeds.
const useAllCoupons = () => {
  const coupons = useCouponFeed(collectionsList.coupons);
  const social = useCouponFeed(collectionsList.socialCoupons);
  return {
    data: [...(coupons.data ?? []), ...(social.data ?? [])],
    isPending: coupons.isPending || social.isPending,
    isError: coupons.isError || social.isError,
    refetch: () => {
      coupons.refetch();
      social.refetch();
    },
  };
};

export default useAllCoupons;
