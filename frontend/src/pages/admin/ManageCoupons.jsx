import React, { useState } from "react";
import { useCoupons } from "../../context/CouponContext";

export default function ManageCoupons() {
  const { coupons, addCoupon, deleteCoupon, updateCoupon } = useCoupons();

  const [form, setForm] = useState({
    code: "",
    discount: "",
  });

  const [editData, setEditData] = useState(null);

  const handleAdd = () => {
    if (!form.code || !form.discount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    addCoupon({
      code: form.code,
      discount: Number(form.discount) / 100,
    });

    setForm({ code: "", discount: "" });
  };

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden flex flex-col"
      style={{ background: "#0F0F14" }}
    >
      {/*   Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-700/30 blur-[140px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-purple-900/25 blur-[180px] rounded-full"></div>

      {/*   CONTENT (flex-grow เพื่อดัน footer ลงล่าง) */}
      <div className="max-w-4xl mx-auto px-6 pt-24 relative flex-grow">

        {/*   HEADER */}
        <h1 className="text-4xl font-bold text-white mb-10 drop-shadow-lg">
          จัดการคูปอง (Admin)
        </h1>

        {/*   ฟอร์มเพิ่มคูปอง */}
        <div
          className="p-6 rounded-2xl shadow-xl mb-12 backdrop-blur-md"
          style={{ background: "rgba(22, 26, 32, 0.85)", border: "1px solid #263241" }}
        >
          <h2 className="text-2xl font-semibold text-white mb-5 drop-shadow-md">
            เพิ่มคูปองใหม่
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/*   แก้ input เป็นตัวอักษรสีขาว */}
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="โค้ดคูปอง"
              className="px-4 py-2 rounded-md outline-none"
              style={{
                background: "#11161C",
                border: "1px solid #263241",
                color: "white",
              }}
            />

            <input
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              placeholder="ส่วนลด (%) เช่น 10"
              type="number"
              className="px-4 py-2 rounded-md outline-none"
              style={{
                background: "#11161C",
                border: "1px solid #263241",
                color: "white",
              }}
            />

            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 hover:opacity-80 text-black font-semibold shadow-lg"
            >
              เพิ่มคูปอง
            </button>
          </div>
        </div>

        {/*   รายการคูปอง */}
        <div className="grid md:grid-cols-2 gap-6">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl shadow-lg backdrop-blur-md"
              style={{
                background: "rgba(22, 26, 32, 0.9)",
                border: "1px solid #263241",
              }}
            >
              <h3 className="text-2xl font-bold text-white drop-shadow">
                {c.code}
              </h3>

              <p className="text-white mt-1 text-lg drop-shadow">
                ส่วนลด {c.discount * 100}%
              </p>

              <div className="flex justify-between mt-5">
                <button
                  onClick={() => setEditData(c)}
                  className="px-4 py-1.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-85 transition shadow-lg"
                >
                  แก้ไข
                </button>

                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="px-4 py-1.5 rounded-md bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-85 transition shadow-lg"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*   FOOTER — สีขาวล้วน และล่างสุดจริง */}
      <footer
        className="text-center py-14 border-t"
        style={{
          borderColor: "#1e1e25",
          color: "white",                //   ตัวอักษรขาว
        }}
      >
        <p className="font-semibold text-lg drop-shadow"
           style={{ color: "white" }}   //   ชื่อร้านสีขาว
        >
          Mellow Jewelry
        </p>

        <span style={{ color: "white" }}> {/*   สีขาว */}
          © 2026 Mellow Jewelry. All rights reserved.
        </span>
      </footer>

      {/*   POPUP แก้ไขคูปอง */}
      {editData && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setEditData(null)}
        >
          <div
            className="p-6 rounded-xl w-full max-w-md shadow-xl"
            style={{ background: "#161A20", border: "1px solid #263241" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-5 drop-shadow">
              แก้ไขคูปอง
            </h2>

            <input
              value={editData.code}
              onChange={(e) => setEditData({ ...editData, code: e.target.value })}
              className="w-full px-3 py-2 rounded-md mb-3 outline-none"
              style={{
                background: "#11161C",
                border: "1px solid #263241",
                color: "white",
              }}
            />

            <input
              type="number"
              value={editData.discount * 100}
              onChange={(e) =>
                setEditData({ ...editData, discount: Number(e.target.value) / 100 })
              }
              className="w-full px-3 py-2 rounded-md outline-none"
              style={{
                background: "#11161C",
                border: "1px solid #263241",
                color: "white",
              }}
            />

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md"
                onClick={() => setEditData(null)}
              >
                ยกเลิก
              </button>

              <button
                className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-500 hover:opacity-85"
                onClick={() => {
                  updateCoupon(editData.id, editData);
                  setEditData(null);
                }}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}