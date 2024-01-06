import { getUserCoupons } from "../../database/databaseCalls";
import CouponCard from "./components/CouponCard";
import { useEffect, useState } from "react";
import { Coupon } from "../../types/Types";
import { UserAuth } from "../../auth/AuthProvider";
import { Link } from "react-router-dom";
import Table from "./components/Table";

const Profile = () => {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const { user }: any = UserAuth();

  useEffect(() => {
    const fetchUserCoupons = async () => {
      const res = await getUserCoupons(user.uid);
      setCoupons(res);
    };
    fetchUserCoupons();
  }, []);

  return (
    <div className="w-full h-full bg-background">
      <div className="flex justify-between items-center border-b-2 p-3 w-full">
        <h1 className="text-primary">Hi, {user.displayName}</h1>
        <Link to="/addcoupon">
          <button className="btn">Add coupon</button>
        </Link>
      </div>
      <div className="mt-2">
        <h3 className="font-bold text-lg text-primary">Your Coupons</h3>
      </div>
      <Table />
    </div>
  );
};

export default Profile;
