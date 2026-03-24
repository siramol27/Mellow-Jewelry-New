import React, { useState } from 'react';
import Navbar from '../components/navbar';

// หมวดหมู่สินค้าแบบคงที่ ใช้แสดงรูปตัวอย่างบนหน้าแรก
const categories = [
  { name: 'แหวน', img: '/images/feature2.2.webp' },
  { name: 'สร้อยคอ', img: '/images/PZnhTOtr5D3rd9oc9sNIRQHzmgU37a9IpwarwPi4wvSD4NA.webp' },
  { name: 'ต่างหู', img: '/images/7fa8db75-a696-4979-a1bb-0ef24410d5da.jpg' },
];

const Home = () => {
  // เก็บหมวดหมู่ที่ถูกเลือกเพื่อแสดงใน modal
  const [activeCat, setActiveCat] = useState(null);

  // เปิด/ปิด modal
  const [showModal, setShowModal] = useState(false);

  // เมื่อคลิกหมวดหมู่ → เปิด modal พร้อมรูป
  const openModal = (cat) => {
    setActiveCat(cat);
    setShowModal(true);
  };

  // ปิด modal
  const closeModal = () => {
    setShowModal(false);
    setActiveCat(null);
  };

  // ไปหน้า Login (ใช้ location แบบตรง ๆ เพื่อความง่าย)
  const goLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0c14] text-white">
      
      {/* วงกลมไล่สีเอฟเฟกต์พื้นหลัง */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl" />

      {/* แถบเมนูด้านบน */}
      <Navbar />

      {/* ชื่อร้านส่วนบนของหน้า */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-16 pb-8 text-center md:pt-20">
        <h1 className="bg-gradient-to-b from-white to-purple-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Mellow Jewelry
        </h1>
      </section>

      {/* หมวดหมู่สินค้า พร้อมเอฟเฟกต์ hover */}
      <section className="mx-auto max-w-6xl px-6 pb-12 mt-10">
        <h2 className="mb-4 text-lg font-semibold text-white/90">หมวดหมู่ยอดนิยม</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((c, idx) => (
            <button
              key={idx}
              onClick={() => openModal(c)}
              className="group overflow-hidden rounded-2xl border border-fuchsia-400/30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700/30 via-fuchsia-700/10 to-transparent p-0 text-left transition hover:border-fuchsia-400/60"
            >
              <div className="relative h-48 w-full">
                {c.img ? (
                  <img
                    src={c.img}
                    alt={c.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // ถ้ารูปโหลดไม่ได้ ให้ซ่อนแท็ก img เพื่อไม่ให้แตก
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10" />
              </div>

              <div className="p-4">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-purple-100/80">คลิกเพื่อดูรูปตัวอย่าง</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ปุ่มเข้าสู่ระบบ (ติดล่าง) */}
      <div className="sticky bottom-4 z-40 flex w-full justify-center px-4">
        <button
          onClick={goLogin}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold shadow-xl shadow-fuchsia-700/30 ring-1 ring-white/10 transition hover:from-purple-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        >
          Login / สมัครสมาชิก
        </button>
      </div>

      {/* ส่วน footer เล็ก ๆ ตรงล่าง */}
      <footer className="border-t border-white/10 bg-black/20 py-8 mt-10 text-center text-xs text-purple-100/70">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-1 font-semibold text-white/90">Mellow Jewelry</div>
          <div className="mt-1">
            © {new Date().getFullYear()} Mellow Jewelry. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modal แสดงรูปสินค้าขนาดใหญ่ */}
      {showModal && activeCat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}  // คลิกพื้นที่ด้านนอกเพื่อลด modal
        >
          {/* กล่อง modal ด้านใน */}
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f17] shadow-2xl"
            onClick={(e) => e.stopPropagation()} // กัน event เด้งไปปิด
          >
            {/* ปุ่มปิด (X) มุมขวาบน */}
            <button
              onClick={closeModal}
              aria-label="ปิด"
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white/90 hover:bg-black/80"
            >
              ✕
            </button>

            {/* รูปใหญ่ */}
            <div className="relative">
              {activeCat.img ? (
                <img
                  src={activeCat.img}
                  alt={activeCat.name}
                  className="max-h-[75vh] w-full object-contain bg-black"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex max-h-[75vh] w-full items-center justify-center bg-black/80 py-24">
                  <span className="text-5xl">🖼️</span>
                </div>
              )}

              {/* ชื่อหมวดหมู่ (โชว์ใต้รูป) */}
              <div className="absolute bottom-3 left-3 rounded bg-black/60 px-3 py-1 text-sm font-medium">
                {activeCat.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;