import { AddCouponPage, Brand, Profile, SignUp } from "./pages/lazyPages";
import SocialCoupons from "./pages/socialCoupons/SocialCoupons";
import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import AdminRoute from "./auth/components/AdminRoute";
import Categories from "./pages/categories/Categories";
import CouponsPage from "./pages/coupons/CouponsPage";
import CouponPage from "./pages/coupon/CouponPage";
import TopSharers from "./pages/sharers/TopSharers";
import SharerProfile from "./pages/sharers/SharerProfile";
import Category from "./pages/category/Category";
import StorePage from "./pages/store/StorePage";
import Stores from "./pages/stores/Stores";
import RouteMeta from "./components/seo/RouteMeta";
import Navbar from "./components/navbar/Navbar";
import MainPage from "./pages/main/MainPage";
import { AdminDashboard, AdminPage, Login } from "./pages/lazyPages";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReports from "./pages/admin/AdminReports";
import AdminCategories from "./pages/admin/AdminCategories";
import { Toaster } from "react-hot-toast";
import Footer from "./layout/Footer";

const App = () => {
  return (
    <>
      <div className="flex min-h-[100dvh] flex-col">
        <RouteMeta />
        <Navbar />
        <main className="grow">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryName" element={<Category />} />
            <Route path="/social" element={<SocialCoupons />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/store/:storeSlug" element={<StorePage />} />
            <Route path="/coupons/:couponId" element={<CouponPage type="coupon" />} />
            <Route path="/social/:couponId" element={<CouponPage type="socialCoupon" />} />
            <Route path="/top-sharers" element={<TopSharers />} />
            <Route path="/users/:userId" element={<SharerProfile />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/addcoupon"
              element={
                <ProtectedRoute>
                  <AddCouponPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            {(
              [
                ["/admin/add", <AdminPage />],
                ["/admin/coupons", <AdminCoupons />],
                ["/admin/reports", <AdminReports />],
                ["/admin/categories", <AdminCategories />],
              ] as const
            ).map(([path, page]) => (
              <Route key={path} path={path} element={<AdminRoute>{page}</AdminRoute>} />
            ))}
            <Route
              path="/admin/addBrand"
              element={
                <AdminRoute>
                  <Brand />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{ className: "!bg-base-100 !text-base-content border border-base-300 !rounded-box" }}
      />
    </>
  );
};

export default App;
