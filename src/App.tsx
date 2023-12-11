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

function App() {
  const location = useLocation();
  const displayAdminSidebar = location.pathname.includes("/admin");

  return (
    <>
      <div className="grid grid-cols-12">
        {displayAdminSidebar && (
          <div className="col-span-2">
            <AdminSidebar />
          </div>
        )}
        <div
          className={`${!displayAdminSidebar ? "col-span-12" : "col-span-10"}`}
        >
          <Navbar />
          <div className="grid grid-cols-12">
            <div
              className={`${
                !displayAdminSidebar ? "col-span-1" : "col-span-0"
              }`}
            >
              {!displayAdminSidebar ? <Sidebar /> : ""}
            </div>
            <div
              className={`${
                !displayAdminSidebar ? "col-span-11" : "col-span-12"
              }`}
            >
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
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
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
