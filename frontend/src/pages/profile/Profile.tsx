import PersonalInfo from "./components/PersonalInfo/PersonalInfo";
import { getUserDetails } from "../../database/databaseCalls";
import ExpireCoupons from "./components/ExpireCoupons";
import { UserAuth } from "../../auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { CurrentUser } from "../../types/Types";
import MyCoupons from "./components/MyCoupons";
import Wishlist from "./components/Wishlist";
import { Link } from "react-router-dom";
import Tabs from "./components/Tabs";
import { User } from "firebase/auth";

const Profile = () => {
  const { user }: { user: User } = UserAuth();

  const { data: userDetails } = useQuery<CurrentUser | null>({
    queryKey: ["PersonalInfo"],
    queryFn: () => getUserDetails(user.uid),
    staleTime: Infinity,
  });

  const tabs = [
    {
      label: "Personal Info",
      content: <PersonalInfo currentUser={userDetails ?? null} />,
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
        <h1 className="text-primary">
          Hi, {userDetails?.firstName} {userDetails?.lastName}
        </h1>
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
