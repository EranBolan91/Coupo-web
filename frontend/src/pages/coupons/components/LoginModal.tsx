import Modal from "../../../components/Modal/Modal";
import { LogoMark } from "../../../components/logo/Logo";
import { Link } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  // Why an account is needed.
  message?: string;
}

const LoginModal = ({ open, onClose, message = "Saving and voting on coupons need a free account." }: Props) => {
  return (
    <Modal isOpen={open} onClose={onClose} label="Log in to continue">
      <div className="flex flex-col items-center text-center">
        <LogoMark className="size-14 -rotate-6" />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight">Log in to continue</h2>
        <p className="mt-2 text-base-content/70">{message}</p>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <Link to="/signup" className="btn btn-primary h-12 min-h-12 w-full" onClick={onClose}>
          Create a free account
        </Link>
        <Link to="/login" className="btn btn-ghost h-12 min-h-12 w-full" onClick={onClose}>
          Log in
        </Link>
      </div>
    </Modal>
  );
};

export default LoginModal;
