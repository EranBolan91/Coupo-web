import { LogoMark } from "../../../components/logo/Logo";
import React from "react";

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

// Login / signup screen: form on the left, a hippo-blue brand panel on the right (large screens).
const AuthLayout = ({ title, subtitle, children }: Props) => (
  <div className="grid min-h-[calc(100dvh-4.5rem)] gap-4 lg:grid-cols-2 lg:p-4">
    <div className="flex items-center justify-center rounded-b-[2rem] bg-base-100 px-4 py-12 shadow-soft dark:shadow-none sm:px-8 lg:rounded-[2.5rem]">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-black leading-[1] tracking-tight">{title}</h1>
        {subtitle && <p className="mt-3 text-base-content/70">{subtitle}</p>}
        <div className="mt-9">{children}</div>
      </div>
    </div>

    <aside className="relative hidden overflow-hidden rounded-[2.5rem] bg-brand text-white dark:bg-brand-deep lg:flex lg:flex-col lg:justify-end lg:p-14">
      <LogoMark className="pointer-events-none absolute -right-10 -top-6 size-72 rotate-12" blink />
      <div className="relative">
        <p className="font-display text-6xl font-black leading-[0.98] tracking-[-0.03em] xl:text-7xl">
          Your next discount is <span className="marker">one code</span> away.
        </p>
        <ul className="mt-8 space-y-3 text-lg font-semibold opacity-90">
          <li>Copy codes in one tap</li>
          <li>Save coupons for later</li>
          <li>Vote so good codes rise to the top</li>
        </ul>
      </div>
    </aside>
  </div>
);

export default AuthLayout;
