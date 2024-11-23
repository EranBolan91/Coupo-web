import { MdOutlineNotificationsNone } from "react-icons/md";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);

  // const { data } = useQuery({
  //   queryKey: ["notifications"],
  //   queryFn: () => {},
  // });

  const togglePopup = () => setIsOpen(!isOpen);

  return (
    <div className="relative inline-block">
      <MdOutlineNotificationsNone fontSize={"1.7rem"} onClick={togglePopup} />
      <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
        3
      </span>
      {isOpen && (
        <div className="absolute left-3/4 top-full mt-2 -translate-x-1/4 w-40 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <p className="text-sm text-gray-700">Hello, this is your pop-up content!</p>
          <p className="text-sm text-gray-700">Hello, this is your pop-up content!</p>
          <p className="text-sm text-gray-700">Hello, this is your pop-up content!</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
