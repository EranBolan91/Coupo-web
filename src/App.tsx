import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import AddUserCoupon from "./pages/addCoupon/AddUserCoupon";
import AdminSidebar from "./pages/admin/components/Sidebar";
import Categories from "./pages/categories/Categories";
import CouponsPage from "./pages/coupons/CouponsPage";
import Brand from "./pages/admin/components/Brand";
import Category from "./pages/category/Category";
import Profile from "./pages/profile/Profile";
import SignUp from "./auth/components/SignUp";
import MainPage from "./pages/main/MainPage";
import Login from "./auth/components/Login";
import AdminPage from "./pages/admin/Admin";
import { Toaster } from "react-hot-toast";
import Navbar from "./layout/Navbar/Navbar";
import Footer from "./layout/Footer";
import "./App.css";

function App() {
  const location = useLocation();
  const displayAdminSidebar = location.pathname.includes("/admin");

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="h-20 z-50">{displayAdminSidebar ? <AdminSidebar /> : <Navbar />}</div>
        <div className="grow">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryName" element={<Category />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/addcoupon"
              element={
                <ProtectedRoute>
                  <AddUserCoupon />
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
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/addBrand"
              element={
                <ProtectedRoute>
                  <Brand />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        {/* <div className="mt-auto"> */}
        <div>
          <Footer />
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
