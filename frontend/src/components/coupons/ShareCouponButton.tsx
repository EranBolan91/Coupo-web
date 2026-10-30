import { PiCheckBold, PiLinkBold, PiShareNetworkBold, PiWhatsappLogoBold } from "react-icons/pi";
import { couponShareText, couponShareURL } from "../../logic/couponLinks";
import { useEffect, useRef, useState } from "react";
import { Coupon } from "../../types/CouponType";
import toast from "react-hot-toast";

interface Props {
  coupon: Coupon;
  className?: string;
  // Icon-only button for coupon cards; the menu then opens upwards so it stays inside the ticket.
  compact?: boolean;
}

// Phones with a share sheet get it straight away (WhatsApp, Telegram, ...).
// Elsewhere (desktop) a small menu offers WhatsApp (wa.me with a ready-made message) or copying the link.
const usesShareSheet = () =>
  typeof navigator !== "undefined" && !!navigator.share && window.matchMedia?.("(pointer: coarse)").matches;

const ShareCouponButton = ({ coupon, className = "", compact = false }: Props) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const text = couponShareText(coupon);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const copyLink = async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(couponShareURL(coupon, "share"));
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const onClick = async () => {
    if (!usesShareSheet()) {
      setOpen((isOpen) => !isOpen);
      return;
    }
    try {
      await navigator.share({ title: text, text, url: couponShareURL(coupon, "share") });
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") setOpen(true); // share sheet failed: offer the menu instead
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${couponShareURL(coupon, "whatsapp")}`)}`;
  const icon = copied ? <PiCheckBold className="size-5 text-accent" aria-hidden /> : <PiShareNetworkBold className="size-5" aria-hidden />;

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? `Share ${coupon.name} coupon` : undefined}
        title={compact ? "Share" : undefined}
        className={
          compact
            ? `btn btn-ghost btn-sm btn-square h-10 min-h-10 w-10 ${className}`
            : `btn btn-ghost h-12 min-h-12 border-2 border-base-300 px-5 ${className}`
        }
      >
        {icon}
        {!compact && (copied ? "Link copied" : "Share")}
      </button>
      {open && (
        <ul
          role="menu"
          className={`menu absolute left-0 z-50 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg ${
            compact ? "bottom-full mb-1" : "top-full mt-2"
          }`}
        >
          <li role="none">
            <a role="menuitem" href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              <PiWhatsappLogoBold className="size-5" aria-hidden /> WhatsApp
            </a>
          </li>
          <li role="none">
            <button type="button" role="menuitem" onClick={copyLink}>
              <PiLinkBold className="size-5" aria-hidden /> Copy link
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default ShareCouponButton;
