import { PiTicketBold } from "react-icons/pi";
import React from "react";

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({ title, description, action }: Props) => (
  <div className="flex flex-col items-center rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-14 text-center">
    <PiTicketBold className="size-10 text-base-content/30" aria-hidden />
    <h2 className="mt-4 text-lg font-bold">{title}</h2>
    {description && <p className="mt-1 max-w-sm text-sm text-base-content/70">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
