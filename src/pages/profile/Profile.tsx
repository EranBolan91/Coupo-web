import { UserAuth } from "../../auth/AuthProvider";
import { Link } from "react-router-dom";
import Table from "./components/Table";

const Profile = () => {
  const { user }: any = UserAuth();

  return (
    <div className="w-full h-full bg-background">
      <div className="flex justify-between items-center border-b-2 p-3 w-full">
        <h1 className="text-primary">Hi, {user.displayName}</h1>
        <Link to="/addcoupon">
          <button className="btn">Add coupon</button>
        </Link>
      </div>
      <div className="mt-2">
        <h3 className="font-bold text-lg text-primary ml-4">Your Coupons</h3>
      </div>
      <Table />
    </div>
  );
};

export default Profile;
