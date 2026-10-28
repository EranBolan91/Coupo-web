import CouponForm from "../../components/addCoupon/CouponForm";
import { toCoupon } from "../../components/addCoupon/toCoupon";
import { saveNewCoupon } from "../../database/databaseCalls";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./components/AdminSidebar";
import toast from "react-hot-toast";

// Admin coupons go straight to the public Coupons collection (allowed by firestore.rules for admins only).
const AdminPage = () => {
  const queryClient = useQueryClient();

  return (
    <AdminLayout title="Add a coupon" description="Publish a coupon directly to the public list. It has no owner, so nobody can edit it from a profile.">
      <CouponForm
        brandMode="store"
        submitLabel="Publish coupon"
        ownerName="Coupo"
        onSubmit={async (values) => {
          const coupon = toCoupon(values, { username: "Coupo" }, "coupon");
          await toast.promise(saveNewCoupon(coupon), {
            loading: "Publishing...",
            success: `${coupon.name} coupon published`,
            error: "Couldn't publish the coupon",
          });
          ["latestCoupons", "coupons"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
        }}
      />
    </AdminLayout>
  );
};

export default AdminPage;
