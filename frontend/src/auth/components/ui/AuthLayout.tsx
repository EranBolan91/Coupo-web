import { LogoMark } from "../../../components/logo/Logo";
import React from "react";

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

// Login / signup screen: form on the left, a lime brand panel on the right (large screens).
const AuthLayout = ({ title, subtitle, children }: Props) => (
  <div className="grid min-h-[calc(100dvh-4.25rem)] lg:grid-cols-2">
    <div className="flex items-center justify-center bg-base-100 px-4 py-12 sm:px-8">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight">{title}</h1>
        {subtitle && <p className="mt-3 text-base-content/70">{subtitle}</p>}
        <div className="mt-9">{children}</div>
      </div>
    </div>

    <aside className="relative hidden overflow-hidden bg-primary text-primary-content lg:flex lg:flex-col lg:justify-between lg:p-14">
      <LogoMark className="size-14 -rotate-6 [&_path]:!stroke-primary-content" />
      <span
        className="pointer-events-none absolute -bottom-24 -right-10 select-none font-display text-[26rem] font-extrabold leading-none opacity-[0.08]"
        aria-hidden="true"
      >
        %
      </span>
      <div className="relative">
        <p className="font-display text-6xl font-extrabold leading-[0.92] tracking-[-0.04em] xl:text-7xl">
          Your next discount is one code away.
        </p>
        <ul className="mt-8 space-y-3 text-lg font-semibold">
          <li>Copy codes in one tap</li>
          <li>Save coupons for later</li>
          <li>Vote so good codes rise to the top</li>
        </ul>
      </div>
    </aside>
  </div>
);

export default AuthLayout;
