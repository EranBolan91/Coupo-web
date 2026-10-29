import { hasReported, reportCoupon, ReportReason, reportReasons } from "../../database/reports";
import LoginModal from "../../pages/coupons/components/LoginModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { PiCheckBold, PiFlagBold } from "react-icons/pi";
import { Coupon } from "../../types/CouponType";
import Modal from "../Modal/Modal";
import toast from "react-hot-toast";
import { useState } from "react";

// "Report this coupon": one report per user per coupon, read only by admins.
const ReportCouponButton = ({ coupon }: { coupon: Coupon }) => {
  const userDocument = useCurrentUser();
  const uid = userDocument?.userUID;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();

  const { data: reported = false } = useQuery({
    queryKey: ["myReport", coupon.id, uid],
    queryFn: () => hasReported(coupon.id, uid as string),
    enabled: !!uid,
  });

  const close = () => {
    setOpen(false);
    setError(undefined);
  };

  const send = async () => {
    if (!uid) return;
    if (!reason) return setError("Choose what's wrong");
    if (reason === "other" && !details.trim()) return setError("Tell us what's wrong");
    setSending(true);
    try {
      await reportCoupon(coupon, uid, reason, details);
      queryClient.setQueryData(["myReport", coupon.id, uid], true);
      toast.success("Thanks, we'll take a look");
      close();
    } catch {
      toast.error("Couldn't send the report. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (reported) {
    return (
      <p className="flex h-12 items-center gap-2 px-1 text-sm font-semibold text-base-content/60">
        <PiCheckBold className="size-4 text-accent" aria-hidden />
        You reported this coupon
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost h-12 min-h-12 px-4 text-base-content/70 hover:text-base-content"
        onClick={() => (uid ? setOpen(true) : setLoginOpen(true))}
      >
        <PiFlagBold className="size-5" aria-hidden />
        Report
      </button>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} message="Reporting a coupon needs a free account." />
      <Modal
        isOpen={open}
        onClose={close}
        title="Report this coupon"
        description={
          <>
            {coupon.name}, code <span className="font-mono font-bold text-base-content">{coupon.code}</span>. Only the Coupo team sees reports.
          </>
        }
        footer={
          <>
            <button type="button" className="btn btn-ghost h-12 min-h-12" onClick={close}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary h-12 min-h-12" onClick={send} disabled={sending}>
              {sending && <span className="loading loading-spinner loading-sm" aria-hidden />}
              Send report
            </button>
          </>
        }
      >
        <fieldset>
          <legend className="field-label">What's wrong?</legend>
          <div className="mt-1 space-y-2">
            {reportReasons.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-btn border-2 px-4 py-3 font-semibold transition-colors ${
                  reason === option.value ? "border-base-content bg-base-200" : "border-base-300 hover:border-base-content/40"
                }`}
              >
                <input
                  type="radio"
                  name={`reason-${coupon.id}`}
                  value={option.value}
                  checked={reason === option.value}
                  onChange={() => {
                    setReason(option.value);
                    setError(undefined);
                  }}
                  className="radio radio-sm"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5">
          <label htmlFor={`report-details-${coupon.id}`} className="field-label">
            Details {reason !== "other" && <span className="font-normal text-base-content/60">(optional)</span>}
          </label>
          <textarea
            id={`report-details-${coupon.id}`}
            rows={3}
            maxLength={500}
            className="textarea textarea-bordered w-full bg-base-100 text-base"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </Modal>
    </>
  );
};

export default ReportCouponButton;
