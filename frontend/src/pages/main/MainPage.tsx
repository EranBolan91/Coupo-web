import { PiArrowRightBold, PiCopyBold, PiMagnifyingGlassBold, PiPlusBold, PiThumbsUpBold } from "react-icons/pi";
import { getCategories, getCouponsBrands, getLatestCoupons } from "../../database/databaseCalls";
import CouponCard, { CouponCardSkeleton } from "../coupons/components/CouponCard";
import CouponGrid from "../../components/coupons/CouponGrid";
import { motion, useReducedMotion } from "motion/react";
import Reveal from "../../components/motion/Reveal";
import { useQuery } from "@tanstack/react-query";
import { Coupon } from "../../types/CouponType";
import { Link } from "react-router-dom";

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
    className="flex min-h-[13.5rem] flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed border-base-content/25 bg-base-100/60 p-6 text-center backdrop-blur-sm transition-colors hover:border-base-content/50"
  >
    <PiPlusBold className="size-6" aria-hidden />
    <span className="font-display text-xl font-extrabold">Your coupon here</span>
    <span className="text-sm text-base-content/70">Share a code you found</span>
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
    <div className="relative mx-auto grid w-full max-w-md gap-4 lg:block lg:h-[29rem] lg:max-w-none">
      {slots.map((slot, i) => {
        const [position, rotation] = layout[i];
        const isFront = i === slots.length - 1;
        return (
          <motion.div
            key={typeof slot === "string" ? `${slot}-${i}` : slot.id}
            className={`${position} ${isFront ? "" : "hidden sm:block"} lg:absolute`}
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

const MainPage = () => {
  const { data: latest = [], isPending: latestLoading, isError: latestError, refetch: refetchLatest } = useQuery({
    queryKey: ["latestCoupons"],
    queryFn: () => getLatestCoupons(12),
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-base-100">
        <span
          className="pointer-events-none absolute -right-16 -top-24 select-none font-display text-[28rem] font-extrabold leading-none text-base-content/[0.035] lg:text-[40rem]"
          aria-hidden="true"
        >
          %
        </span>
        <div className="page-container relative grid items-center gap-12 pb-16 pt-12 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-20">
          <div>
            <h1 className="text-[3.4rem] font-extrabold leading-[0.92] tracking-[-0.04em] sm:text-7xl lg:text-[5.6rem]">
              Find the code.
              <br />
              Keep the <span className="marker">change.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-base-content/75 md:text-xl">
              Coupon codes shared by real shoppers and checked by votes. Free for everyone.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/coupons" className="btn btn-primary btn-lg h-14 min-h-14 px-7 text-base">
                Browse coupons
                <PiArrowRightBold aria-hidden />
              </Link>
              <Link to="/addcoupon" className="btn btn-ghost btn-lg h-14 min-h-14 border-2 border-base-content/15 px-7 text-base hover:border-base-content/30">
                Share a coupon
              </Link>
            </div>
          </div>
          <HeroTickets coupons={latest} loading={latestLoading} />
        </div>
      </section>

      {/* Brands marquee */}
      {marqueeItems.length > 0 && (
        <section className="border-y border-base-300 bg-base-100 py-6" aria-label="Brands on Coupo">
          <div className="group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
            <ul className="flex shrink-0 animate-marquee items-center gap-12 pr-12 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
              {marqueeItems.map((brand, i) => (
                <li key={`${brand.brand}-${i}`} className="shrink-0">
                  <img
                    src={brand.imgURL}
                    alt={i < brandLogos.length ? brand.brand : ""}
                    loading="lazy"
                    className="h-10 w-28 rounded-lg bg-white object-contain p-1.5 grayscale transition hover:grayscale-0"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* How it works: one long ticket, three stubs */}
      <section className="page-container py-20">
        <Reveal>
          <h2 className="max-w-xl text-4xl font-extrabold leading-[1] tracking-tight md:text-5xl">
            Three taps between you and a discount.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ol className="mt-10 grid overflow-hidden rounded-box bg-base-100 shadow-[0_10px_30px_rgb(16_17_14/0.06)] md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative p-7 md:p-9">
                {i > 0 && (
                  <>
                    <span className="perf-x absolute inset-x-6 top-0 w-auto text-base-300 md:hidden" aria-hidden="true" />
                    <span className="perf-y absolute inset-y-6 left-0 hidden text-base-300 md:block" aria-hidden="true" />
                  </>
                )}
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-content">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-3xl font-extrabold tracking-tight">{title}</h3>
                <p className="mt-2 text-base-content/70">{text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Biggest discounts */}
      <section className="page-container pb-20">
        <Reveal className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-4xl font-extrabold leading-[1] tracking-tight md:text-5xl">Biggest discounts</h2>
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

      {/* Categories */}
      {categories.length > 0 && (
        <section className="page-container pb-20">
          <Reveal>
            <h2 className="text-4xl font-extrabold leading-[1] tracking-tight md:text-5xl">Shop by category</h2>
            <ul className="mt-8 flex flex-wrap gap-3">
              {[...categories]
                .sort((a, b) => a.localeCompare(b))
                .slice(0, 14)
                .map((category) => (
                  <li key={category}>
                    <Link
                      to={`/categories/${encodeURIComponent(category)}`}
                      className="group inline-flex h-14 items-center gap-3 rounded-btn border-2 border-base-300 bg-base-100 pl-6 pr-3 font-display text-xl font-extrabold capitalize tracking-tight transition-colors hover:border-base-content hover:bg-primary hover:text-primary-content"
                    >
                      {category}
                      <span className="flex size-8 items-center justify-center rounded-full bg-base-200 transition-colors group-hover:bg-primary-content group-hover:text-primary">
                        <PiArrowRightBold className="size-4" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </Reveal>
        </section>
      )}

      {/* Share band */}
      <section className="edge-scallop bg-primary text-primary-content">
        <div className="page-container flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center md:py-20">
          <h2 className="max-w-2xl text-4xl font-extrabold leading-[1] tracking-tight md:text-6xl">
            Found a code that works? Pass it on.
          </h2>
          <Link to="/addcoupon" className="btn btn-secondary btn-lg h-14 min-h-14 shrink-0 px-7 text-base">
            Share a coupon
            <PiArrowRightBold aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
};

export default MainPage;
