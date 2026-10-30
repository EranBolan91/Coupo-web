import PasswordInput from "../../../auth/components/ui/PasswordInput";
import { UserAuth } from "../../../auth/AuthProvider";
import Field from "../../../components/ui/Field";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const errorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

// "Password" panel on the profile's Account tab.
const ChangePassword = ({ email }: { email: string }) => {
  const { hasPassword, changePassword, resetPassword } = UserAuth();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordForm>();

  const sendResetLink = async () => {
    try {
      await resetPassword(email);
      toast.success(`We sent a reset link to ${email}`);
    } catch {
      toast.error("Couldn't send the email. Please try again.");
    }
  };

  const onSubmit = async (data: PasswordForm) => {
    setSaving(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      reset();
      toast.success("Password changed");
    } catch (error) {
      const code = errorCode(error);
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError("currentPassword", { message: "That's not your current password" });
      } else if (code === "auth/too-many-requests") {
        toast.error("Too many tries. Wait a few minutes and try again.");
      } else if (code === "auth/weak-password" || code === "auth/password-does-not-meet-requirements") {
        setError("newPassword", { message: "Choose a stronger password" });
      } else {
        toast.error("Couldn't change your password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8 rounded-box bg-base-100 px-6 py-6">
      <h2 className="text-2xl font-extrabold tracking-tight">Password</h2>

      {!hasPassword() ? (
        <p className="mt-2 text-base-content/70">
          You sign in with Google, so your password is managed by your Google account.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid max-w-md gap-5" noValidate>
          <Field
            label="Current password"
            htmlFor="currentPassword"
            error={errors.currentPassword?.message}
            labelAside={
              <button
                type="button"
                onClick={sendResetLink}
                className="text-sm font-semibold text-base-content/70 hover:text-base-content hover:underline"
              >
                Forgot it?
              </button>
            }
          >
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              {...register("currentPassword", { required: "Enter your current password" })}
            />
          </Field>

          <Field
            label="New password"
            htmlFor="newPassword"
            error={errors.newPassword?.message}
            hint="At least 8 characters, with a number and an uppercase letter."
          >
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword", {
                required: "Enter a new password",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
                pattern: {
                  value: /^(?=.*\d)(?=.*[A-Z])/,
                  message: "Password must contain at least one number and one uppercase letter",
                },
                validate: (value) => value !== watch("currentPassword") || "Choose a different password from your current one",
              })}
            />
          </Field>

          <Field label="Confirm new password" htmlFor="confirmNewPassword" error={errors.confirmPassword?.message}>
            <PasswordInput
              id="confirmNewPassword"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (value) => value === watch("newPassword") || "Passwords don't match",
              })}
            />
          </Field>

          <div>
            <button type="submit" className="btn btn-primary h-12 min-h-12 px-6" disabled={saving}>
              {saving && <span className="loading loading-spinner loading-sm" aria-hidden />}
              Change password
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default ChangePassword;
