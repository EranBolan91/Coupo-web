import { authErrorMessage } from "../../utils/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "./ui/PasswordInput";
import ResendEmailButton from "./ResendEmailButton";
import { AuthMSG, UserAuth } from "../AuthProvider";
import GoogleButton from "./ui/GoogleButton";
import AuthLayout from "./ui/AuthLayout";
import OrDivider from "./ui/OrDivider";
import Field from "../../components/ui/Field";
import authErrors from "../AuthErrors";
import toast from "react-hot-toast";
import { useState } from "react";

type LoginForm = {
  email: string;
  password: string;
};

const Login = () => {
  const [needsVerification, setNeedsVerification] = useState<boolean>(false);
  const { signinWthGoogle, loginUserWithEmailPassword, resetPassword } = UserAuth();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    getValues,
    setError,
    formState: { errors },
  } = useForm<LoginForm>();

  const handleSigninWithGoogle = async () => {
    await signinWthGoogle();
    navigate("/profile");
  };

  const handleLogin: SubmitHandler<LoginForm> = async (data) => {
    setSubmitting(true);
    try {
      const res: AuthMSG = await loginUserWithEmailPassword(data.email, data.password);
      if (res === AuthMSG.Good) {
        toast.success("Welcome back");
        navigate("/profile");
      } else if (res === AuthMSG.VerifyEmailError) {
        setNeedsVerification(true);
      }
    } catch (error) {
      toast.error(authErrorMessage(error, authErrors));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues("email");
    if (!email) {
      setError("email", { message: "Enter your email first, then click Forgot password" });
      return;
    }
    try {
      await resetPassword(email);
      toast.success(`If ${email} has an account, a reset link is on its way`);
    } catch (error) {
      toast.error(authErrorMessage(error, authErrors));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={
        <>
          New to Coupo?{" "}
          <Link to="/signup" className="font-bold text-base-content underline decoration-primary decoration-[3px] underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton onClick={handleSigninWithGoogle} />
      <OrDivider />

      <form className="space-y-5" onSubmit={handleSubmit(handleLogin)} noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input input-bordered h-12 w-full bg-base-100"
            aria-invalid={!!errors.email}
            {...register("email", { required: "Email is required" })}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          labelAside={
            <button type="button" onClick={handleForgotPassword} className="text-sm font-semibold text-base-content/70 hover:text-base-content hover:underline">
              Forgot password?
            </button>
          }
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password", { required: "Password is required" })}
          />
        </Field>

        {needsVerification && (
          <div role="alert" className="rounded-box border-2 border-warning/40 bg-warning/10 p-4 text-sm">
            <p className="font-semibold">Please verify your email first.</p>
            <p className="mt-1 text-base-content/75">
              We sent you a link when you signed up. Didn't get it? <ResendEmailButton />
            </p>
          </div>
        )}

        <button type="submit" className="btn btn-primary h-12 min-h-12 w-full text-base" disabled={submitting}>
          {submitting && <span className="loading loading-spinner loading-sm" aria-hidden />}
          Log in
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
