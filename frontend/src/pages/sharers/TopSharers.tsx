import { PiArrowRightBold, PiTicketBold, PiThumbsUpBold } from "react-icons/pi";
import { Sharer, sharerPath, workedRate } from "../../logic/sharers";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import useShowMore from "../../hooks/useShowMore";
import useSharers from "../../hooks/useSharers";
import SharerAvatar from "./SharerAvatar";
import { Link } from "react-router-dom";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const Stats = ({ sharer }: { sharer: Sharer }) => {
  const rate = workedRate(sharer);
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/70">
      <span className="inline-flex items-center gap-1.5">
        <PiThumbsUpBold className="size-4" aria-hidden />
        {plural(sharer.likes, "like")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <PiTicketBold className="size-4" aria-hidden />
        {plural(sharer.coupons.length, "coupon")}
      </span>
      {rate !== null && <span>{rate}% worked</span>}
    </span>
  );
};

// Top 3 as stamped tickets; #1 is the big one.
const Podium = ({ sharers, myID }: { sharers: Sharer[]; myID?: string }) => (
  <ol className="grid gap-4 md:grid-cols-3">
    {sharers.map((sharer) => (
      <li key={sharer.userID} className={sharer.rank === 1 ? "md:order-2" : sharer.rank === 2 ? "md:order-1 md:mt-8" : "md:order-3 md:mt-14"}>
        <Link
          to={sharerPath(sharer.userID)}
          className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-box border-2 p-6 transition-colors hover:border-base-content ${
            sharer.rank === 1 ? "border-base-content bg-primary text-primary-content" : "border-base-300 bg-base-100"
          }`}
        >
          <span className="stamp absolute right-5 top-5 rotate-6 px-2.5 py-1 text-2xl" aria-label={`Rank ${sharer.rank}`}>
            #{sharer.rank}
          </span>
          <SharerAvatar name={sharer.name} className="size-16 text-2xl" inverted={sharer.rank === 1} />
          <span>
            <span className="block truncate pr-16 font-display text-2xl font-extrabold tracking-tight">
              {sharer.name}
              {sharer.userID === myID && <span className="ml-2 align-middle text-sm font-bold">(you)</span>}
            </span>
            <span className={`mt-2 block ${sharer.rank === 1 ? "[&_*]:!text-current" : ""}`}>
              <Stats sharer={sharer} />
            </span>
          </span>
        </Link>
      </li>
    ))}
  </ol>
);

// /top-sharers: everyone who shared a coupon, ranked by likes received.
const TopSharers = () => {
  const { sharers, isPending, isError, refetch } = useSharers();
  const myID = useCurrentUser()?.userUID;
  const rest = sharers.slice(3);
  const { visible, lastItemRef } = useShowMore(rest, "top-sharers", 20);
  const me = sharers.find((s) => s.userID === myID);

  return (
    <>
      <PageHeader
        title={
          <>
            Top <span className="marker">sharers</span>
          </>
        }
        description="The people whose codes help most. Ranked by likes on the coupons they shared."
        aside={
          me && (
            <Link to={sharerPath(me.userID)} className="btn btn-ghost h-12 min-h-12 border-2 border-base-300 px-5">
              You're #{me.rank}
              <PiArrowRightBold aria-hidden />
            </Link>
          )
        }
      />
      <section className="page-container py-10">
        {isPending ? (
          <div className="grid gap-4 md:grid-cols-3" role="status" aria-label="Loading sharers">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="skeleton h-48 rounded-box" />
            ))}
          </div>
        ) : isError ? (
          <LoadError what="sharers" onRetry={() => refetch()} />
        ) : sharers.length === 0 ? (
          <EmptyState
            title="No sharers yet"
            description="Share a coupon and you'll be the first one here."
            action={
              <Link to="/addcoupon" className="btn btn-primary">
                Share a coupon
              </Link>
            }
          />
        ) : (
          <>
            <Podium sharers={sharers.slice(0, 3)} myID={myID} />
            {rest.length > 0 && (
              <ol className="mt-10 divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
                {visible.map((sharer, i) => (
                  <li key={sharer.userID} ref={i === visible.length - 1 ? (lastItemRef as React.Ref<HTMLLIElement>) : undefined}>
                    <Link to={sharerPath(sharer.userID)} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-base-200">
                      <span className="w-10 shrink-0 font-display text-xl font-extrabold text-base-content/60">#{sharer.rank}</span>
                      <SharerAvatar name={sharer.name} className="size-11 text-base" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">
                          {sharer.name}
                          {sharer.userID === myID && <span className="ml-2 text-sm text-base-content/60">(you)</span>}
                        </span>
                        <Stats sharer={sharer} />
                      </span>
                      <PiArrowRightBold className="size-5 shrink-0 text-base-content/40" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default TopSharers;
