import React, { useState, useContext, useEffect } from "react";
import { OrderContext } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCoupons } from "../context/CouponContext";

const Shop = () => {
  const navigate = useNavigate();
  const orderCtx = useContext(OrderContext);
  const addOrder = orderCtx?.addOrder || (() => {});

  const { products } = useProducts();
  const { coupons } = useCoupons();

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
  } catch (error) {
    console.warn(error);
  }

  const role = (currentUser?.role || "").toLowerCase();

  useEffect(() => {
    if (role === "admin") {
      navigate("/admin/orders", { replace: true });
    }
  }, [role, navigate]);

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [slip, setSlip] = useState("");
  const [slipPreview, setSlipPreview] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const addCart = (i) => {
    const product = products[i];
    if (!product) return;

    setCart((prev) => {
      const f = prev.find((c) => c.id === product.id);
      if (f)
        return prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        );

      return [...prev, { ...product, qty: 1 }];
    });
  };

  const plus = (i) =>
    setCart((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, qty: c.qty + 1 } : c))
    );

  const minus = (i) =>
    setCart((prev) => {
      const arr = [...prev];
      if (arr[i].qty > 1) arr[i].qty -= 1;
      else arr.splice(i, 1);
      return arr;
    });

  const clearCart = () => setCart([]);

  const handleSlipUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSlip(reader.result);
      setSlipPreview(reader.result);
    };
    reader.readAsDataURL(f);
  };

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  const confirmOrder = () => {
    if (!slip) return alert("กรุณาแนบสลิปก่อนสั่งซื้อ");

    const orderData = {
      buyerName:
        currentUser?.username ||
        currentUser?.name ||
        currentUser?.email ||
        "ลูกค้าทั่วไป",
      items: cart,
      total: total,
      slip: slip,
      status: "รอตรวจสอบ",
      createdAt: new Date().toISOString(),
    };

    addOrder(orderData);

    alert("ส่งคำสั่งซื้อสำเร็จ!");
    setShowPopup(false);
    setCart([]);
    setSlip("");
    setSlipPreview("");
  };

  return (
    <div
      className="relative min-h-screen text-white overflow-hidden"
      style={{ background: "#0F0F14", padding: "50px" }}
    >
      {/*   BEAUTIFUL GLOW BACKGROUND */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[450px] h-[450px] bg-purple-700/25 blur-[180px] rounded-full"></div>
      <div className="pointer-events-none absolute top-[200px] right-[-200px] w-[550px] h-[550px] bg-fuchsia-600/20 blur-[200px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-[-350px] left-[150px] w-[500px] h-[500px] bg-purple-900/30 blur-[200px] rounded-full"></div>

      {/*   MAIN CONTENT */}
      <div className="relative z-10">

        {/*   HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "2px solid #333",
            paddingBottom: 20,
            marginBottom: 40,
          }}
        >
          <h1 style={{ color: "#a855f7", fontSize: 34 }}>Mellow Jewelry</h1>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => navigate("/my-orders")}
              style={{
                background: "#4b5563",
                padding: "8px 14px",
                color: "white",
                borderRadius: 8,
                border: "none",
                cursor: "pointer"
              }}
            >
              ประวัติคำสั่งซื้อ
            </button>

            <button
              onClick={() => navigate("/member")}
              style={{
                background: "#7c3aed",
                padding: "8px 14px",
                color: "white",
                borderRadius: 8,
                border: "none",
                cursor: "pointer"
              }}
            >
              แก้ไขโปรไฟล์
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              style={{
                background: "#b91c1c",
                padding: "8px 14px",
                color: "white",
                borderRadius: 8,
                border: "none",
                cursor: "pointer"
              }}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/*   คูปอง */}
        <h2 style={{ marginBottom: 10 }}>รับส่วนลดของร้าน</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 25,
          }}
        >
          {coupons.map((c) => {
            const isSaved = savedCoupons.some((x) => x.id === c.id);

            return (
              <div
                key={c.id}
                style={{
                  background: "#1a1a23",
                  border: "1px solid #2b2b36",
                  padding: 12,
                  width: 180,
                  borderRadius: 10,
                }}
              >
                <div style={{ fontWeight: "bold" }}>{c.code}</div>
                <div style={{ color: "#c084fc", marginBottom: 10 }}>
                  ลด {c.discount * 100}%
                </div>

                <button
                  onClick={() =>
                    isSaved
                      ? setSavedCoupons((p) =>
                          p.filter((x) => x.id !== c.id)
                        )
                      : setSavedCoupons((p) => [...p, c])
                  }
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    background: isSaved ? "#444" : "#443c77",
                    color: "white",
                    borderRadius: 6,
                    border: "none",
                  }}
                >
                  {isSaved ? "เอาโค้ดออก" : "รับส่วนลด"}
                </button>
              </div>
            );
          })}
        </div>

        {/*   Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 30 }}>
          
          {/*   Products */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 20,
            }}
          >
            {products.map((p, i) => (
              <div
                key={p.id}
                style={{
                  background: "#1a1a23",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 180,
                    background: "#111722",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={p.img}
                    alt={p.name}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    onError={(e) => (e.currentTarget.src = "/images/fallback.jpg")}
                  />
                </div>

                <div style={{ padding: 10 }}>
                  <p>{p.name}</p>
                  <p style={{ color: "#c084fc" }}>{p.price} บาท</p>

                  <button
                    onClick={() => addCart(i)}
                    style={{
                      width: "100%",
                      background: "#713ba3",
                      color: "white",
                      padding: 8,
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/*   Cart */}
          <div
            style={{
              background: "#1a1a23",
              padding: 20,
              borderRadius: 12,
              height: 560,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 style={{ fontSize: 22 }}>สินค้าในตะกร้า</h2>

            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              style={{
                background: "#23232f",
                border: "1px solid #3d3d4a",
                color: cart.length === 0 ? "#666" : "#bbb",
                padding: "3px 6px",
                borderRadius: 5,
                fontSize: 12,
                alignSelf: "flex-end",
                cursor: cart.length === 0 ? "not-allowed" : "pointer",
                marginBottom: 6,
              }}
            >
              ลบทั้งหมด
            </button>

            <div
              className="custom-scroll"
              style={{
                flex: 1,
                overflow: "auto",
                border: "1px solid #2b2b36",
                padding: 8,
                borderRadius: 10,
              }}
            >
              {cart.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "46px 1fr auto",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid #2a2a35",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      background: "#111722",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 6,
                    }}
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => (e.currentTarget.src = "/images/fallback.jpg")}
                    />
                  </div>

                  <div>
                    <p>{item.name}</p>
                    <div
                      style={{
                        display: "flex",
                        border: "1px solid #555",
                        borderRadius: 6,
                        width: 100,
                      }}
                    >
                      <button onClick={() => minus(i)} style={{ flex: 1 }}>
                        -
                      </button>
                      <span style={{ flex: 1, textAlign: "center" }}>
                        {item.qty}
                      </span>
                      <button onClick={() => plus(i)} style={{ flex: 1 }}>
                        +
                      </button>
                    </div>
                  </div>

                  <p>{item.price * item.qty} บาท</p>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: 15 }}>เลือกคูปองที่เก็บไว้</h3>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {savedCoupons.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDiscount(c.discount)}
                  style={{
                    background: discount === c.discount ? "#a855f7" : "#2b2b36",
                    border: "1px solid #a855f7",
                    padding: "6px 12px",
                    borderRadius: 6,
                    color: "white",
                  }}
                >
                  ใช้ {c.code}
                </button>
              ))}
            </div>

            <p style={{ marginTop: 10 }}>ยอดรวม: {subtotal} บาท</p>
            <p style={{ color: "#c084fc" }}>ลดราคา: -{discountAmount} บาท</p>
            <p style={{ color: "#22c55e", fontWeight: "bold" }}>
              สุทธิ: {total} บาท
            </p>

            <button
              onClick={() => setShowPopup(true)}
              style={{
                marginTop: 15,
                padding: 10,
                width: "100%",
                background: "#29b236",
                color: "white",
                borderRadius: 8,
                border: "none",
              }}
            >
              สั่งซื้อสินค้า
            </button>
          </div>
        </div>

        {/*   Popup */}
        {showPopup && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                width: 350,
                background: "#1a1a23",
                padding: 20,
                borderRadius: 12,
                textAlign: "center",
                border: "1px solid #333",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>ยืนยันคำสั่งซื้อ</h2>

              <p>ยอดรวมสุทธิ</p>
              <p style={{ color: "#22c55e", fontSize: 20 }}>{total} บาท</p>

              <label
                style={{
                  display: "block",
                  background: "#374151",
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                แนบสลิปการโอน
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleSlipUpload}
                />
              </label>

              {slipPreview && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={slipPreview}
                    alt="slip"
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </div>
              )}

              <button
                onClick={confirmOrder}
                style={{
                  marginTop: 15,
                  padding: 10,
                  width: "100%",
                  background: slip ? "#22c55e" : "#374151",
                  color: "white",
                  borderRadius: 8,
                  border: "none",
                  cursor: slip ? "pointer" : "not-allowed",
                }}
              >
                ยืนยันคำสั่งซื้อ
              </button>

              <button
                onClick={() => setShowPopup(false)}
                style={{
                  marginTop: 10,
                  padding: 10,
                  width: "100%",
                  background: "#444",
                  color: "white",
                  borderRadius: 8,
                  border: "none",
                }}
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        {/*   Footer */}
        <div
          style={{
            marginTop: 80,
            padding: "40px 0",
            textAlign: "center",
            borderTop: "1px solid #222",
            color: "#aaa",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: "bold" }}>
            Mellow Jewelry
          </div>
          © 2026 Mellow Jewelry. All rights reserved.
        </div>
      </div>

      {/*   CUSTOM SCROLLBAR CSS */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>

    </div>
  );
};

export default Shop;