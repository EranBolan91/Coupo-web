import CouponCard, { CouponCardSkeleton } from "../coupons/components/CouponCard";
import ReportCouponButton from "../../components/coupons/ReportCouponButton";
import ShareCouponButton from "../../components/coupons/ShareCouponButton";
import AdminCouponActions from "../../components/admin/AdminCouponActions";
import { Link, useNavigate, useParams } from "react-router-dom";
import CouponGrid from "../../components/coupons/CouponGrid";
import { collectionsList } from "../../../firebaseCollections";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import useCouponFeed from "../../hooks/useCouponFeed";
import { PiArrowLeftBold } from "react-icons/pi";
import { getCoupon } from "../../database/coupons";
import { Coupon } from "../../types/CouponType";
import { UserAuth } from "../../auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";

const longDate = (value?: { toDate?: () => Date }) =>
  value?.toDate?.().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

// One coupon: /coupons/:couponId (store) or /social/:couponId (social). This is the link people share.
const CouponPage = ({ type }: { type: Coupon["type"] }) => {
  const { couponId = "" } = useParams<{ couponId: string }>();
  const { isAdmin } = UserAuth();
  const navigate = useNavigate();
  const isSocial = type === "socialCoupon";
  const back = isSocial ? { to: "/social", label: "Social coupons" } : { to: "/coupons", label: "All coupons" };

  const { data: coupon, isPending, isError, refetch } = useQuery({
    queryKey: ["coupon", type, couponId],
    queryFn: () => getCoupon(type, couponId),
  });

  // "More from this brand" comes from the feed, which is usually cached already.
  const { data: feed = [] } = useCouponFeed(isSocial ? collectionsList.socialCoupons : collectionsList.coupons);
  const now = Date.now();
  const moreFromBrand = coupon
    ? feed
        .filter((c) => c.id !== coupon.id && c.name?.toLowerCase() === coupon.name?.toLowerCase())
        .filter((c) => (c.expiry?.toMillis?.() ?? Infinity) >= now)
        .slice(0, 3)
    : [];

  const backLink = (
    <Link to={back.to} className="btn btn-ghost btn-sm -ml-3 h-10 min-h-10 px-3 text-base-content/70">
      <PiArrowLeftBold className="size-4" aria-hidden />
      {back.label}
    </Link>
  );

  if (isPending) {
    return (
      <section className="page-container py-10">
        {backLink}
        <div className="mt-6 max-w-xl" role="status" aria-label="Loading coupon">
          <CouponCardSkeleton />
        </div>
      </section>
    );
  }

  if (isError || !coupon) {
    return (
      <section className="page-container py-10">
        {backLink}
        <div className="mt-6">
          {isError ? (
            <LoadError what="coupon" onRetry={() => refetch()} />
          ) : (
            <EmptyState
              title="This coupon isn't here anymore"
              description="It may have been removed, or the link is wrong."
              action={
                <Link to={back.to} className="btn btn-primary">
                  Browse coupons
                </Link>
              }
            />
          )}
        </div>
      </section>
    );
  }

  const expired = (coupon.expiry?.toMillis?.() ?? Infinity) < now;
  const facts: [string, React.ReactNode][] = [
    ["Expires", expired ? <span className="text-error">Expired {longDate(coupon.expiry)}</span> : longDate(coupon.expiry) ?? "No expiry"],
    [
      "Category",
      coupon.category ? (
        <Link to={`/categories/${encodeURIComponent(coupon.category)}`} className="capitalize underline decoration-primary decoration-2 underline-offset-4">
          {coupon.category}
        </Link>
      ) : (
        "None"
      ),
    ],
    ["Shared by", coupon.username || "Coupo"],
    ["Added", longDate(coupon.createdAt) ?? "Unknown"],
    ["Votes", `${coupon.likes ?? 0} worked, ${coupon.dislikes ?? 0} didn't`],
  ];

  return (
    <>
      <section className="page-container py-10">
        {backLink}
        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,34rem)_1fr] lg:gap-16">
          <div>
            {/* Remount when an admin edit changes the coupon, so the card shows the new values. */}
            <CouponCard key={coupon.updatedAt?.toMillis?.() ?? coupon.id} coupon={coupon} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wider text-base-content/50">{isSocial ? "Social coupon" : "Coupon"}</p>
            <h1 className="mt-2 text-5xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">
              {coupon.discount}% off at <span className="capitalize">{coupon.name}</span>
            </h1>
            {coupon.description && <p className="mt-5 max-w-[60ch] whitespace-pre-line text-lg text-base-content/80">{coupon.description}</p>}
            <dl className="mt-8 grid max-w-lg grid-cols-[7rem_1fr] gap-x-4 gap-y-3 text-base">
              {facts.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-base-content/60">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <ShareCouponButton coupon={coupon} />
              <ReportCouponButton coupon={coupon} />
            </div>
            {isAdmin && (
              <div className="mt-8 rounded-box border-2 border-dashed border-base-300 p-5">
                <p className="mb-3 text-sm font-bold uppercase tracking-wider text-base-content/50">Admin</p>
                <AdminCouponActions coupon={coupon} onDeleted={() => navigate(back.to)} />
              </div>
            )}
          </div>
        </div>
      </section>

      {moreFromBrand.length > 0 && (
        <section className="page-container pb-20">
          <div className="perf-x mb-10 w-full text-base-300" aria-hidden="true" />
          <h2 className="mb-8 text-4xl font-extrabold leading-[1] tracking-tight md:text-5xl">
            More from <span className="capitalize">{coupon.name}</span>
          </h2>
          <CouponGrid coupons={moreFromBrand} />
        </section>
      )}
    </>
  );
};

export default CouponPage;
