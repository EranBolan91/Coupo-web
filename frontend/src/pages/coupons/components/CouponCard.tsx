import WishlistButton from "../../../components/wishlistButton/WishlistButton";
import { PiCopyBold, PiCheckBold } from "react-icons/pi";
import { Coupon } from "../../../types/CouponType";
import VoteButton from "./VoteButton";
import toast from "react-hot-toast";
import { useState } from "react";
import type React from "react";

interface Props {
  coupon: Coupon;
  innerRef?: React.Ref<HTMLElement>;
}

const formatDate = (coupon: Coupon) =>
  coupon.expiry?.toDate().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// Brand logo with a letter fallback when there is no image or it fails to load.
const BrandImage = ({ name, src }: { name: string; src?: string }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-btn bg-base-200 text-lg font-bold text-base-content/70">
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
      className="size-12 shrink-0 rounded-btn border border-base-300 bg-white object-contain p-1"
    />
  );
};

// A coupon shown as a ticket: details on top, a perforated tear line, then the code and actions.
export default function CouponCard({ coupon, innerRef }: Props) {
  const [currentCoupon, setCurrentCoupon] = useState<Coupon>(coupon);
  const [copied, setCopied] = useState(false);
  const isExpired = (currentCoupon.expiry?.toMillis() ?? Infinity) < Date.now();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCoupon.code);
      setCopied(true);
      toast.success(`Copied ${currentCoupon.code}`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy the code");
    }
  };

  return (
    <article
      ref={innerRef}
      className="flex h-full flex-col rounded-box border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <BrandImage name={currentCoupon.name} src={currentCoupon.imgUrl} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold leading-tight">{currentCoupon.name}</h3>
            {currentCoupon.category && (
              <p className="mt-0.5 truncate text-sm capitalize text-base-content/60">{currentCoupon.category}</p>
            )}
          </div>
          <p className="shrink-0 text-right leading-none">
            <span className="text-2xl font-extrabold tracking-tight text-primary">{currentCoupon.discount}%</span>
            <span className="block text-xs font-semibold uppercase text-base-content/60">off</span>
          </p>
        </div>

        {currentCoupon.description && (
          <p className="line-clamp-2 text-sm text-base-content/75">{currentCoupon.description}</p>
        )}

        <p className="mt-auto text-xs text-base-content/60">
          {isExpired ? (
            <span className="font-semibold text-error">Expired {formatDate(currentCoupon)}</span>
          ) : (
            <>Expires {formatDate(currentCoupon)}</>
          )}
          {currentCoupon.username && <> · Shared by {currentCoupon.username}</>}
        </p>
      </div>

      {/* Tear line between the details and the code, like a ticket stub. */}
      <div className="mx-5 border-t border-dashed border-base-300" aria-hidden="true" />

      <div className="flex flex-col gap-3 p-5 pt-4">
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-btn bg-base-200 px-3 py-2 font-mono text-base font-bold tracking-wider">
            {currentCoupon.code}
          </code>
          <button type="button" onClick={copyCode} className="btn btn-primary btn-sm h-10 min-h-10">
            {copied ? <PiCheckBold aria-hidden /> : <PiCopyBold aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <WishlistButton couponID={currentCoupon.id} />
          <div className="flex items-center gap-1">
            <VoteButton kind="likes" coupon={currentCoupon} setCoupon={setCurrentCoupon} />
            <VoteButton kind="dislikes" coupon={currentCoupon} setCoupon={setCurrentCoupon} />
          </div>
        </div>
      </div>
    </article>
  );
}

export const CouponCardSkeleton = () => (
  <div className="flex h-full flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-5" aria-hidden="true">
    <div className="flex items-center gap-3">
      <div className="skeleton size-12 rounded-btn" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/3" />
      </div>
      <div className="skeleton h-8 w-12" />
    </div>
    <div className="skeleton h-3 w-full" />
    <div className="skeleton h-3 w-4/5" />
    <div className="skeleton mt-4 h-10 w-full" />
  </div>
);
