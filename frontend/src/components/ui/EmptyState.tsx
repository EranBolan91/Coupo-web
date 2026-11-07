import { LogoMark } from "../logo/Logo";
import React from "react";

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({ title, description, action }: Props) => (
  <div className="flex flex-col items-center rounded-box border-2 border-dashed border-base-300 bg-base-100/60 px-6 py-14 text-center">
    <LogoMark className="size-16 -rotate-6" blink />
    <h2 className="mt-5 text-2xl font-black tracking-tight">{title}</h2>
    {description && <p className="mt-2 max-w-sm text-base-content/70">{description}</p>}
    {action && <div className="mt-7">{action}</div>}
  </div>
);

export default EmptyState;
