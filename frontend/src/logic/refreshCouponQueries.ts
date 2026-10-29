import { QueryClient } from "@tanstack/react-query";

// Every cached list that can show a coupon. Call after an admin edits or deletes one.
export const refreshCouponQueries = (queryClient: QueryClient) =>
  ["coupons", "latestCoupons", "coupon", "usercoupons", "userWishlist", "expireCoupons", "reports"].forEach((key) =>
    queryClient.invalidateQueries({ queryKey: [key] })
  );
