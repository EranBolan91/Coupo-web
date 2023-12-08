import "./App.css";
import MainPage from "./pages/main/MainPage";
import AdminPage from "./pages/admin/Admin";
import { Routes, Route, useLocation } from "react-router-dom";
import Brand from "./pages/admin/components/Brand";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import SignUp from "./auth/components/SignUp";

function App() {
  const location = useLocation();
  const displaySidebar = location.pathname.includes("/admin");

  return (
    <>
      <div className="grid grid-cols-12">
        {displaySidebar && (
          <div className="col-span-2">
            <Sidebar />
          </div>
        )}
        <div className={`${!displaySidebar ? "col-span-12" : "col-span-10"}`}>
          <Navbar />
          <div className="grid grid-cols-12">
            <div className="col-span-1">
              <Sidebar />
            </div>
            <div className="col-span-11">
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<SignUp />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/addBrand" element={<Brand />} />
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
