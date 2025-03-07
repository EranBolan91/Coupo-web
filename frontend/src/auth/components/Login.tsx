import { cleanAuthErrorMessage } from "../../utils/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import ResendEmailButton from "./ResendEmailButton";
import { AuthMSG, UserAuth } from "../AuthProvider";
import { getAuth } from "firebase/auth";
import authErrors from "../AuthErrors";
import toast from "react-hot-toast";
import { useState } from "react";

type LoginForm = {
  email: string;
  password: string;
};

const Login = () => {
  const [displayResendEmail, setDisplayResendEmail] = useState<boolean>(false);
  const { signinWthGoogle, loginUserWithEmailPassword } = UserAuth();
  const [spinner, setSpinner] = useState<boolean>(false);
  const form = useForm<LoginForm>();
  const navigate = useNavigate();
  const auth = getAuth();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const handleSigninWithGoogle = async () => {
    await signinWthGoogle();
    navigate("/profile");
  };

  const handleLoginWithEmailPassword: SubmitHandler<LoginForm> = async (data) => {
    try {
      setSpinner(true);
      const res: AuthMSG = await loginUserWithEmailPassword(data.email, data.password);

      switch (res) {
        case AuthMSG.Good:
          setSpinner(false);
          toast.success("You have successfully logged in", { duration: 1000 });
          await new Promise((resolve) => setTimeout(resolve, 1500));
          navigate("/profile");
          break;
        case AuthMSG.VerifyEmailError:
          toast.error("Please verify your email, check your email", { position: "top-center" });
          setSpinner(false);
          setDisplayResendEmail(true);
          break;
      }
    } catch (error: any) {
      const cleanErrorMsg = cleanAuthErrorMessage(error.message);
      toast.error(authErrors[cleanErrorMsg]);
      setSpinner(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center bg-white px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Login to Coupo
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit(handleLoginWithEmailPassword)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", { required: "Email is required" })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <p style={{ fontStyle: "oblique" }} className="text-red-600">
                {" "}
                {errors?.email?.message}{" "}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <p style={{ fontStyle: "oblique" }} className="text-red-600">
                {" "}
                {errors?.password?.message}{" "}
              </p>
            </div>
            <div>
              <span className="text-gray-900">
                Not registered? <Link to={"/signup"}> click here</Link>
              </span>
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Login
                {spinner && <span className="loading loading-spinner loading-xs ml-3"></span>}
              </button>
            </div>
          </form>
          {displayResendEmail && (
            <span>
              click here to: <ResendEmailButton key={auth.currentUser?.uid} />
            </span>
          )}
          <div className="flex flex-col justify-center items-center text-black">
            <div className="inline-flex items-center justify-center w-full">
              <hr className="w-full h-px my-8 bg-gray-200 border-0" />
              <span className="absolute px-3 font-normal text-black -translate-x-1/2 bg-white left-1/2">
                or continue with
              </span>
            </div>
            <button className="gsi-material-button" onClick={handleSigninWithGoogle}>
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: "block" }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Login with Google</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
