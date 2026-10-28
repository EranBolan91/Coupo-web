import AddCouponPage from "./components/addCoupon/AddCouponPage";
import SocialCoupons from "./pages/socialCoupons/SocialCoupons";
import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import AdminRoute from "./auth/components/AdminRoute";
import Categories from "./pages/categories/Categories";
import CouponsPage from "./pages/coupons/CouponsPage";
import Brand from "./pages/admin/components/Brand";
import Category from "./pages/category/Category";
import Navbar from "./components/navbar/Navbar";
import Profile from "./pages/profile/Profile";
import SignUp from "./auth/components/SignUp";
import MainPage from "./pages/main/MainPage";
import Login from "./auth/components/Login";
import AdminPage from "./pages/admin/Admin";
import { Toaster } from "react-hot-toast";
import Footer from "./layout/Footer";

const App = () => {
  return (
    <>
      <div className="flex min-h-[100dvh] flex-col">
        <Navbar />
        <main className="grow">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryName" element={<Category />} />
            <Route path="/social" element={<SocialCoupons />} />
            <Route path="/coupons" element={<CouponsPage />} />
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
                  <AdminPage />
                </AdminRoute>
              }
            />
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
