import Modal from "../../../components/Modal/Modal";
import { LogoMark } from "../../../components/logo/Logo";
import { Link } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LoginModal = ({ open, onClose }: Props) => {
  return (
    <Modal isOpen={open} onClose={onClose} label="Log in to continue">
      <div className="mb-6 flex flex-col items-center text-center">
        <LogoMark className="mb-4 size-10" />
        <h2 className="text-2xl font-bold">Log in to continue</h2>
        <p className="mt-2 text-base-content/70">Voting and saving coupons need a free account.</p>
      </div>
      <div className="flex flex-col gap-3">
        <Link to="/login" className="btn btn-primary w-full" onClick={onClose}>
          Log in
        </Link>
        <Link to="/signup" className="btn btn-ghost w-full" onClick={onClose}>
          Create an account
        </Link>
      </div>
    </Modal>
  );
};

export default LoginModal;
