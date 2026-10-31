import { PiArrowCounterClockwiseBold, PiCheckBold, PiEnvelopeSimpleBold, PiTrashBold, PiUserBold } from "react-icons/pi";
import { deleteFeedback, Feedback, FeedbackType, feedbackTypes, setFeedbackHandled } from "../../database/feedback";
import { useQueryClient } from "@tanstack/react-query";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import { AdminLayout } from "./components/AdminSidebar";
import useFeedback from "../../hooks/useFeedback";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";

const typeLabel = (type: string) => feedbackTypes.find((t) => t.value === type)?.label ?? type;
const when = (item: Feedback) =>
  item.createdAt?.toDate?.().toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) ?? "";

const FeedbackRow = ({ item }: { item: Feedback }) => {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const update = (change: (list: Feedback[]) => Feedback[]) =>
    queryClient.setQueryData<Feedback[]>(["feedback"], (list) => (list ? change(list) : list));

  const toggleHandled = async () => {
    setBusy(true);
    try {
      await setFeedbackHandled(item.id, !item.handled);
      update((list) => list.map((f) => (f.id === item.id ? { ...f, handled: !item.handled } : f)));
    } catch {
      toast.error("Couldn't update the message");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this message? This can't be undone.")) return;
    setBusy(true);
    try {
      await deleteFeedback(item.id);
      update((list) => list.filter((f) => f.id !== item.id));
      toast.success("Message deleted");
    } catch {
      toast.error("Couldn't delete the message");
      setBusy(false);
    }
  };

  return (
    <li className={`rounded-box border border-base-300 bg-base-100 p-4 sm:p-5 ${item.handled ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className={`rounded-full px-3 py-1 font-bold ${item.type === "bug" ? "bg-error text-error-content" : "bg-primary text-primary-content"}`}>
          {typeLabel(item.type)}
        </span>
        <span className="text-base-content/60">{when(item)}</span>
        {item.handled && (
          <span className="flex items-center gap-1 font-semibold text-accent">
            <PiCheckBold className="size-4" aria-hidden />
            Handled
          </span>
        )}
      </div>
      <p className="mt-3 whitespace-pre-line break-words">{item.message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/70">
        {item.email ? (
          <a href={`mailto:${item.email}?subject=${encodeURIComponent("Your message to Coupo")}`} className="link link-hover flex items-center gap-1.5">
            <PiEnvelopeSimpleBold className="size-4" aria-hidden />
            {item.email}
          </a>
        ) : (
          <span>No email</span>
        )}
        <span className="flex items-center gap-1.5">
          <PiUserBold className="size-4" aria-hidden />
          {item.uid ? "Signed in" : "Signed out"}
        </span>
        {item.page.startsWith("/") && !item.page.startsWith("//") && (
          <span>
            From{" "}
            <Link to={item.page} className="link link-hover font-mono">
              {item.page}
            </Link>
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-base-300 pt-4">
        <button type="button" className="btn btn-ghost btn-sm h-10 min-h-10 border-2 border-base-300 px-3" onClick={toggleHandled} disabled={busy}>
          {item.handled ? <PiArrowCounterClockwiseBold className="size-4" aria-hidden /> : <PiCheckBold className="size-4" aria-hidden />}
          {item.handled ? "Mark as new" : "Mark as handled"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm h-10 min-h-10 px-3 text-error" onClick={remove} disabled={busy}>
          <PiTrashBold className="size-4" aria-hidden />
          Delete
        </button>
      </div>
    </li>
  );
};

type Filter = FeedbackType | "all";

// /admin/feedback: messages from the Feedback page, newest first. New ones on top of handled ones.
const AdminFeedback = () => {
  const feedback = useFeedback();
  const [filter, setFilter] = useState<Filter>("all");
  const [showHandled, setShowHandled] = useState(false);

  const all = feedback.data ?? [];
  const items = all
    .filter((f) => (filter === "all" || f.type === filter) && (showHandled || !f.handled))
    .sort((a, b) => Number(a.handled) - Number(b.handled));
  const count = (type: Filter) => all.filter((f) => !f.handled && (type === "all" || f.type === type)).length;

  return (
    <AdminLayout title="Feedback" description="Ideas, missing features, bugs and messages people sent from the Feedback page.">
      {feedback.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-40 rounded-box" />
          ))}
        </div>
      ) : feedback.isError ? (
        <LoadError what="feedback" onRetry={() => feedback.refetch()} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {([{ value: "all", label: "All" }, ...feedbackTypes] as { value: Filter; label: string }[]).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={`btn btn-sm h-10 min-h-10 px-4 ${filter === option.value ? "btn-secondary" : "btn-ghost border-2 border-base-300"}`}
              >
                {option.label}
                <span className="text-xs opacity-70">{count(option.value)}</span>
              </button>
            ))}
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="toggle toggle-sm" checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} />
              Show handled
            </label>
          </div>
          <div className="mt-6">
            {items.length === 0 ? (
              <EmptyState
                title={all.length === 0 ? "No messages yet" : "Nothing new here"}
                description={
                  all.length === 0
                    ? "When someone sends feedback, it shows up here."
                    : "Every message in this list is handled. Turn on Show handled to see them."
                }
              />
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <FeedbackRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminFeedback;
