import "./App.css";
import MainPage from "./pages/main/MainPage";
import AdminPage from "./pages/admin/Admin";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminPage />}>
          <Route path="/admin" element={<MainPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
