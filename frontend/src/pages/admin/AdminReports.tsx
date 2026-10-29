import { dismissReports, Report, reportReasons } from "../../database/reports";
import { useQueryClient } from "@tanstack/react-query";
import useReports from "../../hooks/useReports";
import { collectionsList } from "../../../firebaseCollections";
import AdminCouponRow from "./components/AdminCouponRow";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import useCouponFeed from "../../hooks/useCouponFeed";
import { AdminLayout } from "./components/AdminSidebar";
import { PiCheckBold } from "react-icons/pi";
import toast from "react-hot-toast";
import { useState } from "react";

const reasonLabel = (reason: string) => reportReasons.find((r) => r.value === reason)?.label ?? reason;
const when = (report: Report) =>
  report.createdAt?.toDate?.().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) ?? "";

const DismissButton = ({ couponID }: { couponID: string }) => {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const dismiss = async () => {
    setBusy(true);
    try {
      await dismissReports(couponID);
      toast.success("Reports dismissed");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    } catch {
      toast.error("Couldn't dismiss the reports");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className="btn btn-ghost btn-sm h-10 min-h-10 border-2 border-base-300 px-3" onClick={dismiss} disabled={busy}>
      <PiCheckBold className="size-4" aria-hidden />
      Dismiss reports
    </button>
  );
};

// Reports grouped by coupon, most reported first. Fix or delete the coupon, or dismiss the reports.
const AdminReports = () => {
  const reports = useReports();
  const store = useCouponFeed(collectionsList.coupons);
  const social = useCouponFeed(collectionsList.socialCoupons);
  const coupons = [...(store.data ?? []), ...(social.data ?? [])];

  const groups = Object.values(
    (reports.data ?? []).reduce<Record<string, Report[]>>((all, report) => {
      (all[report.couponID] ??= []).push(report);
      return all;
    }, {})
  ).sort((a, b) => b.length - a.length);

  const isPending = reports.isPending || store.isPending || social.isPending;
  const isError = reports.isError || store.isError || social.isError;

  return (
    <AdminLayout title="Reports" description="Coupons people reported. Fix or delete the coupon, or dismiss the reports if it's fine.">
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-40 rounded-box" />
          ))}
        </div>
      ) : isError ? (
        <LoadError what="reports" onRetry={() => [reports.refetch(), store.refetch(), social.refetch()]} />
      ) : groups.length === 0 ? (
        <EmptyState title="No reports" description="When someone reports a coupon, it shows up here." />
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => {
            const couponID = group[0].couponID;
            const coupon = coupons.find((c) => c.id === couponID);
            const details = (
              <div className="mt-4 border-t border-base-300 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-bold">{group.length === 1 ? "1 report" : `${group.length} reports`}</p>
                  <DismissButton couponID={couponID} />
                </div>
                <ul className="mt-3 space-y-2">
                  {group.map((report) => (
                    <li key={report.id} className="rounded-btn bg-base-200 px-4 py-2.5 text-sm">
                      <span className="font-semibold">{reasonLabel(report.reason)}</span>
                      <span className="text-base-content/60"> · {when(report)}</span>
                      {report.details && <p className="mt-1 whitespace-pre-line text-base-content/80">{report.details}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            );
            return (
              <li key={couponID}>
                {coupon ? (
                  <AdminCouponRow coupon={coupon}>{details}</AdminCouponRow>
                ) : (
                  <div className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
                    <p className="font-display text-lg font-extrabold">Coupon was removed</p>
                    <p className="text-sm text-base-content/60">It's no longer on Coupo, so these reports can be dismissed.</p>
                    {details}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
