import AddUserSocialCoupon from "./AddUserSocialCoupon";
import AddUserCoupon from "./AddUserCoupon";
import { useState } from "react";

const AddCouponPage = () => {
  const [activeTab, setActiveTab] = useState("Tab1");

  return (
    <div className="w-full mx-auto mt-3">
      <div className="flex border-b border-gray-300 w-full">
        <div>
          <button
            className={`flex-1 py-2 text-center btn btn-neutral rounded-none ${
              activeTab === "Tab1" ? "text-primary bg-secondary" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("Tab1")}
          >
            Coupons
          </button>
          <button
            className={`flex-1 py-2 text-center btn btn-neutral rounded-none ${
              activeTab === "Tab2" ? "text-primary bg-secondary" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("Tab2")}
          >
            Social Coupons
          </button>
        </div>
      </div>

      <div>
        {activeTab === "Tab1" && (
          <div>
            <AddUserCoupon />
          </div>
        )}
        {activeTab === "Tab2" && (
          <div>
            <AddUserSocialCoupon />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCouponPage;
