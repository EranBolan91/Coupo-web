import { PiArrowRightBold, PiCopyBold, PiMagnifyingGlassBold, PiPlusBold, PiThumbsUpBold } from "react-icons/pi";
import { getCategories, getCouponsBrands, getLatestCoupons } from "../../database/databaseCalls";
import { isExpired } from "../../logic/couponFilters";
import CouponCard, { CouponCardSkeleton } from "../coupons/components/CouponCard";
import CouponGrid from "../../components/coupons/CouponGrid";
import { motion, useReducedMotion } from "motion/react";
import Reveal from "../../components/motion/Reveal";
import { useQuery } from "@tanstack/react-query";
import { Coupon } from "../../types/CouponType";
import { Link, useNavigate } from "react-router-dom";
import { LogoMark } from "../../components/logo/Logo";
import { FormEvent, useState } from "react";
import { useMonthLeaderboard } from "../../hooks/useSharerStats";
import SharerAvatar from "../sharers/SharerAvatar";
import { sharerPath } from "../../logic/sharers";
import { monthName } from "../../logic/points";

// Fan positions on large screens, back to front: [position, rotation].
const fanLayouts: Record<number, [string, string][]> = {
  1: [["lg:top-16 lg:inset-x-8", "lg:-rotate-2"]],
  2: [
    ["lg:top-0 lg:left-16 lg:right-0", "lg:rotate-[5deg]"],
    ["lg:top-32 lg:left-0 lg:right-14", "lg:-rotate-[3deg]"],
  ],
  3: [
    ["lg:top-0 lg:left-20 lg:right-0", "lg:rotate-[6deg]"],
    ["lg:top-24 lg:left-0 lg:right-16", "lg:-rotate-[5deg]"],
    ["lg:top-48 lg:left-10 lg:right-6", "lg:rotate-[1deg]"],
  ],
};

// Placeholder slot in the hero fan when there are fewer than 3 coupons: an invitation, not fake data.
const EmptyTicket = () => (
  <Link
    to="/addcoupon"
    className="flex min-h-[13.5rem] flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed border-white/40 bg-white/10 p-6 text-center text-white transition-colors hover:border-white/80"
  >
    <PiPlusBold className="size-6" aria-hidden />
    <span className="font-display text-xl font-black">Your coupon here</span>
    <span className="text-sm opacity-80">Share a code you found</span>
  </Link>
);

const HeroTickets = ({ coupons, loading }: { coupons: Coupon[]; loading: boolean }) => {
  const reduceMotion = useReducedMotion();
  // Up to 3 real coupons; with fewer than 3, one invitation slot sits behind them.
  const real = coupons.slice(0, 3);
  const slots: (Coupon | "empty" | "loading")[] = loading
    ? ["loading", "loading"]
    : real.length < 3
    ? ["empty", ...real]
    : [...real].reverse();
  const layout = fanLayouts[slots.length];

  return (
    <div className="relative mx-auto hidden w-full lg:block lg:h-[29rem]">
      {slots.map((slot, i) => {
        const [position, rotation] = layout[i];
        return (
          <motion.div
            key={typeof slot === "string" ? `${slot}-${i}` : slot.id}
            className={`${position} absolute`}
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Rotation lives on an inner element: motion owns the outer transform. */}
            <div className={`transition-transform duration-500 hover:rotate-0 ${rotation}`}>
              {slot === "loading" ? (
                <CouponCardSkeleton />
              ) : slot === "empty" ? (
                <EmptyTicket />
              ) : (
                <CouponCard coupon={slot} />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const steps = [
  { icon: PiMagnifyingGlassBold, title: "Find", text: "Search a brand or browse by category." },
  { icon: PiCopyBold, title: "Copy", text: "One tap copies the code. Paste it at checkout." },
  { icon: PiThumbsUpBold, title: "Vote", text: "Tell everyone if it worked. Good codes rise." },
];

// Hero search: sends the text to the Coupons page (/coupons?q=...), which does the searching.
const HeroSearch = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = text.trim();
    navigate(query ? `/coupons?q=${encodeURIComponent(query)}` : "/coupons");
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="mt-7 flex max-w-lg items-center gap-1 rounded-btn bg-base-100 p-1.5 text-base-content shadow-lift focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-secondary"
    >
      <label className="flex h-12 min-w-0 grow items-center gap-3 pl-4">
        <PiMagnifyingGlassBold className="size-5 shrink-0 text-base-content/60" aria-hidden />
        <span className="sr-only">Search coupons</span>
        <input
          type="search"
          className="w-full min-w-0 grow border-0 bg-transparent p-0 text-base placeholder:text-base-content/55 focus:outline-none focus:ring-0"
          placeholder="Search brands and codes"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-secondary h-12 min-h-12 shrink-0 px-6 text-base">
        Search
      </button>
    </form>
  );
};

// Home page: the top 5 sharers by points this month.
const MonthTopSharers = () => {
  const { data = [], isPending, isError } = useMonthLeaderboard();
  if (isError) return null;
  const top = data.slice(0, 5);
  return (
    <section className="page-container pb-14 md:pb-20">
      <Reveal className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-[2.1rem] font-black leading-[1.02] tracking-tight md:text-5xl">Top sharers this month</h2>
        <Link to="/top-sharers" className="btn btn-ghost btn-sm h-10 min-h-10 shrink-0 px-4">
          See all
          <PiArrowRightBold aria-hidden />
        </Link>
      </Reveal>
      {isPending ? (
        <div className="skeleton h-40 rounded-box" role="status" aria-label="Loading top sharers" />
      ) : top.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-box border-2 border-dashed border-base-300 bg-base-100/60 p-7 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-base-content/70">
            Nobody has points in {monthName()} yet. Share a code: you get a point each time someone copies it and 5 when it works for them.
          </p>
          <Link to="/addcoupon" className="btn btn-primary shrink-0">
            <PiPlusBold aria-hidden />
            Share a coupon
          </Link>
        </div>
      ) : (
        <ol className="grid gap-3 md:grid-cols-5">
          {top.map((sharer, i) => (
            <li key={sharer.userID}>
              <Link
                to={sharerPath(sharer.userID)}
                className={`flex h-full items-center gap-3 rounded-box p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift md:flex-col md:items-start ${
                  i === 0 ? "bg-primary text-primary-content shadow-soft" : "surface"
                }`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full font-display text-lg font-black ${
                    i === 0 ? "bg-secondary text-secondary-content" : "bg-base-200"
                  }`}
                >
                  {i + 1}
                </span>
                <SharerAvatar name={sharer.name} className="size-11 text-base" inverted={i === 0} />
                <span className="min-w-0">
                  <span className="block truncate font-bold">{sharer.name}</span>
                  <span className={`block text-sm ${i === 0 ? "" : "text-base-content/70"}`}>
                    {sharer.monthPoints} {sharer.monthPoints === 1 ? "point" : "points"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

const MainPage = () => {
  const { data: latest = [], isPending: latestLoading, isError: latestError, refetch: refetchLatest } = useQuery({
    queryKey: ["latestCoupons"],
    // Fetch extra so there are still 12 left after leaving out expired coupons.
    queryFn: async () => (await getLatestCoupons(40)).filter((coupon) => !isExpired(coupon)).slice(0, 12),
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: getCouponsBrands });

  const biggestDiscounts = [...latest].sort((a, b) => Number(b.discount) - Number(a.discount)).slice(0, 3);
  const brandLogos = brands.filter((brand) => brand.imgURL);
  // Repeat the list so the marquee track is always wider than the screen.
  const marqueeItems = brandLogos.length
    ? Array.from({ length: Math.max(2, Math.ceil(12 / brandLogos.length)) * 2 }, () => brandLogos).flat()
    : [];

  return (
    <>
      {/* Hero: hippo-blue panel with the search front and center; the hippo peeks up from the bottom. */}
      <section className="relative overflow-hidden rounded-b-[2.5rem] bg-brand text-white dark:bg-brand-deep md:rounded-b-[3.5rem]">
        <LogoMark
          className="pointer-events-none absolute -bottom-6 right-3 size-32 -rotate-12 sm:right-10 sm:size-40 lg:bottom-10 lg:left-[46%] lg:right-auto lg:size-28 lg:rotate-6"
          blink
        />
        <div className="page-container relative grid items-center gap-10 pb-36 pt-8 sm:pb-44 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24">
          <div>
            <h1 className="text-[3.1rem] font-black leading-[1.04] tracking-[-0.035em] sm:text-7xl lg:text-[5.4rem]">
              Find the code.
              <br />
              Keep the <span className="marker">change.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg opacity-90 md:text-xl">
              Coupon codes shared by real shoppers and checked by votes. Free for everyone.
            </p>
            <HeroSearch />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/coupons" className="btn h-12 min-h-12 border-0 bg-base-100 px-6 text-base text-base-content hover:bg-base-100/90">
                Browse coupons
                <PiArrowRightBold aria-hidden />
              </Link>
              <Link
                to="/addcoupon"
                className="btn btn-ghost h-12 min-h-12 border-2 border-white/40 px-6 text-base text-white hover:border-white/80 hover:bg-white/10"
              >
                Share a coupon
              </Link>
            </div>
          </div>
          <HeroTickets coupons={latest} loading={latestLoading} />
        </div>
      </section>

      {/* Brands marquee */}
      {marqueeItems.length > 0 && (
        <section className="py-8" aria-label="Brands on Coupo">
          <div className="group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
            <ul className="flex shrink-0 animate-marquee items-center gap-12 pr-12 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
              {marqueeItems.map((brand, i) => (
                <li key={`${brand.brand}-${i}`} className="shrink-0">
                  <img
                    src={brand.imgURL}
                    alt={i < brandLogos.length ? brand.brand : ""}
                    loading="lazy"
                    className="h-12 w-28 rounded-2xl bg-white object-contain p-2 shadow-soft"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* How it works: three steps joined by a wavy line */}
      <section className="page-container py-14 md:py-20">
        <Reveal>
          <h2 className="max-w-xl text-4xl font-black leading-[1.02] tracking-tight md:text-5xl">
            Three taps between you and a <span className="marker">discount.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ol className="surface mt-8 grid gap-0 md:mt-10 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative flex gap-4 p-6 md:flex-col md:p-8">
                {i > 0 && (
                  <span className="wave absolute inset-x-6 top-0 h-1.5 text-base-300 md:hidden" aria-hidden="true" />
                )}
                <span
                  className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${
                    i === 1 ? "bg-secondary text-secondary-content" : "bg-primary text-primary-content"
                  } ${i === 0 ? "-rotate-6" : i === 2 ? "rotate-6" : ""}`}
                >
                  <Icon className="size-7" aria-hidden />
                </span>
                <span>
                  <h3 className="text-2xl font-black tracking-tight md:mt-2 md:text-3xl">{title}</h3>
                  <p className="mt-1 text-base-content/70">{text}</p>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Biggest discounts */}
      <section className="page-container pb-14 md:pb-20">
        <Reveal className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-[2.1rem] font-black leading-[1.02] tracking-tight md:text-5xl">Biggest discounts</h2>
          <Link to="/coupons" className="btn btn-ghost btn-sm h-10 min-h-10 shrink-0 px-4">
            See all
            <PiArrowRightBold aria-hidden />
          </Link>
        </Reveal>
        <CouponGrid
          coupons={biggestDiscounts}
          isLoading={latestLoading}
          isError={latestError}
          onRetry={() => refetchLatest()}
          skeletonCount={3}
          emptyTitle="No coupons yet"
          emptyDescription="Be the first to share one."
        />
      </section>

      <MonthTopSharers />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="page-container pb-14 md:pb-20">
          <Reveal>
            <h2 className="text-[2.1rem] font-black leading-[1.02] tracking-tight md:text-5xl">Shop by category</h2>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {[...categories]
                .sort((a, b) => a.localeCompare(b))
                .slice(0, 14)
                .map((category) => (
                  <li key={category}>
                    <Link
                      to={`/categories/${encodeURIComponent(category)}`}
                      className="group inline-flex h-12 items-center gap-3 rounded-btn bg-base-100 pl-5 pr-2 font-display text-lg font-black capitalize tracking-tight shadow-soft transition-colors hover:bg-primary hover:text-primary-content dark:shadow-none dark:ring-1 dark:ring-base-300"
                    >
                      {category}
                      <span className="flex size-8 items-center justify-center rounded-full bg-base-200 transition-[transform,background-color,color] duration-300 group-hover:translate-x-0.5 group-hover:bg-secondary group-hover:text-secondary-content">
                        <PiArrowRightBold className="size-4" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </Reveal>
        </section>
      )}

      {/* Share band: deal-yellow card with the hippo */}
      <section className="page-container pb-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-secondary text-secondary-content md:rounded-[3rem]">
          <LogoMark className="pointer-events-none absolute -bottom-8 -right-4 size-36 -rotate-12 md:right-10 md:size-52" />
          <div className="relative flex flex-col items-start gap-7 px-6 pb-36 pt-10 md:flex-row md:items-center md:justify-between md:px-14 md:py-16 md:pr-72">
            <h2 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
              Found a code that works? Pass it on.
            </h2>
            <Link to="/addcoupon" className="btn btn-primary btn-lg h-14 min-h-14 shrink-0 px-7 text-base">
              Share a coupon
              <PiArrowRightBold aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default MainPage;
