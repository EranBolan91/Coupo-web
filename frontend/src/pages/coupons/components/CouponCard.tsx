import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import WishlistButton from "../../../components/wishlistButton/WishlistButton";
import { PiCheckBold, PiCopyBold } from "react-icons/pi";
import { Coupon } from "../../../types/CouponType";
import { couponPath } from "../../../logic/couponLinks";
import { sharerPath } from "../../../logic/sharers";
import { Link } from "react-router-dom";
import VoteButton from "./VoteButton";
import toast from "react-hot-toast";
import { useState } from "react";
import type React from "react";

interface Props {
  coupon: Coupon;
  innerRef?: React.Ref<HTMLElement>;
  // Static preview (add-coupon builder): no copy/vote/save actions.
  preview?: boolean;
}

const shortDate = (coupon: Coupon) =>
  coupon.expiry?.toDate?.().toLocaleDateString(undefined, { day: "numeric", month: "short" });

// Brand logo with a letter fallback when there is no image or it fails to load.
export const BrandImage = ({ name, src, className = "size-11" }: { name: string; src?: string; className?: string }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-base-200 font-display text-lg font-extrabold text-base-content/70 ${className}`}
      >
        {name?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-xl border border-base-300 bg-white object-contain p-1 ${className}`}
    />
  );
};

// A coupon as a physical ticket: details on the left, a lime stub with the discount on the right,
// notches + perforation at the tear line. Copying the code "tears" the stub a little.
export default function CouponCard({ coupon, innerRef, preview = false }: Props) {
  const [currentCoupon, setCurrentCoupon] = useState<Coupon>(coupon);
  const [copied, setCopied] = useState(false);
  const stub = useAnimationControls();
  const reduceMotion = useReducedMotion();
  const shown = preview ? coupon : currentCoupon;
  const isExpired = (shown.expiry?.toMillis?.() ?? Infinity) < Date.now();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(shown.code);
      setCopied(true);
      toast.success(`Copied ${shown.code}`);
      if (!reduceMotion) {
        await stub.start({ rotate: 7, x: 6, y: -2, transition: { duration: 0.12, ease: "easeOut" } });
        stub.start({ rotate: 0, x: 0, y: 0, transition: { type: "spring", stiffness: 420, damping: 14 } });
      }
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy the code");
    }
  };

  return (
    <article
      ref={innerRef}
      className="group h-full transition-transform duration-300 ease-out [filter:drop-shadow(0_1px_0_rgb(16_17_14/0.06))_drop-shadow(0_10px_24px_rgb(16_17_14/0.08))] hover:-translate-y-1 motion-reduce:hover:translate-y-0 dark:[filter:drop-shadow(0_10px_24px_rgb(0_0_0/0.45))]"
    >
      <div className="ticket flex h-full min-h-[13.5rem] bg-base-100 [--stub:6.25rem]">
        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
          <div className="flex items-start gap-3">
            <BrandImage name={shown.name} src={shown.imgUrl} />
            <div className="min-w-0">
              <h3 className="truncate text-xl font-extrabold leading-tight tracking-tight">
                {preview ? (
                  shown.name || "Brand"
                ) : (
                  <Link to={couponPath(shown)} className="hover:underline hover:decoration-primary hover:decoration-[3px] hover:underline-offset-4">
                    {shown.name || "Brand"}
                  </Link>
                )}
              </h3>
              <p className="truncate text-sm capitalize text-base-content/60">
                {shown.category || "Category"}
                {shown.username && (
                  <>
                    {" · by "}
                    {!preview && shown.userID ? (
                      <Link to={sharerPath(shown.userID)} className="relative z-[1] hover:text-base-content hover:underline">
                        {shown.username}
                      </Link>
                    ) : (
                      shown.username
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          {shown.description && <p className="line-clamp-2 text-sm text-base-content/75">{shown.description}</p>}

          <div className="mt-auto flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-btn border-2 border-dashed border-base-300 bg-base-200/70 px-3.5 py-1.5 font-mono text-[0.95rem] font-bold uppercase tracking-wider">
              {shown.code || "CODE"}
            </code>
            {!preview && (
              <button
                type="button"
                onClick={copyCode}
                className="btn btn-primary btn-sm h-10 min-h-10 shrink-0 px-4"
                aria-label={`Copy code ${shown.code}`}
              >
                {copied ? <PiCheckBold className="size-4" aria-hidden /> : <PiCopyBold className="size-4" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {!preview && (
            <div className="-mx-2 -mb-2 flex items-center justify-between">
              <WishlistButton couponID={shown.id} />
              <div className="flex items-center">
                <VoteButton kind="likes" coupon={currentCoupon} setCoupon={setCurrentCoupon} />
                <VoteButton kind="dislikes" coupon={currentCoupon} setCoupon={setCurrentCoupon} />
              </div>
            </div>
          )}
        </div>

        {/* Stub */}
        <motion.div
          animate={stub}
          style={{ originX: 0, originY: 1 }}
          className={`relative flex w-[6.25rem] shrink-0 flex-col items-center justify-center gap-3 px-2 py-5 text-center ${
            isExpired ? "bg-base-300 text-base-content/60" : "bg-primary text-primary-content"
          }`}
        >
          <span className="perf-y absolute inset-y-3 left-0 opacity-40" aria-hidden="true" />
          <span className="stamp -rotate-6 px-2 py-1.5">
            <span className="text-[2.1rem] tracking-tight">{shown.discount || 0}%</span>
            <span className="mt-0.5 text-sm tracking-[0.2em]">off</span>
          </span>
          <span className="text-[0.7rem] font-bold uppercase leading-tight tracking-wide">
            {isExpired ? "Expired" : shortDate(shown) ? <>Until {shortDate(shown)}</> : "No expiry"}
          </span>
        </motion.div>
      </div>
    </article>
  );
}

export const CouponCardSkeleton = () => (
  <div className="ticket flex h-full min-h-[13.5rem] bg-base-100 [--stub:6.25rem]" aria-hidden="true">
    <div className="flex flex-1 flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <div className="skeleton size-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="skeleton mt-auto h-10 w-full rounded-btn" />
    </div>
    <div className="w-[6.25rem] bg-base-300/60" />
  </div>
);
