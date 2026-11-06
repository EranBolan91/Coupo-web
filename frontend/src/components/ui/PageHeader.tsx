import React from "react";

interface Props {
  title: React.ReactNode;
  description?: string;
  // Controls under the text (search bar, buttons).
  children?: React.ReactNode;
  // Optional content on the right side on large screens.
  aside?: React.ReactNode;
}

// Top of a page: big rounded display title, one-line description, optional controls, on a white
// panel with rounded bottom corners that sits on the cloud-blue page.
const PageHeader = ({ title, description, children, aside }: Props) => (
  <header className="relative rounded-b-[2rem] bg-base-100 shadow-soft dark:shadow-none md:rounded-b-[3rem]">
    <div className="page-container flex flex-col gap-7 pb-9 pt-8 md:pb-14 md:pt-14 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-[2.6rem] font-black leading-[1] tracking-[-0.03em] md:text-6xl">{title}</h1>
        <div className="wave mt-4 h-2 w-20 text-secondary" aria-hidden="true" />
        {description && <p className="mt-4 max-w-[52ch] text-lg text-base-content/70">{description}</p>}
        {children && <div className="mt-7 max-w-xl">{children}</div>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  </header>
);

export default PageHeader;
