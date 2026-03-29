import React, { useState } from "react";
import { useProducts } from "../../context/ProductContext";
import { Link } from "react-router-dom";

export default function ManageProducts() {
  const { products, addProduct, deleteProduct, updateProduct } = useProducts();
  const [form, setForm] = useState({
    name: "",
    price: "",
    img: "",
    desc: "",
  });

  const [editData, setEditData] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((prev) => ({
        ...prev,
        img: reader.result,
      }));
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.name || !form.price || !form.img) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    addProduct(form);
    setForm({ name: "", price: "", img: "", desc: "" });
  };

  const openEditPopup = (p) => {
    setEditData({
      ...p,
      imgPreview: p.img,
    });
  };

  const handleEditImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () =>
      setEditData((prev) => ({
        ...prev,
        imgPreview: reader.result,
      }));
    reader.readAsDataURL(f);
  };

  const saveEdit = () => {
    updateProduct(editData.id, {
      name: editData.name,
      price: Number(editData.price),
      desc: editData.desc,
      img: editData.imgPreview,
    });
    setEditData(null);
  };

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden flex flex-col"
      style={{ background: "#0f0f14" }}
    >
      {/* Glow Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-700/30 blur-[140px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-purple-900/25 blur-[180px] rounded-full"></div>

      <div className="max-w-6xl mx-auto px-6 pt-24 relative flex-grow">

        {/* Header */}
        <div className="flex justify-between mb-10">
          <h1 className="text-4xl font-bold text-white tracking-wide drop-shadow-lg">
            จัดการสินค้า (Admin)
          </h1>

          <Link
            to="/admin/coupons"
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg shadow-lg"
          >
            จัดการคูปอง
          </Link>
        </div>

        {/* ADD PRODUCT */}
        <div
          className="rounded-2xl p-6 shadow-xl mb-12 backdrop-blur-md"
          style={{
            background: "rgba(22, 26, 32, 0.85)",
            border: "1px solid #263241",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-5 drop-shadow-md">
            เพิ่มสินค้าใหม่
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อสินค้า"
              className="px-3 py-2 rounded-md"
              style={{ background: "#11161C", border: "1px solid #263241" }}
            />

            <input
              value={form.price}
              type="number"
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="ราคา"
              className="px-3 py-2 rounded-md"
              style={{ background: "#11161C", border: "1px solid #263241" }}
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="px-3 py-2 rounded-md text-white"
              style={{ background: "#11161C", border: "1px solid #263241" }}
            />

            <input
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="คำอธิบาย"
              className="px-3 py-2 rounded-md"
              style={{ background: "#11161C", border: "1px solid #263241" }}
            />
          </div>

          {form.img && (
            <div className="mt-4">
              <img
                src={form.img}
                className="w-40 h-40 object-contain bg-black rounded-md border"
              />
            </div>
          )}

          <button
            onClick={handleAdd}
            className="mt-5 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:opacity-80 rounded-lg text-black font-semibold shadow-lg"
          >
            เพิ่มสินค้า
          </button>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl shadow-xl overflow-hidden backdrop-blur-md"
              style={{
                background: "rgba(22, 26, 32, 0.9)",
                border: "1px solid #263241",
              }}
            >

              <div className="w-full h-48 bg-black flex items-center justify-center">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-5">
                <div className="text-xl font-bold text-white drop-shadow">
                  {p.name}
                </div>

                <div className="text-white font-bold mt-1 text-lg drop-shadow">
                  {p.price.toLocaleString()} ฿
                </div>

                <p className="text-slate-400 text-sm mt-2">{p.desc}</p>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => openEditPopup(p)}
                    className="px-4 py-1.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-85 transition shadow-lg"
                  >
                    แก้ไข
                  </button>

                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="px-4 py-1.5 rounded-md bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-85 transition shadow-lg"
                  >
                    ลบ
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/*     FOOTER — แก้เฉพาะตรงนี้ตามที่สั่ง */}
        <div
          className="text-center mt-24 pt-10 border-t border-[#1e1e25]"
          style={{ color: "white" }}   //   ทำตัวอักษร footer ให้ “สีขาว”
        >
          <p className="font-semibold text-lg drop-shadow" style={{ color: "white" }}>
            Mellow Jewelry
          </p>
          <span style={{ color: "white" }}>
            © 2026 Mellow Jewelry. All rights reserved.
          </span>
        </div>
        {/*   END FOOTER */}

      </div>

      {/* POPUP */}
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
            <h2 className="text-xl font-bold text-white mb-5 drop-shadow">
              แก้ไขสินค้า
            </h2>

            <div className="w-full h-40 bg-black rounded-md flex items-center justify-center mb-4">
              <img
                src={editData.imgPreview}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-4">
              <input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md"
                style={{ background: "#11161C", border: "1px solid #263241" }}
              />

              <input
                value={editData.price}
                type="number"
                className="w-full px-3 py-2 rounded-md"
                style={{ background: "#11161C", border: "1px solid #263241" }}
                onChange={(e) =>
                  setEditData({ ...editData, price: e.target.value })
                }
              />

              <textarea
                rows={3}
                value={editData.desc}
                className="w-full px-3 py-2 rounded-md resize-none"
                style={{ background: "#11161C", border: "1px solid #263241" }}
                onChange={(e) =>
                  setEditData({ ...editData, desc: e.target.value })
                }
              />

              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 rounded-md text-white"
                style={{ background: "#11161C", border: "1px solid #263241" }}
                onChange={handleEditImage}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setEditData(null)}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-500 hover:opacity-85"
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