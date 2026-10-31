import { logSearch, normalizeTerm, SearchPage } from "../database/searches";
import { CouponFilters, filterCoupons } from "../logic/couponFilters";
import { UserAuth } from "../auth/AuthProvider";
import { Coupon } from "../types/CouponType";
import { useEffect } from "react";

const WAIT_MS = 1500;
const MIN_LENGTH = 2;
const noFilters: CouponFilters = { categories: [], brands: [], minDiscount: 0, expiringSoon: false, showExpired: false };

// Searches already logged in this tab, so typing, clearing and retyping the same word counts once.
const logged = new Set<string>();

// Logs a search for the admin analytics page once the visitor stops typing for a moment.
// The result count is for the search text alone (live coupons only), not the extra filters,
// so "no results" means Coupo has no live coupon for it. Admins' own searches aren't logged.
const useSearchLogging = (page: SearchPage, search: string, coupons: Coupon[], ready: boolean) => {
  const { isAdmin } = UserAuth();

  useEffect(() => {
    const term = normalizeTerm(search);
    const key = `${page}:${term}`;
    if (!ready || isAdmin || term.length < MIN_LENGTH || logged.has(key)) return;

    const timer = setTimeout(() => {
      logged.add(key);
      const results = filterCoupons(coupons, term, noFilters).results.length;
      // Analytics only: a failed write must never get in the visitor's way.
      logSearch(term, results, page).catch(() => logged.delete(key));
    }, WAIT_MS);
    return () => clearTimeout(timer);
  }, [page, search, coupons, ready, isAdmin]);
};

export default useSearchLogging;
