import Modal from "../../../components/Modal/Modal";
import { Link } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LoginModal = ({ open, onClose }: Props) => {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Login Required</h2>
        <p className="text-gray-600 dark:text-gray-300">Please log in to access this feature.</p>
      </div>
      <div className="space-y-4">
        <Link to="/login">
          <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105">
            Log In
          </button>
        </Link>
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default LoginModal;
