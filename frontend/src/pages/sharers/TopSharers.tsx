import { PiArrowRightBold, PiCopyBold, PiStarFill, PiTicketBold, PiThumbsUpBold } from "react-icons/pi";
import { Sharer, sharerPath, workedRate } from "../../logic/sharers";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import useShowMore from "../../hooks/useShowMore";
import useSharers from "../../hooks/useSharers";
import SharerAvatar from "./SharerAvatar";
import { Link, useSearchParams } from "react-router-dom";
import { useMonthLeaderboard } from "../../hooks/useSharerStats";
import { SharerStats, monthName } from "../../logic/points";
import type React from "react";

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
type Entry = { userID: string; name: string; rank: number; stats: React.ReactNode };

const Podium = ({ sharers, myID }: { sharers: Entry[]; myID?: string }) => (
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
              {sharer.stats}
            </span>
          </span>
        </Link>
      </li>
    ))}
  </ol>
);

const MonthStats = ({ stats }: { stats: SharerStats }) => (
  <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/70">
    <span className="inline-flex items-center gap-1.5 font-bold text-base-content">
      <PiStarFill className="size-4" aria-hidden />
      {plural(stats.monthPoints, "point")}
    </span>
    <span className="inline-flex items-center gap-1.5">
      <PiCopyBold className="size-4" aria-hidden />
      {stats.monthCopies} copied
    </span>
    <span className="inline-flex items-center gap-1.5">
      <PiThumbsUpBold className="size-4" aria-hidden />
      {stats.monthWorked} worked
    </span>
  </span>
);

const Rows = ({ entries, myID, lastItemRef }: { entries: Entry[]; myID?: string; lastItemRef?: React.Ref<HTMLLIElement> }) => (
  <ol className="mt-10 divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
    {entries.map((sharer, i) => (
      <li key={sharer.userID} ref={i === entries.length - 1 ? lastItemRef : undefined}>
        <Link to={sharerPath(sharer.userID)} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-base-200">
          <span className="w-10 shrink-0 font-display text-xl font-extrabold text-base-content/60">#{sharer.rank}</span>
          <SharerAvatar name={sharer.name} className="size-11 text-base" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">
              {sharer.name}
              {sharer.userID === myID && <span className="ml-2 text-sm text-base-content/60">(you)</span>}
            </span>
            {sharer.stats}
          </span>
          <PiArrowRightBold className="size-5 shrink-0 text-base-content/40" aria-hidden />
        </Link>
      </li>
    ))}
  </ol>
);

const Loading = () => (
  <div className="grid gap-4 md:grid-cols-3" role="status" aria-label="Loading sharers">
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="skeleton h-48 rounded-box" />
    ))}
  </div>
);

const shareAction = (
  <Link to="/addcoupon" className="btn btn-primary">
    Share a coupon
  </Link>
);

// This month: SharerStats ranked by points earned this month.
const MonthBoard = ({ myID }: { myID?: string }) => {
  const { data = [], isPending, isError, refetch } = useMonthLeaderboard();
  const entries: Entry[] = data.map((stats, i) => ({ userID: stats.userID, name: stats.name, rank: i + 1, stats: <MonthStats stats={stats} /> }));
  if (isPending) return <Loading />;
  if (isError) return <LoadError what="sharers" onRetry={() => refetch()} />;
  if (entries.length === 0) {
    return (
      <EmptyState
        title={`Nobody has points in ${monthName()} yet`}
        description='Share a code. Every copy and every "it worked" earns you points.'
        action={shareAction}
      />
    );
  }
  return (
    <>
      <Podium sharers={entries.slice(0, 3)} myID={myID} />
      {entries.length > 3 && <Rows entries={entries.slice(3)} myID={myID} />}
    </>
  );
};

// All time: everyone who shared a coupon, ranked by likes received.
const AllTimeBoard = ({ myID }: { myID?: string }) => {
  const { sharers, isPending, isError, refetch } = useSharers();
  const toEntry = (sharer: Sharer): Entry => ({ userID: sharer.userID, name: sharer.name, rank: sharer.rank, stats: <Stats sharer={sharer} /> });
  const rest = sharers.slice(3);
  const { visible, lastItemRef } = useShowMore(rest, "top-sharers", 20);
  if (isPending) return <Loading />;
  if (isError) return <LoadError what="sharers" onRetry={() => refetch()} />;
  if (sharers.length === 0) {
    return <EmptyState title="No sharers yet" description="Share a coupon and you'll be the first one here." action={shareAction} />;
  }
  return (
    <>
      <Podium sharers={sharers.slice(0, 3).map(toEntry)} myID={myID} />
      {rest.length > 0 && <Rows entries={visible.map(toEntry)} myID={myID} lastItemRef={lastItemRef as React.Ref<HTMLLIElement>} />}
    </>
  );
};

// /top-sharers: this month's points (default) or all-time likes (?period=all).
const TopSharers = () => {
  const [params, setParams] = useSearchParams();
  const allTime = params.get("period") === "all";
  const myID = useCurrentUser()?.userUID;
  const month = useMonthLeaderboard();
  const { sharers } = useSharers();
  const myRank = allTime
    ? sharers.find((s) => s.userID === myID)?.rank
    : (month.data ?? []).findIndex((s) => s.userID === myID) + 1 || undefined;

  const tab = (label: string, all: boolean) => (
    <button
      type="button"
      role="tab"
      aria-selected={allTime === all}
      onClick={() => setParams(all ? { period: "all" } : {}, { replace: true })}
      className={`btn btn-sm h-10 min-h-10 px-5 ${allTime === all ? "btn-secondary" : "btn-ghost"}`}
    >
      {label}
    </button>
  );

  return (
    <>
      <PageHeader
        title={
          <>
            Top <span className="marker">sharers</span>
          </>
        }
        description={
          allTime
            ? "The people whose codes help most. Ranked by likes on the coupons they shared."
            : `Points earned in ${monthName()}: 1 when someone copies your code, 5 when someone says it worked.`
        }
        aside={
          myID &&
          myRank && (
            <Link to={sharerPath(myID)} className="btn btn-ghost h-12 min-h-12 border-2 border-base-300 px-5">
              You're #{myRank}
              <PiArrowRightBold aria-hidden />
            </Link>
          )
        }
      />
      <section className="page-container py-10">
        <div role="tablist" aria-label="Leaderboard period" className="mb-8 inline-flex gap-1 rounded-btn bg-base-100 p-1.5">
          {tab("This month", false)}
          {tab("All time", true)}
        </div>
        {allTime ? <AllTimeBoard myID={myID} /> : <MonthBoard myID={myID} />}
      </section>
    </>
  );
};

export default TopSharers;
