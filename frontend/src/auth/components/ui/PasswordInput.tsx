import { PiEyeBold, PiEyeSlashBold } from "react-icons/pi";
import React, { forwardRef, useState } from "react";

// Password input with a show/hide button. Forwards the ref so react-hook-form's register() works.
const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        className={`input input-bordered h-12 w-full bg-base-100 pr-12 ${props.className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <PiEyeSlashBold className="size-5" aria-hidden /> : <PiEyeBold className="size-5" aria-hidden />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
