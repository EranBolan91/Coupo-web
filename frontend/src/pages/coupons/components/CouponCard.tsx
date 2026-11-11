import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { track } from "../../../analytics";
import WishlistButton from "../../../components/wishlistButton/WishlistButton";
import ShareCouponButton from "../../../components/coupons/ShareCouponButton";
import { PiArrowSquareOutBold, PiCheckBold, PiCheckCircleFill, PiCopyBold, PiWarningCircleFill, PiXBold } from "react-icons/pi";
import { VotingCouponsContext } from "../../../context/VotingContext";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { latestResult, resultLabel } from "../../../logic/couponResults";
import { shopHost, shopLink, termLabels } from "../../../logic/couponTerms";
import { Coupon } from "../../../types/CouponType";
import { couponPath } from "../../../logic/couponLinks";
import { sharerPath } from "../../../logic/sharers";
import { recordCopy } from "../../../database/sharerStats";
import { Link } from "react-router-dom";
import VoteButton from "./VoteButton";
import toast from "react-hot-toast";
import { useContext, useState } from "react";
import type React from "react";

interface Props {
  coupon: Coupon;
  innerRef?: React.Ref<HTMLElement>;
  // Static preview (add-coupon builder): no copy/vote/save actions.
  preview?: boolean;
}

const shortDate = (coupon: Coupon) => coupon.expiry?.toDate?.().toLocaleDateString(undefined, { day: "numeric", month: "short" });

// Brand logo with a letter fallback when there is no image or it fails to load.
export const BrandImage = ({ name, src, className = "size-11" }: { name: string; src?: string; className?: string }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-lg font-black text-accent ${className}`}
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
      className={`shrink-0 rounded-2xl border border-base-300 bg-white object-contain p-1 ${className}`}
    />
  );
};

// A coupon card: brand on top, the discount on a yellow price tag in the corner, the code in a
// dashed box with a big Copy button. Copying the code makes the tag swing on its hole.
export default function CouponCard({ coupon, innerRef, preview = false }: Props) {
  const [currentCoupon, setCurrentCoupon] = useState<Coupon>(coupon);
  const [copied, setCopied] = useState(false);
  // "Did it work?" shows after a signed-in user copies the code, until they answer or close it.
  const [askResult, setAskResult] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const voting = useContext(VotingCouponsContext);
  const userDocument = useCurrentUser();
  const tag = useAnimationControls();
  const reduceMotion = useReducedMotion();
  const shown = preview ? coupon : currentCoupon;
  const isExpired = (shown.expiry?.toMillis?.() ?? Infinity) < Date.now();
  const shopUrl = shopLink(shown);
  const terms = termLabels(shown);
  const result = latestResult(shown);

  const answer = async (worked: boolean) => {
    if (!voting || savingResult) return;
    setSavingResult(true);
    try {
      setCurrentCoupon(await voting.reportResult(currentCoupon, worked));
      setAskResult(false);
      toast.success(worked ? "Thanks! Others will see it worked." : "Thanks for letting others know.");
    } catch {
      toast.error("Couldn't save your answer");
    } finally {
      setSavingResult(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(shown.code);
      setCopied(true);
      if (!preview) track("copy_code", { coupon_type: shown.type, brand: shown.name, signed_in: !!userDocument });
      if (userDocument && !preview) {
        setAskResult(true);
        // Counts toward the sharer's "copied" number and points (once per person, not for their own code).
        if (shown.id && shown.userID !== userDocument.userUID) recordCopy(userDocument.userUID, shown.id);
      }
      toast.success(`Copied ${shown.code}`);
      if (!reduceMotion) {
        await tag.start({
          rotate: 14,
          transition: { duration: 0.12, ease: "easeOut" },
        });
        tag.start({
          rotate: 0,
          transition: { type: "spring", stiffness: 380, damping: 7 },
        });
      }
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy the code");
    }
  };

  return (
    <article
      ref={innerRef}
      className="surface group h-full text-base-content transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift motion-reduce:hover:translate-y-0"
    >
      <div className="flex h-full min-h-[13.5rem] flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <BrandImage name={shown.name} src={shown.imgUrl} className="size-12" />
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="truncate text-xl font-black leading-tight tracking-tight">
              {preview ? (
                shown.name || "Brand"
              ) : (
                <Link to={couponPath(shown)} className="hover:underline hover:decoration-secondary hover:decoration-[3px]">
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
          {/* Price tag: swings on its hole when the code is copied. */}
          <div className="-mr-1 -mt-1 flex shrink-0 flex-col items-end gap-1">
            <motion.div animate={tag} style={{ originX: 0.12, originY: 0.5 }}>
              <span
                className={`tag flex rotate-3 items-baseline gap-1 rounded-xl py-1.5 pr-3 font-display font-black leading-none ${
                  isExpired ? "bg-base-300 text-base-content/60" : "bg-secondary text-secondary-content"
                }`}
              >
                <span className="text-[1.75rem] tracking-tight">{shown.discount || 0}%</span>
                <span className="text-xs uppercase tracking-wider">off</span>
              </span>
            </motion.div>
            <span className={`text-[0.7rem] font-bold uppercase tracking-wide ${isExpired ? "text-error" : "text-base-content/55"}`}>
              {isExpired ? "Expired" : shortDate(shown) ? <>Until {shortDate(shown)}</> : "No expiry"}
            </span>
          </div>
        </div>

        {shown.description && <p className="line-clamp-2 text-sm text-base-content/75">{shown.description}</p>}

        {terms.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Conditions">
            {terms.map((term) => (
              <li key={term} className="rounded-badge bg-base-200 px-2.5 py-1 text-xs font-semibold text-base-content/75">
                {term}
              </li>
            ))}
          </ul>
        )}

        {result && (
          <p className={`flex items-center gap-1.5 text-xs font-semibold ${result.worked ? "text-accent" : "text-error"}`}>
            {result.worked ? <PiCheckCircleFill className="size-4" aria-hidden /> : <PiWarningCircleFill className="size-4" aria-hidden />}
            {resultLabel(result)}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-btn border-2 border-dashed border-primary/35 bg-primary/5 px-4 py-2 font-mono text-[0.95rem] font-bold uppercase tracking-wider text-base-content">
            {shown.code || "CODE"}
          </code>
          {!preview && (
            <button
              type="button"
              onClick={copyCode}
              className="btn btn-primary h-11 min-h-11 shrink-0 px-5"
              aria-label={`Copy code ${shown.code}`}
            >
              {copied ? <PiCheckBold className="size-4" aria-hidden /> : <PiCopyBold className="size-4" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        {askResult && (
          <div className="flex items-center gap-2 rounded-btn bg-base-200 py-1 pl-4 pr-1" role="group" aria-label="Did the code work?">
            <span className="flex-1 whitespace-nowrap text-sm font-bold">Did it work?</span>
            <button type="button" className="btn btn-primary btn-sm h-9 min-h-9 px-3" disabled={savingResult} onClick={() => answer(true)}>
              Yes
            </button>
            <button type="button" className="btn btn-ghost btn-sm h-9 min-h-9 px-3" disabled={savingResult} onClick={() => answer(false)}>
              No
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle h-9 min-h-9 w-9"
              aria-label="Not now"
              onClick={() => setAskResult(false)}
            >
              <PiXBold className="size-4" aria-hidden />
            </button>
          </div>
        )}

        {!preview && (
          <div className="-mx-2 -mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <WishlistButton couponID={shown.id} />
              <ShareCouponButton coupon={shown} compact />
              {shopUrl && (
                <a
                  href={shopUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn btn-ghost btn-sm btn-square h-10 min-h-10 w-10"
                  aria-label={`Shop at ${shopHost(shopUrl)} (opens in a new tab)`}
                  title={`Shop at ${shopHost(shopUrl)}`}
                >
                  <PiArrowSquareOutBold className="size-5" aria-hidden />
                </a>
              )}
            </div>
            <div className="flex items-center">
              <VoteButton kind="likes" coupon={currentCoupon} setCoupon={setCurrentCoupon} />
              <VoteButton kind="dislikes" coupon={currentCoupon} setCoupon={setCurrentCoupon} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export const CouponCardSkeleton = () => (
  <div className="surface flex h-full min-h-[13.5rem] flex-col gap-3 p-5" aria-hidden="true">
    <div className="flex items-center gap-3">
      <div className="skeleton size-12 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/3" />
      </div>
      <div className="skeleton h-10 w-20 rounded-xl" />
    </div>
    <div className="skeleton h-3 w-full" />
    <div className="skeleton mt-auto h-11 w-full rounded-btn" />
  </div>
);
