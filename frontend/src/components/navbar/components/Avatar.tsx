import { PiChatCircleTextBold, PiSignOutBold, PiTicketBold, PiUserBold, PiUserCircleFill } from "react-icons/pi";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { UserAuth } from "../../../auth/AuthProvider";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

type Props = {
  imgURL: string | null;
};

// Account menu in the navbar (desktop).
const Avatar = ({ imgURL }: Props) => {
  const { logout } = UserAuth();
  const userDocument = useCurrentUser();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    if (userDocument) {
      await logout();
      toast.success("You're logged out");
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar" aria-label="Account menu">
        <div className="size-9 rounded-full bg-base-200">
          {imgURL ? (
            <img alt="" src={imgURL} />
          ) : (
            <PiUserCircleFill className="size-9 text-base-content/40" aria-hidden />
          )}
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content z-50 mt-3 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
      >
        {userDocument && (
          <li className="menu-title truncate normal-case">
            {userDocument.firstName} {userDocument.lastName}
          </li>
        )}
        <li>
          <Link to="/profile">
            <PiUserBold aria-hidden /> Profile
          </Link>
        </li>
        <li>
          <Link to="/addcoupon">
            <PiTicketBold aria-hidden /> Share a coupon
          </Link>
        </li>
        <li>
          <Link to="/feedback" state={{ from: pathname }}>
            <PiChatCircleTextBold aria-hidden /> Send feedback
          </Link>
        </li>
        <li>
          <button type="button" onClick={handleLogout}>
            <PiSignOutBold aria-hidden /> Log out
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Avatar;
