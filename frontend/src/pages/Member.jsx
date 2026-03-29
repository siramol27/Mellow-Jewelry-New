// src/pages/Member.jsx
import React, { useEffect, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const Member = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout, isLoading } = useContext(AppContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("currentUser") || "null") || {}
  );

    const fetchUserFromServer = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/auth/member`,
        { withCredentials: true }
      );

      if (data.success) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setUser(data.user);
      }

    } catch (err) {
      console.error("❌ โหลดข้อมูลผู้ใช้จาก server ผิดพลาด:", err);
    }
  }, [backendUrl]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      fetchUserFromServer();
    }, 0);

    return () => clearTimeout(timer);
  }, [isLoggedIn, isLoading, navigate, fetchUserFromServer]);

  if (isLoading) {
    return <p style={{ color: "white" }}>กำลังโหลด...</p>;
  }

  const username = user.username || "ไม่พบข้อมูล";
  const email = user.email || "ไม่พบข้อมูล";
  const avatar = user.avatar || "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f14",
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/*   BEAUTIFUL GLOW BACKGROUND (FULL PAGE) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-700/30 blur-[200px] rounded-full"></div>
        <div className="absolute top-[300px] right-[-300px] w-[700px] h-[700px] bg-fuchsia-600/25 blur-[240px] rounded-full"></div>
        <div className="absolute bottom-[-400px] left-[200px] w-[650px] h-[650px] bg-purple-900/25 blur-[250px] rounded-full"></div>
      </div>

      {/*   ปุ่มกลับไปหน้า Shop */}
      <button
        onClick={() => navigate("/shop")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "#6d28d9",
          padding: "10px 18px",
          borderRadius: "8px",
          border: "none",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 50,
          boxShadow: "0 0 15px rgba(168, 85, 247, 0.4)",
        }}
      >
        ← กลับไปหน้า Shop
      </button>

      {/*   CONTENT - ดัน footer ลงล่าง */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          paddingTop: "120px",
        }}
      >
        <div style={{ width: "420px" }}>
          <h1
            style={{
              fontSize: "32px",
              marginBottom: "25px",
              fontWeight: "700",
              color: "#d1cafb",
              textAlign: "center",
            }}
          >
            โปรไฟล์ของฉัน
          </h1>

          <div
            style={{
              background: "#16171f",
              borderRadius: "15px",
              padding: "30px 25px",
              border: "1px solid #2b2b36",
              boxShadow: "0 0 25px rgba(168, 85, 247, 0.2)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #a855f7",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #a855f7, #6d28d9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "35px",
                    fontWeight: "bold",
                    margin: "auto",
                  }}
                >
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "20px", lineHeight: "1.8" }}>
              <p>
                <b style={{ color: "#c084fc" }}>ชื่อผู้ใช้:</b> {username}
              </p>
              <p>
                <b style={{ color: "#c084fc" }}>อีเมล:</b> {email}
              </p>
            </div>

            <button
              onClick={() => navigate("/edit-profile")}
              style={{
                width: "100%",
                padding: "12px",
                background: "#a855f7",
                borderRadius: "8px",
                border: "none",
                color: "white",
                marginBottom: "12px",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              แก้ไขโปรไฟล์
            </button>

            <button
              onClick={logout}
              style={{
                width: "100%",
                padding: "12px",
                background: "#80304a",
                borderRadius: "8px",
                border: "none",
                color: "white",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      {/*   FOOTER ล่างสุดเสมอ */}
      <div
        style={{
          padding: "40px 0",
          textAlign: "center",
          borderTop: "1px solid #222",
          color: "#aaa",
          fontSize: "14px",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
          Mellow Jewelry
        </div>
        © 2026 Mellow Jewelry. All rights reserved.
      </div>
    </div>
  );
};

export default Member;