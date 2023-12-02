import { useEffect, useState } from "react";
import CouponCard from "../../main/components/CouponCard";
import SearchBar from "../../main/Searchbar";
import { getAllCoupons } from "../../database/databaseCalls";
import { Coupon } from "../../types/Types";

const MainPage = () => {
  const [globalCoupons, setGlobalCoupons] = useState<Coupon[] | null>(null);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[] | null>(null);

  const handleCouponsFilter = (text: string) => {
    if (text === "") {
      setFilteredCoupons(globalCoupons);
      return;
    }
    const filteredData = filteredCoupons?.filter((coupon) =>
      coupon.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCoupons(filteredData ? filteredData : []);
  };

  useEffect(() => {
    getAllCoupons().then((fetchedCoupons) => {
      setGlobalCoupons(fetchedCoupons);
      setFilteredCoupons(fetchedCoupons);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full flex items-center justify-center fixed top-24">
        <SearchBar filter={handleCouponsFilter} />
      </div>
      <div className="flex flex-col justify-center items-center w-full fixed top-15">
        {filteredCoupons &&
          filteredCoupons.map((coupon, index) => {
            return <CouponCard key={index} {...coupon} />;
          })}
      </div>
    </div>
  );
};

export default MainPage;
