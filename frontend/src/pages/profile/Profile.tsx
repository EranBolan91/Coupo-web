import PersonalInfo from "./components/PersonalInfo/PersonalInfo";
import { getUserDetails } from "../../database/databaseCalls";
import ExpireCoupons from "./components/ExpireCoupons";
import { UserDocument } from "../../types/UserType";
import { UserAuth } from "../../auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import MyCoupons from "./components/MyCoupons";
import Wishlist from "./components/Wishlist";
import { Link } from "react-router-dom";
import Tabs from "./components/Tabs";

const Profile = () => {
  const { userDocument } = UserAuth();

  // const { data: userDetails, isLoading } = useQuery<UserDocument | null>({
  //   queryKey: ["PersonalInfo"],
  //   queryFn: () => getUserDetails(userDocument?.userUID!),
  //   staleTime: Infinity,
  // });

  console.log("userDetails", userDocument);

  const tabs = [
    {
      label: "Personal Info",
      content: <PersonalInfo currentUser={userDocument} />,
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
    <>
      <div className="flex flex-col w-full h-full bg-background">
        <div className="flex justify-between items-center border-b-2 p-3 w-full">
          <h1 className="text-primary">
            Hi, {userDocument?.firstName} {userDocument?.lastName}
          </h1>
          <Link to="/addcoupon">
            <button className="btn">Add coupon</button>
          </Link>
        </div>
        <div className="flex-grow">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </>
  );
};

export default Profile;
