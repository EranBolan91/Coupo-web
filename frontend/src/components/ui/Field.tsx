import React from "react";

interface Props {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  // Right side of the label row (e.g. "Forgot password?").
  labelAside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Label above the control, hint below it, error below that. Use with DaisyUI input/select/textarea.
const Field = ({ label, htmlFor, error, hint, labelAside, children, className = "" }: Props) => (
  <div className={className}>
    <div className="flex items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {labelAside}
    </div>
    {children}
    {hint && !error && <p className="mt-1.5 text-sm text-base-content/60">{hint}</p>}
    {error && (
      <p className="field-error" role="alert">
        {error}
      </p>
    )}
  </div>
);

export default Field;
