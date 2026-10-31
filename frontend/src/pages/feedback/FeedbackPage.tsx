import { PiBugBold, PiCheckCircleFill, PiEnvelopeSimpleBold, PiLightbulbBold, PiPlusCircleBold } from "react-icons/pi";
import { FeedbackType, feedbackTypes, isValidEmail, MAX_EMAIL, MAX_MESSAGE, MIN_MESSAGE, sendFeedback } from "../../database/feedback";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import PageHeader from "../../components/ui/PageHeader";
import Field from "../../components/ui/Field";
import { IconType } from "react-icons";
import { useState } from "react";

const icons: Record<FeedbackType, IconType> = {
  idea: PiLightbulbBold,
  missing: PiPlusCircleBold,
  bug: PiBugBold,
  contact: PiEnvelopeSimpleBold,
};

const placeholders: Record<FeedbackType, string> = {
  idea: "What would make Coupo better for you?",
  missing: "A store, a feature, a filter... what are you looking for?",
  bug: "What happened, and what did you expect to happen?",
  contact: "How can we help?",
};

const isFeedbackType = (value: string | null): value is FeedbackType => feedbackTypes.some((t) => t.value === value);

// One message per 30 seconds from the same browser, so a double click or a bot doesn't flood the inbox.
const COOLDOWN_MS = 30_000;
const COOLDOWN_KEY = "coupo-feedback-sent";
const lastSent = () => {
  try {
    return Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
  } catch {
    return 0;
  }
};
const markSent = () => {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // Private mode: no cooldown, that's fine.
  }
};

// "Tell us what you think": ideas, missing features, bugs and contact messages, read by admins on /admin/feedback.
// Link here with state={{ from: pathname }} so the message says which page it came from, and ?type= to preselect a type.
const FeedbackPage = () => {
  const userDocument = useCurrentUser();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type");
  const state = location.state as { from?: string } | null;
  const from = state?.from && state.from !== "/feedback" ? state.from : "";

  const [type, setType] = useState<FeedbackType>(isFeedbackType(initialType) ? initialType : "idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(userDocument?.email ?? "");
  // Hidden from people; bots that fill every field get a fake "sent".
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<{ message?: string; email?: string; form?: string }>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (message.trim().length < MIN_MESSAGE) next.message = "Write a few words so we know what you mean";
    if (email.trim() && !isValidEmail(email.trim())) next.email = "That email doesn't look right";
    if (type === "contact" && !email.trim()) next.email = "Add your email so we can reply";
    if (!next.message && !next.email && Date.now() - lastSent() < COOLDOWN_MS) next.form = "You just sent a message. Wait a few seconds and try again.";
    setErrors(next);
    if (Object.keys(next).length) return;

    if (website) {
      setSent(true);
      return;
    }
    setSending(true);
    try {
      await sendFeedback({ type, message, email, page: from, uid: userDocument?.userUID ?? null });
      markSent();
      setSent(true);
    } catch {
      setErrors({ form: "Couldn't send your message. Check your connection and try again." });
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setMessage("");
    setErrors({});
    setSent(false);
  };

  return (
    <>
      <PageHeader
        title={
          <>
            Tell us what <span className="marker">you think</span>
          </>
        }
        description="Got an idea, missing something, or found a bug? We read every message."
      />
      <div className="page-container max-w-3xl py-10 md:py-14">
        {sent ? (
          <div className="rounded-box border border-base-300 bg-base-100 p-8 text-center sm:p-12" role="status">
            <PiCheckCircleFill className="mx-auto size-14 text-accent" aria-hidden />
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Thanks, we got it</h2>
            <p className="mx-auto mt-2 max-w-sm text-base-content/70">
              {email.trim() ? "If we have a question, we'll write to you." : "Every message helps us make Coupo better."}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" className="btn btn-ghost h-12 min-h-12 border-2 border-base-300" onClick={reset}>
                Send another
              </button>
              <Link to="/coupons" className="btn btn-primary h-12 min-h-12">
                Browse coupons
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-7 rounded-box border border-base-300 bg-base-100 p-5 sm:p-8">
            <fieldset>
              <legend className="field-label">What's it about?</legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {feedbackTypes.map((option) => {
                  const Icon = icons[option.value];
                  const active = type === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-btn border-2 px-4 py-3 font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                        active ? "border-base-content bg-base-200" : "border-base-300 hover:border-base-content/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedback-type"
                        value={option.value}
                        checked={active}
                        onChange={() => setType(option.value)}
                        className="sr-only"
                      />
                      <Icon className={`size-5 shrink-0 ${active ? "text-accent" : "text-base-content/60"}`} aria-hidden />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <Field label="Your message" htmlFor="feedback-message" error={errors.message}>
              <textarea
                id="feedback-message"
                rows={6}
                maxLength={MAX_MESSAGE}
                placeholder={placeholders[type]}
                className="textarea textarea-bordered w-full bg-base-100 text-base"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={!!errors.message}
              />
            </Field>

            <Field
              label={type === "contact" ? "Your email" : "Your email (optional)"}
              htmlFor="feedback-email"
              error={errors.email}
              hint="Only if you'd like an answer. We won't use it for anything else."
            >
              <input
                id="feedback-email"
                type="email"
                autoComplete="email"
                maxLength={MAX_EMAIL}
                className="input input-bordered h-12 w-full bg-base-100 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
            </Field>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="feedback-website">Website</label>
              <input id="feedback-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            {errors.form && (
              <p className="field-error" role="alert">
                {errors.form}
              </p>
            )}

            <button type="submit" className="btn btn-primary h-12 min-h-12 w-full sm:w-auto sm:px-8" disabled={sending}>
              {sending && <span className="loading loading-spinner loading-sm" aria-hidden />}
              Send message
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default FeedbackPage;
