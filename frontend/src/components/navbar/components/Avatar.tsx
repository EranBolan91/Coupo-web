import { Link } from "react-router-dom";
import { UserAuth } from "../../../auth/AuthProvider";
import toast from "react-hot-toast";

type Props = {
  imgURL: string | null;
  width?: string;
  height?: string;
};

const Avatar = (props: Props) => {
  const { userDocument, logout } = UserAuth();

  const handleLogout = async () => {
    if (userDocument) {
      await logout();
      toast("You have logged out. Byebye", { icon: "👏" });
    }
  };
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          {props.imgURL !== null ? (
            <img alt="Profile" src={props.imgURL} />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          )}
        </div>
      </div>
      <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/addCoupon">Add Coupon</Link>
        </li>
        <li>
          <Link to="" onClick={() => handleLogout()}>
            Logout
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Avatar;
