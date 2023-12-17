import "./App.css";
import MainPage from "./pages/main/MainPage";
import AdminPage from "./pages/admin/Admin";
import { Routes, Route, useLocation } from "react-router-dom";
import Brand from "./pages/admin/components/Brand";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import AdminSidebar from "./pages/admin/components/Sidebar";
import Navbar from "./components/Navbar";
import SignUp from "./auth/components/SignUp";
import Profile from "./pages/profile/Profile";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import Login from "./auth/components/Login";
import AddUserCoupon from "./pages/addCoupon/AddUserCoupon";
import TestMain from "./pages/main/TestMain";

function App() {
  const location = useLocation();
  const displayAdminSidebar = location.pathname.includes("/admin");

  return (
    <>
      <div className="flex">
        <div>{displayAdminSidebar ? <AdminSidebar /> : <Sidebar />}</div>
        <div className={"w-full"}>
          <Routes>
            <Route path="/" element={<MainPage />} />
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
