import PersonalInfo from "./components/PersonalInfo/PersonalInfo";
import ExpireCoupons from "./components/ExpireCoupons";
import { UserAuth } from "../../auth/AuthProvider";
import MyCoupons from "./components/MyCoupons";
import Wishlist from "./components/Wishlist";
import { Link } from "react-router-dom";
import Tabs from "./components/Tabs";
import { User } from "firebase/auth";

const Profile = () => {
  const { user }: { user: User } = UserAuth();
  const tabs = [
    {
      label: "Personal Info",
      content: <PersonalInfo userUID={user.uid} />,
    },
    {
      label: "My Coupons",
      content: <MyCoupons />,
    },
    {
      label: "Wishlist",
      content: <Wishlist />,
    },
    {
      label: "Expire Coupons",
      content: <ExpireCoupons />,
    },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-background">
      <div className="flex justify-between items-center border-b-2 p-3 w-full">
        <h1 className="text-primary">Hi, {user.displayName}</h1>
        <Link to="/addcoupon">
          <button className="btn">Add coupon</button>
        </Link>
      </div>
      <div className="flex-grow">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
};

export default Profile;
