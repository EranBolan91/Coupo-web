import { cleanAuthErrorMessage } from "../../utils/utils";
import { UserAuth } from "../AuthProvider";
import { getAuth } from "firebase/auth";
import authErrors from "../AuthErrors";
import toast from "react-hot-toast";

type Props = {
  handleResetTime?: () => void;
};

const ResendEmailButton = ({ handleResetTime }: Props) => {
  const { sendEmailVerification } = UserAuth();
  const auth = getAuth();

  const sendEmailAndRestTime = async () => {
    try {
      await sendEmailVerification(auth.currentUser!);
      if (handleResetTime) {
        handleResetTime();
      }
      toast.success("Email sent");
    } catch (error: any) {
      const cleanErrorMsg = cleanAuthErrorMessage(error.message);
      toast.error(authErrors[cleanErrorMsg], { position: "top-center", duration: 2000 });
    }
  };

  return (
    <span className="btn-link cursor-pointer hover:text-primary" onClick={sendEmailAndRestTime}>
      resend
    </span>
  );
};

export default ResendEmailButton;
