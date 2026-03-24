import React, { useState } from "react";

const Owner = ({ products, setProducts, orders, setAllCoupons }) => {

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    img: ""
  });

  const [editIndex, setEditIndex] = useState(null);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: ""
  });

  //  เพิ่มสินค้า
  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      return alert("กรอกข้อมูลให้ครบ");
    }

    setProducts([...products, {
      ...newProduct,
      price: Number(newProduct.price)
    }]);

    setNewProduct({ name: "", price: "", img: "" });
  };

  //  ลบสินค้า
  const deleteProduct = (i) => {
    setProducts(products.filter((_, index) => index !== i));
  };

  //  แก้สินค้า
  const updateProduct = () => {
    const updated = [...products];
    updated[editIndex] = newProduct;
    setProducts(updated);
    setEditIndex(null);
    setNewProduct({ name: "", price: "", img: "" });
  };

  //  สร้างคูปอง
  const createCoupon = () => {
    if (!newCoupon.code || !newCoupon.discount) {
      return alert("กรอกคูปองให้ครบ");
    }

    setAllCoupons(prev => [
      ...prev,
      {
        code: newCoupon.code,
        discount: Number(newCoupon.discount)
      }
    ]);

    setNewCoupon({ code: "", discount: "" });
  };

  return (
    <div style={{ padding: "40px", color: "white", background: "#0f0f14", minHeight: "100vh" }}>
      <h1 style={{ color: "#a855f7" }}>👑 Owner Panel</h1>

      {/*  เพิ่ม / แก้สินค้า */}
      <h2>🛍 จัดการสินค้า</h2>

      <input
        placeholder="ชื่อสินค้า"
        value={newProduct.name}
        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
        style={input}
      />

      <input
        placeholder="ราคา"
        value={newProduct.price}
        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
        style={input}
      />

      <input
        placeholder="URL รูป"
        value={newProduct.img}
        onChange={e => setNewProduct({ ...newProduct, img: e.target.value })}
        style={input}
      />

      {editIndex === null ? (
        <button onClick={addProduct} style={btnPurple}>เพิ่มสินค้า</button>
      ) : (
        <button onClick={updateProduct} style={btnGreen}>บันทึกการแก้ไข</button>
      )}

      {/* 📦 รายการสินค้า */}
      {products.map((p, i) => (
        <div key={i} style={card}>
          <img src={p.img} style={{ width: "60px", height: "60px", borderRadius: "8px" }} />

          <div style={{ flex: 1 }}>
            <p>{p.name}</p>
            <p style={{ color: "#c084fc" }}>{p.price} บาท</p>
          </div>

          <button
            onClick={() => {
              setEditIndex(i);
              setNewProduct(p);
            }}
            style={btnBlue}
          >
            แก้ไข
          </button>

          <button onClick={() => deleteProduct(i)} style={btnRed}>
            ลบ
          </button>
        </div>
      ))}

      {/* 📦 ออเดอร์ */}
      <h2 style={{ marginTop: "30px" }}>📦 Orders</h2>

      {orders.length === 0 && <p style={{ color: "#888" }}>ยังไม่มีออเดอร์</p>}

      {orders.map((o, i) => (
        <div key={i} style={card}>
          <div>
            <p>ยอด: {o.total} บาท</p>
            <p>ธนาคาร: {o.bank}</p>
            <p style={{ color: o.paid ? "#22c55e" : "#ef4444" }}>
              {o.paid ? "ชำระแล้ว ✔" : "ยังไม่ชำระ"}
            </p>
          </div>
        </div>
      ))}

      {/* 🎟 คูปอง */}
      <h2 style={{ marginTop: "30px" }}>🎟 สร้างคูปอง</h2>

      <input
        placeholder="CODE (เช่น SAVE10)"
        value={newCoupon.code}
        onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
        style={input}
      />

      <input
        placeholder="ส่วนลด (0.1 = 10%)"
        value={newCoupon.discount}
        onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })}
        style={input}
      />

      <button onClick={createCoupon} style={btnPurple}>
        สร้างคูปอง
      </button>

    </div>
  );
};

/* 🎨 style */
const input = {
  display: "block",
  marginBottom: "10px",
  padding: "8px",
  borderRadius: "6px",
  border: "none",
  width: "250px"
};

const card = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#1a1a23",
  padding: "10px",
  borderRadius: "10px",
  marginTop: "10px"
};

const btnPurple = {
  background: "#a855f7",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  marginBottom: "10px"
};

const btnGreen = {
  background: "#22c55e",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  marginBottom: "10px"
};

const btnRed = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px"
};

const btnBlue = {
  background: "#3b82f6",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px"
};

export default Owner;