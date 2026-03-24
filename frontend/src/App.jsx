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

import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageCoupons from "./pages/admin/ManageCoupons";
import ManageUsers from "./pages/admin/ManageUsers";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * โครง Routes แบบ "เปิดสาธารณะชั่วคราว"
 * -------------------------------------------------
 * ไฟล์นี้ตั้งใจ “ไม่ใส่ Guard” เพื่อให้พัฒนา/เดโมได้เร็ว:
 *   - ทุกเส้นทางเข้าถึงได้เลย โดยไม่ตรวจสิทธิ์
 *   - /admin จะ redirect ไป /admin/orders โดยตรง
 *   - ถ้าต้องการเปิดใช้ Guard ภายหลัง ค่อยย้ายเส้นทางสำคัญเข้า Protected/RoleRoute
 *
 * หมายเหตุ:
 *   - ToastContainer ใช้สำหรับแจ้งเตือนสั้น ๆ ด้านขวาบน
 *   - เส้นทางที่ไม่พบ (path="*") จะเด้งกลับหน้าแรก
 */
export default function App() {
  return (
    <div>
      {/* กล่องแจ้งเตือน (toast) ไว้ตรงมุมขวาบน ปิดเองใน 2 วิ */}
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
        {/** ---------- โซนสาธารณะ/ลูกค้า ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/**
         * ---------- โซนสมาชิกทั่วไป ----------
         * ตอนนี้ยัง “เปิดโล่ง” เพื่อเทสสะดวก
         * ถ้าจะบังคับล็อกอิน ให้ย้ายสองเส้นทางนี้เข้า ProtectedRoute ภายหลัง
         */}
        <Route path="/member" element={<Member />} />
        <Route path="/my-orders" element={<Orders />} />

        {/**
         * ---------- โซน Owner (เปิดสาธารณะชั่วคราว) ----------
         * ปกติควรครอบด้วย RoleRoute allow={["owner","admin"]}
         * ตอนนี้เปิดไว้ก่อนเพื่อเข้าไปดู UI ได้ง่าย ๆ
         */}
        <Route path="/owner/products" element={<ManageProducts />} />
        <Route path="/owner/orders" element={<ManageOrders />} />
        <Route path="/owner/coupons" element={<ManageCoupons />} />

        {/**
         * ---------- โซน Admin (เปิดสาธารณะชั่วคราว) ----------
         * /admin → เด้งไป /admin/orders
         * ปกติควรครอบด้วย RoleRoute allow={["admin"]}
         */}
        <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/orders" element={<ManageOrders />} />

        {/**
         * ---------- not found ----------
         * ทุกเส้นทางที่ไม่แมตช์ข้างบน จะพากลับไปหน้าแรก
         */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}