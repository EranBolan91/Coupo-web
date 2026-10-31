import { getStoreCoupons, getStores, getStoresInCategories } from "../database/stores";
import { useQuery } from "@tanstack/react-query";

// Keys start with "coupons", so refreshing coupon queries after an edit (refreshCouponQueries) refreshes these too.

// One store's coupons (both feeds).
export const useStoreCoupons = (slug: string) =>
  useQuery({ queryKey: ["coupons", "store", slug], queryFn: () => getStoreCoupons(slug), enabled: !!slug });

// Every store's summary, A-Z.
export const useStores = () => useQuery({ queryKey: ["coupons", "stores"], queryFn: getStores });

// Stores sharing a category with these, for "Similar stores".
export const useStoresInCategories = (categories: string[]) =>
  useQuery({
    queryKey: ["coupons", "storesIn", [...categories].sort().join(",")],
    queryFn: () => getStoresInCategories(categories),
    enabled: categories.length > 0,
  });
