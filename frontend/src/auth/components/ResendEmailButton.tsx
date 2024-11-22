import toast from "react-hot-toast";
import { UserAuth } from "../AuthProvider";
import { User } from "firebase/auth";

type Props = {
  user: User;
  handleResetTime?: () => void;
};

const ResendEmailButton = ({ user, handleResetTime }: Props) => {
  const { sendEmailVerification } = UserAuth();

  const sendEmailAndRestTime = () => {
    try {
      sendEmailVerification(user);
      if (handleResetTime) {
        handleResetTime();
      }
    } catch (error: any) {
      toast.error(error.message, { position: "top-center", duration: 3000 });
    }
  };

  return (
    <button className="btn btn-active btn-link" onClick={sendEmailAndRestTime}>
      resend
    </button>
  );
};

export default ResendEmailButton;
