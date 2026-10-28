import { authErrorMessage } from "../../utils/utils";
import { UserAuth } from "../AuthProvider";
import { getAuth } from "firebase/auth";
import authErrors from "../AuthErrors";
import toast from "react-hot-toast";

type Props = {
  handleResetTime?: () => void;
  label?: string;
};

const ResendEmailButton = ({ handleResetTime, label = "Send it again" }: Props) => {
  const { sendEmailVerification } = UserAuth();
  const auth = getAuth();

  const resend = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      handleResetTime?.();
      toast.success("Verification email sent");
    } catch (error) {
      toast.error(authErrorMessage(error, authErrors));
    }
  };

  return (
    <button type="button" className="font-bold underline decoration-primary decoration-[3px] underline-offset-4" onClick={resend}>
      {label}
    </button>
  );
};

export default ResendEmailButton;
