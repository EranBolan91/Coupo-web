import CouponCard, { CouponCardSkeleton } from "../coupons/components/CouponCard";
import { getCategories, getLatestCoupons } from "../../database/databaseCalls";
import CouponGrid from "../../components/coupons/CouponGrid";
import { motion, useReducedMotion } from "motion/react";
import { PiArrowRightBold } from "react-icons/pi";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const MainPage = () => {
  const reduceMotion = useReducedMotion();

  const { data: latest = [], isLoading: latestLoading } = useQuery({
    queryKey: ["latestCoupons"],
    queryFn: () => getLatestCoupons(12),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const preview = latest.slice(0, 2);
  const biggestDiscounts = [...latest].sort((a, b) => Number(b.discount) - Number(a.discount)).slice(0, 3);

  return (
    <>
      {/* Hero: value prop on the left, two real, live coupons on the right. */}
      <section className="overflow-hidden border-b border-base-300 bg-base-100">
        <div className="page-container grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              Coupon codes, shared and <span className="text-primary">checked by shoppers</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-base-content/70">
              Find working codes for the brands you buy from, share the ones you find, and vote on what works.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/coupons" className="btn btn-primary">
                Browse coupons
                <PiArrowRightBold aria-hidden />
              </Link>
              <Link to="/addcoupon" className="btn border-base-300 bg-base-100 hover:bg-base-200">
                Share a coupon
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-6 -z-0 rounded-[2rem] bg-primary/5" aria-hidden="true" />
            <div className="relative grid gap-4">
              {latestLoading ? (
                <>
                  <CouponCardSkeleton />
                  <div className="hidden sm:block lg:ml-12">
                    <CouponCardSkeleton />
                  </div>
                </>
              ) : (
                preview.map((coupon, i) => (
                  <motion.div
                    key={coupon.id}
                    className={i === 1 ? "hidden sm:block lg:ml-12" : "lg:mr-12"}
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <CouponCard coupon={coupon} />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="page-container pt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-bold">Browse by category</h2>
            <Link to="/categories" className="shrink-0 text-sm font-semibold text-primary hover:underline">
              All categories
            </Link>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[...categories]
              .sort((a, b) => a.localeCompare(b))
              .slice(0, 12)
              .map((category) => (
                <li key={category}>
                  <Link
                    to={`/categories/${encodeURIComponent(category)}`}
                    className="inline-flex h-10 items-center rounded-badge border border-base-300 bg-base-100 px-4 text-sm font-semibold capitalize transition-colors hover:border-primary hover:text-primary"
                  >
                    {category}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="page-container py-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold">Biggest discounts right now</h2>
          <Link to="/coupons" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            See all
          </Link>
        </div>
        <CouponGrid
          coupons={biggestDiscounts}
          isLoading={latestLoading}
          skeletonCount={3}
          emptyTitle="No coupons yet"
          emptyDescription="Be the first to share one."
          emptyAction={
            <Link to="/addcoupon" className="btn btn-primary">
              Share a coupon
            </Link>
          }
        />
      </section>
    </>
  );
};

export default MainPage;
