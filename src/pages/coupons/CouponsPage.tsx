import { getAllCoupons } from "../../database/databaseCalls";
import CouponCard from "../main/components/CouponCard";
import SearchBar from "../main/components/Searchbar";
import { useEffect, useState } from "react";
import { Coupon } from "../../types/Types";

const CouponsPage = () => {
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
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="flex w-3/4 items-center justify-center">
        <SearchBar filter={handleCouponsFilter} />
      </div>
      <div className="grid grid-rows-1 md:grid-cols-12 lg:grid-cols-12 p-0 md:p-0 lg:p-0 justify-center items-center mt-11 justify-items-center">
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

export default CouponsPage;
