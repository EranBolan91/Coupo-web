import "./App.css";
import MainPage from "./pages/main/MainPage";
import AdminPage from "./pages/admin/Admin";
import { Routes, Route, useLocation } from "react-router-dom";
import Brand from "./pages/admin/components/Brand";
import { Toaster } from "react-hot-toast";
import Sidebar from "./pages/admin/components/Sidebar";

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
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/addBrand" element={<Brand />} />
          </Routes>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
