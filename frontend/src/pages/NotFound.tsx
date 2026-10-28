import { PiArrowLeftBold } from "react-icons/pi";
import { LogoMark } from "../components/logo/Logo";
import { Link } from "react-router-dom";

const NotFound = () => (
  <section className="page-container flex min-h-[70dvh] flex-col items-start justify-center py-20">
    <LogoMark className="size-16 rotate-12" />
    <p className="mt-8 font-display text-[7rem] font-extrabold leading-none tracking-[-0.06em] sm:text-[11rem]">
      4<span className="marker">0</span>4
    </p>
    <h1 className="mt-10 text-4xl font-extrabold tracking-tight">This page expired.</h1>
    <p className="mt-2 max-w-md text-lg text-base-content/70">The link may be old or mistyped. The coupons are still where you left them.</p>
    <Link to="/" className="btn btn-primary mt-8 h-12 min-h-12 px-6">
      <PiArrowLeftBold aria-hidden />
      Back home
    </Link>
  </section>
);

export default NotFound;
