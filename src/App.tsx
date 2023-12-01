import "./App.css";
import MainPage from "./pages/main/MainPage";
import AdminPage from "./pages/admin/Admin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Brand from "./pages/admin/components/Brand";
import Sidebar from "./pages/admin/components/Sidebar";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/addBrand" element={<Brand />} />
      </Routes>
      <Toaster position="bottom-right" reverseOrder={false} />
    </BrowserRouter>
  );
}

export default App;
