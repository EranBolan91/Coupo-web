import React from "react";

interface Props {
  title: string;
  description?: string;
  // Optional controls under the text (search bar, buttons).
  children?: React.ReactNode;
}

// Top of a page: title, one-line description and optional controls. Same on every page.
const PageHeader = ({ title, description, children }: Props) => (
  <div className="border-b border-base-300 bg-base-100">
    <div className="page-container py-10 md:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-[60ch] text-base-content/70">{description}</p>}
      {children && <div className="mt-6 max-w-xl">{children}</div>}
    </div>
  </div>
);

export default PageHeader;
