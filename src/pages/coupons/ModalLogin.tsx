import { Link } from "react-router-dom";

interface Props {
  onClose: () => void;
}

const ModalLogin = ({ onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="relative mx-auto p-5 border w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl shadow-lg rounded-md bg-white animate-fadeIn">
        <div className="mt-3 text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl leading-6 font-medium text-gray-900">
            Login Required
          </h3>
          <div className="mt-2 px-2 sm:px-4 md:px-7 py-3">
            <p className="text-sm sm:text-base text-gray-500">
              You need to be logged in to vote on coupons.
            </p>
          </div>
          <div className="items-center px-2 sm:px-4 py-3">
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-500 text-white text-sm sm:text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Go to Login
            </Link>
          </div>
          <button
            onClick={() => {
              const modal = document.querySelector(".animate-fadeIn");
              if (modal) {
                modal.classList.remove("animate-fadeIn");
                modal.classList.add("animate-fadeOut");
                setTimeout(onClose, 300); // Wait for animation to complete before closing
              }
            }}
            className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-sm sm:text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLogin;
