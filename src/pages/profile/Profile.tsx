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
      <div className="border-b-2 p-3 w-full">
        <h1 className="text-primary">Hi, {user.displayName}</h1>
      </div>
      <div className="mt-2">
        <h3 className="font-bold text-lg text-primary">Your Coupons</h3>
      </div>
      <div>
        {/* {coupons ? (
          coupons?.map((coupon, index) => (
            <CouponCard key={index} {...coupon} />
          ))
        ) : (
          <Link to="/addcoupon">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Add Coupon
            </button>
          </Link>
        )} */}
      </div>
      <Table />
    </div>
  );
};

export default Profile;
