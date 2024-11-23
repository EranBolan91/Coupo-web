import { cleanAuthErrorMessage } from "../../utils/utils";
import { UserAuth } from "../AuthProvider";
import authErrors from "../AuthErrors";
import { User } from "firebase/auth";
import toast from "react-hot-toast";

type Props = {
  user: User;
  handleResetTime?: () => void;
};

const ResendEmailButton = ({ user, handleResetTime }: Props) => {
  const { sendEmailVerification } = UserAuth();

  const sendEmailAndRestTime = async () => {
    try {
      toast.success("Email sent");
      await sendEmailVerification(user);
      if (handleResetTime) {
        handleResetTime();
      }
    } catch (error: any) {
      const cleanErrorMsg = cleanAuthErrorMessage(error.message);
      toast.error(authErrors[cleanErrorMsg], { position: "top-center", duration: 2000 });
    }
  };

  return (
    <button className="btn btn-active btn-link" onClick={sendEmailAndRestTime}>
      resend
    </button>
  );
};

export default ResendEmailButton;
