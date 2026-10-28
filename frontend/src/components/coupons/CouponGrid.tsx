import CouponCard, { CouponCardSkeleton } from "../../pages/coupons/components/CouponCard";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Coupon } from "../../types/CouponType";
import EmptyState from "../ui/EmptyState";
import LoadError from "../ui/LoadError";
import React from "react";

interface Props {
  coupons: Coupon[];
  isLoading?: boolean;
  // Loading failed: shows a message with a "Try again" button that calls onRetry.
  isError?: boolean;
  onRetry?: () => void;
  isFetchingMore?: boolean;
  // Ref for the last card, used to load the next page when it scrolls into view.
  lastItemRef?: React.Ref<HTMLElement>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  skeletonCount?: number;
}

const gridClass = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

// The one coupon list used by every page: loading skeletons, error, empty state, cards and "loading more".
const CouponGrid = ({
  coupons,
  isLoading,
  isError,
  onRetry,
  isFetchingMore,
  lastItemRef,
  emptyTitle = "No coupons here yet",
  emptyDescription,
  emptyAction,
  skeletonCount = 6,
}: Props) => {
  const reduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div className={gridClass} role="status" aria-label="Loading coupons">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <CouponCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <LoadError what="coupons" onRetry={onRetry} />;
  }

  if (coupons.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <>
      <ul className={gridClass}>
        <AnimatePresence initial={false}>
          {coupons.map((coupon, index) => (
            <motion.li
              key={coupon.id}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <CouponCard coupon={coupon} innerRef={index === coupons.length - 1 ? lastItemRef : undefined} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {isFetchingMore && (
        <div className="mt-8 flex justify-center" role="status">
          <span className="loading loading-dots loading-md text-primary" aria-hidden />
          <span className="sr-only">Loading more coupons</span>
        </div>
      )}
    </>
  );
};

export default CouponGrid;
