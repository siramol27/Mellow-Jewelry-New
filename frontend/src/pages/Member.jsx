// src/pages/Member.jsx
import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Shop from "./Shop.jsx"; // ฝังหน้าร้านให้สมาชิกใช้งานแทนการเปิด iframe

const Member = () => {

  const navigate = useNavigate();

  // ดึงสถานะจาก Context กลางของแอป
  // - isLoggedIn  : บอกว่าเข้าสู่ระบบแล้วหรือยัง
  // - logout      : ฟังก์ชันออกจากระบบ (เรียก API + เคลียร์ state)
  // - isLoading   : ขณะกำลังตรวจสอบสถานะ (เช่น ยิง /auth/me อยู่)
  const { isLoggedIn, logout, isLoading } = useContext(AppContext);

  // เมื่อสถานะเปลี่ยน ให้เช็คสิทธิ์
  // - ถ้าโหลดเสร็จ (isLoading=false) และยังไม่ได้ล็อกอิน → ส่งกลับหน้า /login
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, isLoading, navigate]);

  // ออกจากระบบ แล้วพาไปหน้า /login
  const handlerLoggout = async () => {
    await logout();     // เคลียร์ cookie/state ฝั่งเซิร์ฟเวอร์+ฝั่ง client
    navigate('/login'); // เปลี่ยนเส้นทางทันที
  };

  // ระหว่างกำลังตรวจสอบสิทธิ์ (ตอน mount แรก ๆ)
  if (isLoading) {
    return <p>กำลังโหลด...</p>;
  }

  // ส่วนเนื้อหาหลักของสมาชิก:
  // - ปุ่ม "ออกจากระบบ" ลอยมุมขวาบน
  // - ใส่ <Shop /> ให้ใช้งานฟีเจอร์ของหน้าร้านได้ภายใน Member
  return (
    <div style={{ height: "100vh" }}>

      {/* ปุ่มออกจากระบบ (ลอยชิดบนขวา) */}
      <div style={{
        position: "fixed",
        top: "10px",
        right: "20px",
        zIndex: 1000
      }}>
        <button onClick={handlerLoggout}>
          ออกจากระบบ
        </button>
      </div>

      {/* เนื้อหาหลัก: ใช้หน้าร้านเดิมสำหรับสมาชิก */}
      <Shop />

    </div>
  );
};

export default Member;