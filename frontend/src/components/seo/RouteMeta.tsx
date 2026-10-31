import usePageMeta, { PageMeta } from "../../hooks/usePageMeta";
import { useLocation } from "react-router-dom";

// Title and description for pages whose wording doesn't depend on data. Coupon, store and category
// pages set their own with usePageMeta, so they're skipped here.
const staticPages: [RegExp, PageMeta][] = [
  [/^\/$/, { title: "Coupo", description: "Find, share and vote on coupon codes. Every code is shared and checked by shoppers like you." }],
  [/^\/coupons$/, { title: "Coupon codes", description: "Search coupon codes by store, category and discount. Expired codes are hidden." }],
  [/^\/social$/, { title: "Social coupons", description: "Coupon codes shared by creators and communities, checked by Coupo shoppers." }],
  [/^\/stores$/, { title: "All stores with coupon codes", description: "Every store on Coupo, A to Z, with how many working codes each one has." }],
  [/^\/categories$/, { title: "Coupon categories", description: "Browse coupon codes by category." }],
  [/^\/top-sharers$/, { title: "Top sharers", description: "The people sharing the coupon codes that work best on Coupo." }],
  [/^\/users\/[^/]+$/, { title: "Sharer", description: "Coupon codes shared by this Coupo member." }],
  [/^\/login$/, { title: "Log in" }],
  [/^\/signup$/, { title: "Sign up" }],
  [/^\/profile$/, { title: "Your profile" }],
  [/^\/addcoupon$/, { title: "Share a coupon" }],
  [/^\/admin(\/.*)?$/, { title: "Admin" }],
];

const ownMeta = /^\/(coupons|social|store|categories)\/[^/]+\/?$/;

const RouteMeta = () => {
  const { pathname } = useLocation();
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const meta = ownMeta.test(path)
    ? null
    : staticPages.find(([pattern]) => pattern.test(path))?.[1] ?? { title: "Page not found" };
  usePageMeta(meta);
  return null;
};

export default RouteMeta;
