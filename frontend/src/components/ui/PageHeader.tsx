import React from "react";

interface Props {
  title: React.ReactNode;
  description?: string;
  // Controls under the text (search bar, buttons).
  children?: React.ReactNode;
  // Optional content on the right side on large screens.
  aside?: React.ReactNode;
}

// Top of a page: big display title, one-line description, optional controls. Ends in a perforation line.
const PageHeader = ({ title, description, children, aside }: Props) => (
  <header className="relative bg-base-100">
    <div className="page-container flex flex-col gap-8 pb-10 pt-12 md:pb-14 md:pt-16 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">{title}</h1>
        {description && <p className="mt-4 max-w-[52ch] text-lg text-base-content/70">{description}</p>}
        {children && <div className="mt-7 max-w-xl">{children}</div>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
    <div className="perf-x w-full text-base-300" aria-hidden="true" />
  </header>
);

export default PageHeader;
