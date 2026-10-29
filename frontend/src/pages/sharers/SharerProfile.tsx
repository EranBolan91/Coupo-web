import CouponGrid from "../../components/coupons/CouponGrid";
import { Link, useParams } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import { PiArrowLeftBold } from "react-icons/pi";
import useSharers from "../../hooks/useSharers";
import { workedRate } from "../../logic/sharers";
import SharerAvatar from "./SharerAvatar";

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <div className="flex min-w-[7.5rem] flex-col rounded-box bg-base-200 px-5 py-4">
    <span className="font-display text-4xl font-extrabold leading-none tracking-tight">{value}</span>
    <span className="mt-1.5 text-sm font-semibold text-base-content/60">{label}</span>
  </div>
);

// /users/:userId: a sharer's public page, built from the coupons they shared.
const SharerProfile = () => {
  const { userId = "" } = useParams<{ userId: string }>();
  const { sharers, isPending, isError, refetch } = useSharers();
  const myID = useCurrentUser()?.userUID;
  const sharer = sharers.find((s) => s.userID === userId);

  const backLink = (
    <Link to="/top-sharers" className="btn btn-ghost btn-sm -ml-3 h-10 min-h-10 px-3 text-base-content/70">
      <PiArrowLeftBold className="size-4" aria-hidden />
      Top sharers
    </Link>
  );

  if (isPending || isError || !sharer) {
    return (
      <section className="page-container py-10">
        {backLink}
        <div className="mt-6">
          {isPending ? (
            <div className="skeleton h-40 rounded-box" role="status" aria-label="Loading profile" />
          ) : isError ? (
            <LoadError what="profile" onRetry={() => refetch()} />
          ) : (
            <EmptyState
              title="No shared coupons here"
              description="This person hasn't shared a coupon, or their coupons were removed."
              action={
                <Link to="/top-sharers" className="btn btn-primary">
                  See top sharers
                </Link>
              }
            />
          )}
        </div>
      </section>
    );
  }

  const now = Date.now();
  const active = sharer.coupons.filter((c) => (c.expiry?.toMillis?.() ?? Infinity) >= now);
  const expired = sharer.coupons.filter((c) => (c.expiry?.toMillis?.() ?? Infinity) < now);
  const rate = workedRate(sharer);
  const since = new Date(sharer.firstSharedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <>
      <header className="relative bg-base-100">
        <div className="page-container pt-10">{backLink}</div>
        <div className="page-container flex flex-col gap-6 pb-8 pt-6 md:flex-row md:items-center">
          <SharerAvatar name={sharer.name} className="size-20 -rotate-3 text-3xl md:size-24 md:text-4xl" />
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wider text-base-content/50">
              #{sharer.rank} top sharer{sharer.userID === myID && " · This is you"}
            </p>
            <h1 className="mt-1 truncate text-5xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">{sharer.name}</h1>
            <p className="mt-2 text-base-content/70">Sharing coupons since {since}</p>
          </div>
        </div>
        <div className="page-container flex gap-3 overflow-x-auto pb-10">
          <Stat value={sharer.coupons.length} label="Coupons shared" />
          <Stat value={sharer.likes} label="Likes received" />
          <Stat value={rate === null ? "-" : `${rate}%`} label="Said it worked" />
        </div>
        <div className="perf-x w-full text-base-300" aria-hidden="true" />
      </header>

      <section className="page-container py-10">
        <h2 className="mb-6 text-4xl font-extrabold leading-[1] tracking-tight">Active coupons</h2>
        <CouponGrid
          coupons={active}
          emptyTitle="No active coupons"
          emptyDescription={expired.length ? "Their coupons have all expired." : undefined}
        />
        {expired.length > 0 && (
          <>
            <h2 className="mb-6 mt-14 text-4xl font-extrabold leading-[1] tracking-tight">Expired</h2>
            <CouponGrid coupons={expired} />
          </>
        )}
      </section>
    </>
  );
};

export default SharerProfile;
