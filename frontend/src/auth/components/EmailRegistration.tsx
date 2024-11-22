import ResendEmailButton from "./ResendEmailButton";
import { useEffect, useState } from "react";
import { UserAuth } from "../AuthProvider";
import { Link } from "react-router-dom";
import { User } from "@firebase/auth";

const EmailRegistration = () => {
  const [seconds, setSeconds] = useState<number>(60);
  const { user }: { user: User } = UserAuth();

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div className="card w-full md:w-[480px] h-96 p-7 md:p-12 shadow-xl text-center justify-around m-auto">
      <div className="my-2">
        <h6 className="font-bold text-xl md:text-2xl text-black mb-2">E-mail Registration</h6>
        <span className="my-1">
          Email registration email has been successfully sent, please check the email and click the
          link.
        </span>
      </div>
      <input
        disabled
        type="text"
        placeholder="Type here"
        className="input input-bordered input-md w-full"
      />
      <div className="flex justify-center">
        <span>
          Resend email:
          {seconds !== 0 ? `(${seconds})` : <ResendEmailButton key={user.uid} user={user} />}
        </span>
      </div>
      <Link to={"/login"}>
        <button className="btn btn-neutral">Back to login</button>
      </Link>
    </div>
  );
};

export default EmailRegistration;
