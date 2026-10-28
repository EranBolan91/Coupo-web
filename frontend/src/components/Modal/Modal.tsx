import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PiXBold } from "react-icons/pi";
import React, { useEffect, useId } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // Visible heading. When omitted, pass `label` so screen readers still get a name.
  title?: string;
  description?: React.ReactNode;
  label?: string;
  // Buttons row at the bottom.
  footer?: React.ReactNode;
  size?: "md" | "lg";
}

// The app's one dialog: backdrop, Escape / backdrop click to close, spring-in panel.
const Modal = ({ isOpen, onClose, children, title, description, label, footer, size = "md" }: Props) => {
  const reduceMotion = useReducedMotion();
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-neutral/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : label}
            initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-box bg-base-100 p-6 shadow-2xl sm:rounded-box sm:p-8 ${
              size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4"
              aria-label="Close"
            >
              <PiXBold className="size-5" aria-hidden />
            </button>
            {title && (
              <div className="mb-6 pr-10">
                <h2 id={titleId} className="text-3xl font-extrabold leading-tight tracking-tight">
                  {title}
                </h2>
                {description && <p className="mt-2 text-base-content/70">{description}</p>}
              </div>
            )}
            {children}
            {footer && <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
