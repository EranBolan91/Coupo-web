import { Link } from "react-router-dom";
import { UserAuth } from "../auth/AuthProvider";
import toast from "react-hot-toast";

type Props = {
  imgURL: string;
  width?: string;
  height?: string;
};

const Avatar = (props: Props) => {
  const { user, logout } = UserAuth();

  const handleLogout = async () => {
    if (user) {
      await logout();
      toast("You have logged out. Byebye", { icon: "👏" });
    }
  };
  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar"
      >
        <div className="w-10 rounded-full">
          <img alt="Tailwind CSS Navbar component" src={props.imgURL} />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
      >
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
