import { PiEnvelopeSimpleOpenBold } from "react-icons/pi";
import ResendEmailButton from "./ResendEmailButton";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";

// Shown after email sign-up: "check your inbox", with a resend link after a 60 s cooldown.
const EmailRegistration = () => {
  const [seconds, setSeconds] = useState<number>(60);
  const email = getAuth().currentUser?.email;

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div className="text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-content">
        <PiEnvelopeSimpleOpenBold className="size-8" aria-hidden />
      </span>
      <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Check your inbox</h2>
      <p className="mt-3 text-base-content/75">
        We sent a verification link to <span className="font-bold text-base-content">{email ?? "your email"}</span>. Click it, then log in.
      </p>
      <p className="mt-6 text-sm text-base-content/70" aria-live="polite">
        {seconds > 0 ? <>You can resend the email in {seconds}s</> : <>No email? <ResendEmailButton handleResetTime={() => setSeconds(60)} /></>}
      </p>
      <Link to="/login" className="btn btn-secondary mt-8 h-12 min-h-12 w-full">
        Go to log in
      </Link>
    </div>
  );
};

export default EmailRegistration;
