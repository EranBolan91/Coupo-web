import { getCouponFeed } from "../database/databaseCalls";
import { useQuery } from "@tanstack/react-query";

// All coupons of one public feed (collectionsList.coupons or .socialCoupons), newest first.
// The key starts with "coupons", so invalidating ["coupons"] after a change refreshes every feed.
// Show loading skeletons while isPending (not isLoading): while offline the request is paused,
// isLoading is false and the page would wrongly say "no coupons".
const useCouponFeed = (collectionName: string) =>
  useQuery({ queryKey: ["coupons", collectionName], queryFn: () => getCouponFeed(collectionName) });

export default useCouponFeed;
