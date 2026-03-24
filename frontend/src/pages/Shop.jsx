import React, { useState, useContext, useMemo } from "react";
import { OrderContext } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";

const Shop = () => {
  const navigate = useNavigate(); // เผื่อปุ่มอื่นในหน้าใช้ต่อ
  const orderCtx = useContext(OrderContext);
  const addOrder = orderCtx?.addOrder || (() => {});

  // ---------- Utils: อ่าน user จาก localStorage แบบปลอดภัย ----------
  const safeParse = (str, fallback) => { try { return JSON.parse(str); } catch { return fallback; } };
  const currentUser =
    safeParse(localStorage.getItem("user"), null) ||
    safeParse(localStorage.getItem("currentUser"), null) ||
    {};
  const role = (currentUser?.role || "").toLowerCase();

  // ---------- ข้อมูลสินค้า / คูปอง ----------
  const products = [
    { name: "แหวนเพชร", price: 3290, img: "/images/feature2.2.webp" },
    { name: "ต่างหูไข่มุก", price: 1290, img: "/images/23.webp" },
    { name: "สร้อยคอ", price: 2890, img: "/images/istockphoto-522545031-612x612.jpg" },
    { name: "แหวนเงินชมพู", price: 2790, img: "/images/shopping.webp" },
    { name: "สร้อยข้อมือไข่มุก", price: 1890, img: "/images/133852_1.webp" },
    { name: "ต่างหูคริสตัล", price: 990, img: "/images/5211-5213-mp4.webp" },
    { name: "แหวนทองคำขาว", price: 3590, img: "/images/lozenge-section-platinum-pt950-ring-men-and-women-18k-white-gold-couple-pair-ring-original-design-personality-creative-9788-l.jpg" },
    { name: "กำไลเงินแท้", price: 1590, img: "/images/w5zb1v.jpg" },
  ];
  const coupons = [
    { code: "SAVE10", discount: 0.1 },
    { code: "MELLOW20", discount: 0.2 },
  ];

  // ---------- State หลัก ----------
  const [cart, setCart] = useState([]);
  const [ownedCoupons, setOwnedCoupons] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paid, setPaid] = useState(false);
  const [bank, setBank] = useState("");

  // ---------- จัดการตะกร้า ----------
  const addCart = (i) => {
    const product = products[i];
    setCart((prev) => {
      const found = prev.find((c) => c.name === product.name);
      if (found) return prev.map((c) => (c.name === product.name ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const plus  = (i) => setCart((prev) => (prev.map((c, idx) => idx === i ? { ...c, qty: c.qty + 1 } : c)));
  const minus = (i) => setCart((prev) => {
    const copy = [...prev];
    if (copy[i].qty > 1) copy[i] = { ...copy[i], qty: copy[i].qty - 1 };
    else copy.splice(i, 1);
    return copy;
  });
  const clearCart = () => setCart([]);
  const claimCoupon = (coupon) => setOwnedCoupons((prev) => (prev.find((c) => c.code === coupon.code) ? prev : [...prev, coupon]));

  // ---------- คำนวณยอด ----------
  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const total    = useMemo(() => subtotal - subtotal * discount, [subtotal, discount]);

  // ---------- สไตล์ย่อยให้สม่ำเสมอ ----------
  const btnAdd = { width: "100%", marginTop: 5, padding: 8, background: "#a855f7", border: "none", borderRadius: 6, color: "white", cursor: "pointer" };
  const qtyBox = { display: "flex", border: "1px solid #555", borderRadius: 6, width: 100, marginTop: 6 };
  const qtyBtn = { flex: 1, background: "#0f0f14", color: "white", border: "none", cursor: "pointer" };
  const qtyNum = { flex: 1, textAlign: "center" };
  const payBtn = { marginTop: 10, width: "100%", padding: 10, background: "#22c55e", border: "none", borderRadius: 8, color: "white", fontSize: 16, cursor: "pointer" };

  // ---------- สร้าง payload ออเดอร์ให้ตรงหน้าแอดมิน ----------
  const buildOrder = () => ({
    buyerName: currentUser?.username || currentUser?.name || currentUser?.email || "ลูกค้าทั่วไป",
    items: cart.map((it) => ({ name: it.name, qty: it.qty || 1, price: it.price || 0 })),
    total,                                   // ส่งยอดรวมให้ชัดเจน (Context ก็มีคำนวณเผื่อไว้)
    status: "ชำระแล้ว",
    createdAt: new Date().toISOString(),
  });

  return (
    <div style={{ background: "#0f0f14", color: "white", minHeight: "100vh", padding: "50px" }}>
      {/* theme scrollbar */}
      <style>{`
        .cartScroll::-webkit-scrollbar{width:6px}
        .cartScroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.25);border-radius:8px}
        .cartScroll::-webkit-scrollbar-thumb{background:#0a0a0a;border-radius:8px}
        .cartScroll{scrollbar-width:thin;scrollbar-color:#0a0a0a rgba(0,0,0,0.25)}
        .payScroll::-webkit-scrollbar{width:6px}
        .payScroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.25);border-radius:8px}
        .payScroll::-webkit-scrollbar-thumb{background:#0a0a0a;border-radius:8px}
        .payScroll{scrollbar-width:thin;scrollbar-color:#0a0a0a rgba(0,0,0,0.25)}
      `}</style>

      {/* ---------- Header ---------- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #333", paddingBottom: 15, marginBottom: 20 }}>
        <h1 style={{ color: "#a855f7", fontSize: 32, fontWeight: "bold", margin: 0 }}>Mellow Jewelry</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {role === "admin" && (
            <button
              onClick={() => navigate("/admin/orders")}
              style={{ background: "transparent", border: "1px solid #2b2b36", color: "#9aa0a6", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
              title="ไปหน้าแอดมิน"
            >
              แอดมิน
            </button>
          )}
          <button
            onClick={() => { localStorage.removeItem("user"); localStorage.removeItem("currentUser"); window.location.href = "/login"; }}
            style={{ background: "#80304a", border: "none", padding: "8px 14px", borderRadius: 8, color: "white", cursor: "pointer" }}
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* ---------- คูปอง ---------- */}
      <h2>รับคูปอง</h2>
      <div style={{ display: "flex", gap: 18, marginBottom: 20, flexWrap: "wrap" }}>
        {coupons.map((c) => {
          const owned = ownedCoupons.find((o) => o.code === c.code);
          return (
            <div key={c.code} style={{ background: "#1a1a23", padding: 10, borderRadius: 10 }}>
              <p style={{ margin: "0 0 8px" }}>{c.code} - ลด {c.discount * 100}%</p>
              <button
                onClick={() => claimCoupon(c)}
                disabled={!!owned}
                style={{ background: owned ? "#444" : "#a855f7", color: "white", border: "none", padding: "5px 10px", borderRadius: 6, cursor: owned ? "not-allowed" : "pointer" }}
              >
                {owned ? "เก็บแล้ว ✔" : "รับคูปอง"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ---------- Layout: สินค้า (ซ้าย) + ตะกร้า (ขวา) ---------- */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 30, alignItems: "start" }}>
        {/* สินค้า */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {products.map((p, i) => (
            <div key={p.name} style={{ background: "#1a1a23", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ width: "100%", height: 180, background: "#111722", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src={p.img}
                  alt={p.name}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", objectPosition: "center", display: "block" }}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/fallback.jpg"; }}
                />
              </div>
              <div style={{ padding: 10 }}>
                <p style={{ margin: "0 0 4px" }}>{p.name}</p>
                <p style={{ color: "#c084fc", margin: "0 0 8px" }}>{p.price} บาท</p>
                <button onClick={() => addCart(i)} style={btnAdd}>เพิ่มลงตะกร้า</button>
              </div>
            </div>
          ))}
        </div>

        {/* ตะกร้า */}
        <div style={{ background: "#1a1a23", padding: 20, borderRadius: 12, display: "flex", flexDirection: "column", height: 560, minHeight: 560 }}>
          {/* หัวตะกร้า */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <h2 style={{ fontSize: 22, margin: 0 }}>สินค้าในตะกร้า</h2>
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              title="ลบสินค้าในตะกร้าทั้งหมด"
              style={{ background: "transparent", border: "1px solid #444", color: cart.length === 0 ? "#555" : "#bbb", padding: "4px 8px", fontSize: 12, borderRadius: 6, cursor: cart.length === 0 ? "not-allowed" : "pointer" }}
            >
              ลบทั้งหมด
            </button>
          </div>

          {/* รายการในตะกร้า */}
          <div className="cartScroll" style={{ marginTop: 10, border: "1px solid #2b2b36", borderRadius: 10, padding: 8, flex: "1 1 auto", overflowY: "auto", background: "#191924", minHeight: 0 }}>
            {cart.length === 0 && <p style={{ color: "#888", margin: "4px 0" }}>ยังไม่มีสินค้าในตะกร้า</p>}
            {cart.map((item, i) => (
              <div key={`${item.name}-${i}`} style={{ display: "grid", gridTemplateColumns: "46px 1fr auto", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i !== cart.length - 1 ? "1px solid #2a2a35" : "none" }}>
                <div style={{ width: 46, height: 46, borderRadius: 6, background: "#111722", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <img src={item.img} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                  <div style={qtyBox}>
                    <button onClick={() => minus(i)} style={qtyBtn}>-</button>
                    <span style={qtyNum}>{item.qty}</span>
                    <button onClick={() => plus(i)} style={qtyBtn}>+</button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13 }}>{item.price * item.qty} บาท</p>
              </div>
            ))}
          </div>

          {/* คูปอง */}
          <h3 style={{ marginTop: 12, marginBottom: 6 }}>ใช้คูปอง</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ownedCoupons.length === 0 && <p style={{ color: "#888" }}>ยังไม่มีคูปอง</p>}
            {ownedCoupons.map((c) => (
              <button
                key={c.code}
                onClick={() => setDiscount(c.discount)}
                style={{ background: discount === c.discount ? "#a855f7" : "#2a2a35", border: "1px solid #a855f7", color: "white", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
              >
                {c.code} ({c.discount * 100}%)
              </button>
            ))}
            {discount > 0 && (
              <button onClick={() => setDiscount(0)} style={{ background: "#444", color: "white", border: "none", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>
                ยกเลิก
              </button>
            )}
          </div>

          {/* สรุปยอด */}
          <div style={{ marginTop: 12 }}>
            <p style={{ margin: "0 0 4px" }}>ยอดรวม: {subtotal} บาท</p>
            {discount > 0 && <p style={{ color: "#a855f7", margin: "0 0 4px" }}>ใช้คูปองแล้ว ({discount * 100}%)</p>}
            <p style={{ color: "#22c55e", margin: "0 0 6px" }}>ส่วนลด: -{subtotal * discount} บาท</p>
            <h3 style={{ color: "#c084fc", margin: "0 0 8px" }}>สุทธิ: {total} บาท</h3>
          </div>

          <button onClick={() => setShowPayment(true)} style={payBtn}>สั่งซื้อสินค้า</button>
        </div>
      </div>

      {/* ---------- โมดัลชำระเงิน ---------- */}
      {showPayment && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: 16 }}
          onClick={() => { setShowPayment(false); setPaid(false); }}
        >
          <div
            style={{ position: "relative", background: "#14141c", borderRadius: 16, width: 420, maxWidth: "95vw", maxHeight: "88vh", boxShadow: "0 0 28px rgba(168,85,247,0.35)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ปุ่มปิด */}
            <button
              onClick={() => { setShowPayment(false); setPaid(false); }}
              aria-label="ปิด"
              style={{ position: "absolute", right: 10, top: 10, background: "rgba(0,0,0,0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", width: 32, height: 32, borderRadius: 999, cursor: "pointer" }}
            >
              ✕
            </button>

            {/* ส่วนหัวของโมดัล */}
            <div style={{ padding: "16px 16px 8px", borderBottom: "1px solid #262635" }}>
              <h2 style={{ margin: 0, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 999, background: "#f0b90b" }} />
                {paid ? "ใบเสร็จ" : "ชำระเงิน"}
              </h2>
            </div>

            {/* เนื้อหาโมดัล */}
            <div className="payScroll" style={{ padding: 16, overflowY: "auto", flex: "1 1 auto" }}>
              <style>{`.payScroll::-webkit-scrollbar{width:6px}.payScroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.25);border-radius:8px}.payScroll::-webkit-scrollbar-thumb{background:#0a0a0a;border-radius:8px}`}</style>

              {!paid ? (
                <>
                  {/* รายการสินค้าในใบแจ้งชำระ */}
                  <div style={{ background: "#1f1f2b", padding: 10, borderRadius: 10, marginBottom: 10, border: "1px solid #27273a", maxHeight: 220, overflowY: "auto" }}>
                    {cart.map((item, i) => (
                      <div key={`${item.name}-r-${i}`} style={{ display: "grid", gridTemplateColumns: "44px 1fr auto", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i !== cart.length - 1 ? "1px solid #2a2a35" : "none" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 6, background: "#111722", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          <img src={item.img} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                          <small style={{ opacity: 0.8 }}>{item.qty} x {item.price}</small>
                        </div>
                        <p style={{ margin: 0 }}>{item.price * item.qty}</p>
                      </div>
                    ))}
                  </div>

                  <p style={{ margin: "8px 0 0" }}>ยอดสุทธิ: <b style={{ color: "#c084fc" }}>{total} บาท</b></p>

                  {/* เลือกธนาคาร */}
                  <div style={{ marginTop: 12 }}>
                    <p style={{ margin: "0 0 10px", fontSize: 14 }}>เลือกธนาคาร</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, justifyItems: "center" }}>
                      <button type="button" onClick={() => setBank("SCB")}
                        style={{ width: 140, padding: 14, borderRadius: 14, background: bank === "SCB" ? "rgba(168,85,247,0.14)" : "rgba(255,255,255,0.04)", border: bank === "SCB" ? "2px solid #a855f7" : "1px solid #3a3a4a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <div style={{ width: 86, height: 86, borderRadius: 12, background: "#0f0f17", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}>
                          <img src="/images1/SCB.png" alt="SCB" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", display: "block" }} />
                        </div>
                        <span style={{ marginTop: 8, fontSize: 13, color: "#e7e7ff" }}>SCB</span>
                      </button>

                      <button type="button" onClick={() => setBank("KBank")}
                        style={{ width: 140, padding: 14, borderRadius: 14, background: bank === "KBank" ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.04)", border: bank === "KBank" ? "2px solid #22c55e" : "1px solid #3a3a4a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <div style={{ width: 86, height: 86, borderRadius: 12, background: "#0f0f17", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}>
                          <img src="/images1/KBANK.jpg" alt="KBank" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", display: "block" }} />
                        </div>
                        <span style={{ marginTop: 8, fontSize: 13, color: "#e7e7ff" }}>KBank</span>
                      </button>

                      <button type="button" onClick={() => setBank("KTB")}
                        style={{ width: 140, padding: 14, borderRadius: 14, background: bank === "KTB" ? "rgba(59,130,246,0.14)" : "rgba(255,255,255,0.04)", border: bank === "KTB" ? "2px solid #3b82f6" : "1px solid #3a3a4a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <div style={{ width: 86, height: 86, borderRadius: 12, background: "#0f0f17", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}>
                          <img src="/images1/KTB.png" alt="KTB" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", display: "block" }} />
                        </div>
                        <span style={{ marginTop: 8, fontSize: 13, color: "#e7e7ff" }}>KTB</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // ใบเสร็จ (หลังชำระสำเร็จ)
                <div style={{ background: "white", color: "black", padding: 16, borderRadius: 10 }}>
                  <h3 style={{ textAlign: "center", marginTop: 0 }}>🧾 RECEIPT</h3>
                  {cart.map((item, i) => (
                    <div key={`${item.name}-r-${i}`} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{item.name} x{item.qty}</span>
                      <span>{item.price * item.qty}</span>
                    </div>
                  ))}
                  <hr />
                  <p style={{ margin: "6px 0" }}>รวม: {subtotal}</p>
                  <p style={{ margin: "6px 0" }}>ส่วนลด: -{subtotal * discount}</p>
                  <h3 style={{ margin: "6px 0" }}>สุทธิ: {total} บาท</h3>
                  <p style={{ margin: "6px 0" }}>ธนาคาร: {bank}</p>
                  <p style={{ margin: "6px 0" }}>สถานะ: ชำระเงินสำเร็จ ✔</p>
                </div>
              )}
            </div>

            {/* ปุ่มล่างของโมดัล */}
            <div style={{ padding: 16, borderTop: "1px solid #262635", background: "#14141c" }}>
              {!paid ? (
                <>
                  <button
                    onClick={() => {
                      if (cart.length === 0) return alert("กรุณาเพิ่มสินค้าในตะกร้า");
                      if (!bank) return alert("เลือกธนาคารก่อน");
                      // ส่งคำสั่งซื้อให้แอดมิน (ผ่าน Context) แต่ไม่เปลี่ยนหน้า
                      addOrder(buildOrder());
                      setShowPayment(false);
                      setPaid(false);
                      setCart([]);
                    }}
                    style={{ width: "100%", padding: 12, background: "#22c55e", border: "none", borderRadius: 10, color: "white", fontWeight: 700, cursor: "pointer" }}
                  >
                    ยืนยันการชำระเงิน
                  </button>
                  <button
                    onClick={() => { setShowPayment(false); setPaid(false); }}
                    style={{ width: "100%", padding: 10, marginTop: 8, background: "#444", border: "none", borderRadius: 10, color: "white", cursor: "pointer" }}
                  >
                    ยกเลิก
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setShowPayment(false); setPaid(false); setCart([]); }}
                  style={{ width: "100%", padding: 10, background: "#a855f7", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: 600 }}
                >
                  เสร็จสิ้น
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;