import { useForm, SubmitHandler } from "react-hook-form";
import { authErrorMessage } from "../../utils/utils";
import EmailRegistration from "./EmailRegistration";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "./ui/PasswordInput";
import Field from "../../components/ui/Field";
import GoogleButton from "./ui/GoogleButton";
import { UserAuth } from "../AuthProvider";
import AuthLayout from "./ui/AuthLayout";
import OrDivider from "./ui/OrDivider";
import authErrors from "../AuthErrors";
import toast from "react-hot-toast";
import { useState } from "react";

type SignUpForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthday: Date;
};

const SignUp = () => {
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const { signinWthGoogle, createUserWithEmailPassword } = UserAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>();

  const handleSigninWithGoogle = async () => {
    await signinWthGoogle();
    navigate("/profile");
  };

  const handleSignUp: SubmitHandler<SignUpForm> = async (data) => {
    setLoading(true);
    try {
      await createUserWithEmailPassword(data.email, data.password, data.fullName, data.birthday);
      setEmailSent(true);
    } catch (error) {
      toast.error(authErrorMessage(error, authErrors));
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout title="Almost there">
        <EmailRegistration />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Join Coupo"
      subtitle={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-base-content underline decoration-primary decoration-[3px] underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <GoogleButton onClick={handleSigninWithGoogle} label="Sign up with Google" />
      <OrDivider />

      <form className="space-y-5" onSubmit={handleSubmit(handleSignUp)} noValidate>
        <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className="input input-bordered h-12 w-full bg-base-100"
            aria-invalid={!!errors.fullName}
            {...register("fullName", { required: "Full name is required" })}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
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
          <Field label="Date of birth" htmlFor="birthday" error={errors.birthday?.message}>
            <input
              id="birthday"
              type="date"
              autoComplete="bday"
              className="input input-bordered h-12 w-full bg-base-100"
              aria-invalid={!!errors.birthday}
              {...register("birthday", { required: "Date of birth is required" })}
            />
          </Field>
        </div>

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 8 characters, with a number and an uppercase letter."
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              pattern: {
                value: /^(?=.*\d)(?=.*[A-Z])/,
                message: "Password must contain at least one number and one uppercase letter",
              },
            })}
          />
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === watch("password") || "Passwords don't match",
            })}
          />
        </Field>

        <button type="submit" className="btn btn-primary h-12 min-h-12 w-full text-base" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-sm" aria-hidden />}
          Create account
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
