import { useEffect, useState } from "react";
import CouponCard from "./components/CouponCard";
import SearchBar from "./components/Searchbar";
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
      <div className="flex w-3/4 items-center justify-center top-24 absolute">
        <SearchBar filter={handleCouponsFilter} />
      </div>
      <div className="grid grid-rows-1 md:grid-cols-12 lg:grid-cols-12 p-0 md:p-0 lg:p-0 justify-center items-center top-15 absolute top-1/4 justify-items-center">
        {filteredCoupons &&
          filteredCoupons.map((coupon, index) => {
            return (
              <div key={index} className="col-span-4">
                <CouponCard key={index} {...coupon} />{" "}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MainPage;
