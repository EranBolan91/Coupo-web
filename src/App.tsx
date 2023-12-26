import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import AddUserCoupon from "./pages/addCoupon/AddUserCoupon";
import AdminSidebar from "./pages/admin/components/Sidebar";
import CouponsPage from "./pages/coupons/CouponsPage";
import Brand from "./pages/admin/components/Brand";
import Profile from "./pages/profile/Profile";
import SignUp from "./auth/components/SignUp";
import MainPage from "./pages/main/MainPage";
import Login from "./auth/components/Login";
import AdminPage from "./pages/admin/Admin";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();
  const displayAdminSidebar = location.pathname.includes("/admin");

  return (
    <>
      <div className="flex h-full">
        <div>{displayAdminSidebar ? <AdminSidebar /> : <Navbar />}</div>
        <div className={"w-full h-full bg-white"}>
          <Routes>
            <Route path="/" element={<MainPage />} />
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
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
