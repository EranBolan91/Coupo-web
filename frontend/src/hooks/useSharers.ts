import { collectionsList } from "../../firebaseCollections";
import { rankSharers } from "../logic/sharers";
import useCouponFeed from "./useCouponFeed";
import { useMemo } from "react";

// Ranked sharers from both public feeds (shares their cache with the coupon pages).
const useSharers = () => {
  const store = useCouponFeed(collectionsList.coupons);
  const social = useCouponFeed(collectionsList.socialCoupons);
  const sharers = useMemo(() => rankSharers([...(store.data ?? []), ...(social.data ?? [])]), [store.data, social.data]);
  return {
    sharers,
    isPending: store.isPending || social.isPending,
    isError: store.isError || social.isError,
    refetch: () => Promise.all([store.refetch(), social.refetch()]),
  };
};

export default useSharers;
