import { getUserCoupons } from "../../database/databaseCalls";
import CouponCard from "./components/CouponCard";
import { useEffect, useState } from "react";
import { Coupon } from "../../types/Types";
import { UserAuth } from "../../auth/AuthProvider";

const Profile = () => {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const { user } = UserAuth();

  useEffect(() => {
    const fetchUserCoupons = async () => {
      const res = await getUserCoupons(user.uid);
      setCoupons(res);
    };
    fetchUserCoupons();
  }, []);
  return (
    <div className="absolute top-24">
      <div className="border-b-2 p-3 w-full">
        <h1>Hi, Eran Bolandian</h1>
      </div>
      <div className="mt-2">
        <h3 className="font-bold text-lg">Your Coupons</h3>
      </div>
      <div>
        {coupons &&
          coupons.map((coupon, index) => (
            <CouponCard key={index} {...coupon} />
          ))}
      </div>
    </div>
  );
};

export default Profile;
