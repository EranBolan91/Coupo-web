import { CouponFilters, CouponSort, discountOptions, isCouponSort } from "../logic/couponFilters";
import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

// Search, sort and filters for a coupon list, kept in the URL so a refreshed or shared link shows
// the same results: /coupons?q=nike&sort=likes-desc&category=sport&brand=Nike&discount=25&expiring=week&expired=show
// category and brand can repeat. Defaults (no search, "newest", no filters, expired hidden) are left out of the URL.
export type FilterKey = "category" | "brand";

const validDiscounts: number[] = discountOptions.map((option) => option.value);

const useCouponSearch = () => {
  const [params, setParams] = useSearchParams();

  const search = params.get("q") ?? "";
  const sortParam = params.get("sort");
  const sort: CouponSort = isCouponSort(sortParam) ? sortParam : "newest";
  const discountParam = Number(params.get("discount"));
  const filters: CouponFilters = useMemo(
    () => ({
      categories: params.getAll("category"),
      brands: params.getAll("brand"),
      minDiscount: validDiscounts.includes(discountParam) ? discountParam : 0,
      expiringSoon: params.get("expiring") === "week",
      showExpired: params.get("expired") === "show",
    }),
    [params, discountParam]
  );

  // Builds the next URL from the current one. Typing in the search box replaces the history
  // entry instead of adding one per key press, so Back still leaves the page.
  const update = useCallback(
    (change: (next: URLSearchParams) => void, replace = false) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          change(next);
          return next;
        },
        { replace }
      ),
    [setParams]
  );

  const setSingle = (next: URLSearchParams, key: string, value: string) =>
    value ? next.set(key, value) : next.delete(key);

  const setSearch = useCallback(
    (text: string) => update((next) => setSingle(next, "q", text.trim() === "" ? "" : text), true),
    [update]
  );

  const setSort = useCallback(
    (value: CouponSort) => update((next) => setSingle(next, "sort", value === "newest" ? "" : value)),
    [update]
  );

  const toggleFilter = useCallback(
    (key: FilterKey, value: string) =>
      update((next) => {
        const values = next.getAll(key);
        next.delete(key);
        const kept = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
        kept.forEach((v) => next.append(key, v));
      }),
    [update]
  );

  const setMinDiscount = useCallback(
    (value: number) => update((next) => setSingle(next, "discount", value > 0 ? String(value) : "")),
    [update]
  );

  const setExpiringSoon = useCallback(
    (on: boolean) => update((next) => setSingle(next, "expiring", on ? "week" : "")),
    [update]
  );

  const setShowExpired = useCallback(
    (on: boolean) => update((next) => setSingle(next, "expired", on ? "show" : "")),
    [update]
  );

  // Clears the filters but keeps the search text, sort and the "Show expired" switch.
  const clearFilters = useCallback(
    () =>
      update((next) => {
        ["category", "brand", "discount", "expiring"].forEach((key) => next.delete(key));
      }),
    [update]
  );

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.minDiscount > 0 ? 1 : 0) +
    (filters.expiringSoon ? 1 : 0);

  return {
    search,
    sort,
    filters,
    activeFilterCount,
    // Changes whenever the results could change; used to go back to the first page.
    resultsKey: params.toString(),
    setSearch,
    setSort,
    toggleFilter,
    setMinDiscount,
    setExpiringSoon,
    setShowExpired,
    clearFilters,
  };
};

export type CouponSearch = ReturnType<typeof useCouponSearch>;
export default useCouponSearch;
