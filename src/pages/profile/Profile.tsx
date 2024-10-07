import PersonalInfo from "./components/PersonalInfo/PersonalInfo";
import { UserAuth } from "../../auth/AuthProvider";
import { Link } from "react-router-dom";
import Table from "./components/Table";
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
      content: <Table />,
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
      <Tabs tabs={tabs} />
    </div>
  );
};

export default Profile;
