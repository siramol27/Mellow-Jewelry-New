// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import Member from "./pages/Member";
import ForgotPassword from "./pages/ForgotPassword";
import Shop from "./pages/Shop";
import Orders from "./pages/Orders";
import MyOrders from "./pages/MyOrders";
import EditProfile from "./pages/EditProfile";

import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageCoupons from "./pages/admin/ManageCoupons";
import ManageUsers from "./pages/admin/ManageUsers";

import AdminRoute from "./components/AdminRoute";   //   เพิ่ม
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Member */}
        <Route path="/member" element={<Member />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* Owner (คุณยังไม่ล็อก ถ้าต้องการให้ล็อก owner แยก บอกผมได้เลย) */}
        <Route path="/owner/products" element={<ManageProducts />} />
        <Route path="/owner/orders" element={<ManageOrders />} />
        <Route path="/owner/coupons" element={<ManageCoupons />} />

        {/*   Admin Protected Routes */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/orders" replace />}
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <ManageOrders />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <ManageProducts />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/coupons"
          element={
            <AdminRoute>
              <ManageCoupons />
            </AdminRoute>
          }
        />

        {/* Not found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}