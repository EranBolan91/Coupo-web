import { SiGnuprivacyguard } from "react-icons/si";
import { Link, useLocation } from "react-router-dom";
import { MdAddCircleOutline } from "react-icons/md";
import { BsArrowLeftCircle } from "react-icons/bs";
import { RiLogoutBoxLine } from "react-icons/ri";
import { UserAuth } from "../auth/AuthProvider";
import { CgProfile } from "react-icons/cg";
import { IoMdHome } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import { useState } from "react";
import Avatar from "./Avatar";
import toast from "react-hot-toast";
// import Logo from "../assets/images/logo.svg";
// import HamburgerButton from "./HamburgerMenuButton/HamburgerButton";

const Menus = [
  {
    id: "home",
    title: "Home",
    path: "/",
    src: <IoMdHome />,
    gap: "false",
  },
  {
    id: "profile",
    title: "Profile",
    path: "/profile",
    src: <CgProfile />,
    gap: "false",
  },
  {
    id: "addCoupon",
    title: "Add Coupon",
    path: "/addcoupon",
    src: <MdAddCircleOutline />,
    gap: "false",
  },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const { user, logout } = UserAuth();

  const handleLogout = async () => {
    if (user) {
      await logout();
      toast("You have logged out. Byebye", { icon: "👏" });
    }
  };

  return (
    <>
      <div
        style={{ zIndex: "100" }}
        className={`${
          open ? "w-60" : "w-fit"
        } hidden sm:block relative h-screen duration-300 bg-gray-100 border-r border-gray-200 dark:border-gray-600 p-5 dark:bg-slate-800`}
      >
        <BsArrowLeftCircle
          className={`${
            !open && "rotate-180"
          } absolute text-3xl bg-white fill-slate-800  rounded-full cursor-pointer top-9 -right-4 dark:fill-gray-400 dark:bg-gray-800`}
          onClick={() => setOpen(!open)}
        />
        <Link to="/">
          <div className={`flex ${open && "gap-x-4"} items-center`}>
            <img src={""} alt="" className="pl-2" />
            {open && (
              <span className="text-xl font-medium whitespace-nowrap dark:text-white">
                Coupo
              </span>
            )}
          </div>
        </Link>

        <ul className="pt-6">
          {Menus.map((menu, index) => (
            <Link to={menu.path} key={index}>
              <li
                id={menu.id}
                className={`flex items-center gap-x-6 p-3 text-base font-normal rounded-lg cursor-pointer dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700
                        ${menu.gap ? "mt-9" : "mt-2"} ${
                  location.pathname === menu.path &&
                  "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {user ? (
                  <Avatar imgURL={user.photoURL} />
                ) : (
                  <span className="text-2xl">{menu.src}</span>
                )}
                <span
                  className={`${
                    !open && "hidden"
                  } origin-left duration-300 hover:block`}
                >
                  {menu.title}
                </span>
              </li>
              {!open && (
                <Tooltip anchorSelect={`#${menu.id}`} place="right">
                  {" "}
                  {menu.title}
                </Tooltip>
              )}
            </Link>
          ))}
          {user ? (
            <Link to={""}>
              <li
                id="logout"
                onClick={() => handleLogout()}
                className={`flex items-center ${
                  open ? "" : "justify-center"
                } gap-x-6 p-3 text-base font-normal rounded-lg cursor-pointer dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 mt-2`}
              >
                <span className="text-2xl">
                  <RiLogoutBoxLine />
                </span>
                <span
                  className={`${
                    !open && "hidden"
                  } origin-left duration-300 hover:block`}
                >
                  Logout
                </span>
              </li>
              {!open && (
                <Tooltip anchorSelect="#logout" place="right">
                  {" "}
                  Logout
                </Tooltip>
              )}
            </Link>
          ) : (
            <Link to={"/login"}>
              <li
                id="login"
                className={`flex items-center gap-x-6 p-3 text-base font-normal rounded-lg cursor-pointer dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 mt-2`}
              >
                <span className="text-2xl">
                  <SiGnuprivacyguard />
                </span>
                <span
                  className={`${
                    !open && "hidden"
                  } origin-left duration-300 hover:block`}
                >
                  Login
                </span>
              </li>
              {!open && (
                <Tooltip anchorSelect="#login" place="right">
                  {" "}
                  Login
                </Tooltip>
              )}
            </Link>
          )}
        </ul>
      </div>
      {/* Mobile Menu */}
      <div className="pt-0">
        {/* <HamburgerButton
          setMobileMenu={setMobileMenu}
          mobileMenu={mobileMenu}
        /> */}
      </div>
      <div className="sm:hidden">
        <div
          className={`${
            mobileMenu ? "flex" : "hidden"
          } absolute z-50 flex-col items-center self-end py-8 mt-16 space-y-6 font-bold sm:w-auto left-6 right-6 dark:text-white  bg-gray-50 dark:bg-slate-800 drop-shadow md rounded-xl`}
        >
          {Menus.map((menu, index) => (
            <Link
              to={menu.path}
              key={index}
              onClick={() => setMobileMenu(false)}
            >
              <span
                className={` ${
                  location.pathname === menu.path &&
                  "bg-gray-200 dark:bg-gray-700"
                } p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700`}
              >
                {menu.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
