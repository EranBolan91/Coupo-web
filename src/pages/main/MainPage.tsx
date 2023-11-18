import { useState } from "react";
import CouponCard from "../../main/components/CouponCard";
import SearchBar from "../../main/Searchbar";

const data = [
  {
    id: 1,
    name: "asus",
    description: "coupon for pants",
    imgUrl: "https://cdn.worldvectorlogo.com/logos/asus-rog-1.svg",
    code: "FreeTonight15",
    category: "fashion",
    expiry: "2021-09-09",
    discount: "15%",
    createdAt: "2021-09-09",
    updatedAt: "2021-09-09",
  },
  {
    id: 2,
    name: "shein",
    description: "coupon for shorts",
    imgUrl:
      "https://www.google.com/url?sa=i&url=https%3A%2F%2F1000logos.net%2Fasos-logo%2F&psig=AOvVaw0s7vXIyyNyCj6z45aC_sDn&ust=1699908663849000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNjil7Krv4IDFQAAAAAdAAAAABAE",
    code: "FF1",
    category: "fashion",
    expiry: "2021-09-09",
    discount: "20%",
    createdAt: "2021-09-09",
    updatedAt: "2021-09-09",
  },
  {
    id: 3,
    name: "replay",
    description: "coupon for shoes",
    imgUrl: "https//:www.replay.com",
    code: "replay15",
    category: "fashion",
    expiry: "2021-09-09",
    discount: "20%",
    createdAt: "2021-09-09",
    updatedAt: "2021-09-09",
  },
];

const MainPage = () => {
  const [coupons, setCoupons] = useState(data);

  const handleCouponsFilter = (text: string) => {
    const filteredCoupons = data.filter((coupon) =>
      coupon.name.toLowerCase().includes(text.toLowerCase())
    );
    setCoupons(filteredCoupons);
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full flex items-center justify-center absolute top-24">
        <SearchBar filter={handleCouponsFilter} />
      </div>
      <div className="flex flex-col justify-center items-center w-full absolute top-15">
        {coupons.map((coupon, index) => {
          return <CouponCard key={index} {...coupon} />;
        })}
      </div>
    </div>
  );
};

export default MainPage;
