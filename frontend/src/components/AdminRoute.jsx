import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("currentUser"));
  } catch (error) {
    console.warn("AdminRoute invalid currentUser:", error);
  }

  //  ไม่มี currentUser → บังคับไป login
  if (!user) return <Navigate to="/login" replace />;

  //  ไม่ใช่ admin → บังคับกลับหน้าแรก
  if (user.role !== "admin") return <Navigate to="/" replace />;

  //  ผ่าน → แสดงหน้า Admin
  return children;
}