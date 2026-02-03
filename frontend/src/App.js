import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import SuccessPage from "./SuccessPage";
import LoginPage from "./admin/LoginPage";
import DashboardPage from "./admin/DashboardPage";
import CategoryPage from "./admin/CategoryPage";
import PackagePage from "./admin/PackagePage";
import ContentPage from "./admin/ContentPage";
import OrdersPage from "./admin/OrdersPage";
import LeadsPage from "./admin/LeadsPage";
import AdminLayout from "./components/admin/AdminLayout";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/success" element={<SuccessPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="packages" element={<PackagePage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="leads" element={<LeadsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
