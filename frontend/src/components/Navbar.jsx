import React from 'react';
import { useNavigate } from 'react-router-dom';

// คอมโพเนนต์แถบนำทางด้านบน (วางแบบ absolute ติดขอบบนของหน้า)
const Navbar = () => {
  // useNavigate: hook ของ react-router สำหรับเปลี่ยนเส้นทางด้วยโค้ด
  const navigate = useNavigate();

  return (
    // header กำหนดเป็น absolute ครอบทั้งความกว้างจอ และอยู่ชั้นบน (z-50)
    <header className="absolute top-0 left-0 right-0 z-50">
      {/* คอนเทนต์ภายใน navbar: กำหนด max width, padding และจัดตำแหน่งชิดขวา */}
      <nav className="mx-auto max-w-6xl px-6 py-4 flex justify-end">
        {/* ปุ่มไปหน้าแอดมิน
            - onClick เรียก navigate('/admin/orders') → ชี้หน้าแอดมินที่มีอยู่จริง
            */}
        <button
          onClick={() => navigate('/admin/orders')}  // เปลี่ยนเส้นทางเมื่อกดปุ่ม
          className="px-3 py-1.5 rounded-md border border-white/25 text-white/80 hover:text-white hover:border-white/40 bg-transparent transition"
        >
          แอดมิน
        </button>
      </nav>
    </header>
  );
};

export default Navbar;