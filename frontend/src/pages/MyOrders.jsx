import React from "react";
import { useOrders } from "../context/OrderContext";

export default function MyOrders() {
  const { orders, cancelOrder } = useOrders();

  const currentUser =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(localStorage.getItem("currentUser")) || {};

  const myOrders = orders.filter(
    (o) =>
      o.buyerName === currentUser.username ||
      o.buyerName === currentUser.email ||
      o.buyerName === currentUser.name
  );

  return (
    <div
      style={{
        padding: 40,
        background: "#0f0f14",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/*   หัวข้อ + เส้นคั่น + เว้นช่องเยอะขึ้น */}
      <h1 style={{ fontSize: 28, marginBottom: 18 }}>คำสั่งซื้อของฉัน</h1>

      <div
        style={{
          width: "100%",
          height: 2,
          background: "#333",
          marginBottom: 55, //   ช่องว่างด้านล่างตามที่ขอ
        }}
      />

      {/*   ไม่มีคำสั่งซื้อ */}
      {myOrders.length === 0 && (
        <p style={{ color: "#aaa" }}>ยังไม่มีคำสั่งซื้อ</p>
      )}

      {/*   การ์ดอยู่ซ้ายมือเสมอ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {myOrders.map((order) => (
          <div
            key={order.id}
            style={{
              background: "#1a1a23",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #333",
              width: "480px", //   ชิดซ้ายขนาดพอดี
            }}
          >
            <h3 style={{ marginBottom: 5 }}>หมายเลขคำสั่งซื้อ: {order.id}</h3>

            <p style={{ color: "#bbb", marginBottom: 10 }}>
              วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleString()}
            </p>

            <h4 style={{ marginBottom: 8, color: "#c084fc" }}>รายการสินค้า</h4>

            <ul style={{ marginLeft: 20, marginBottom: 15, lineHeight: 1.6 }}>
              {order.items.map((it, idx) => (
                <li key={idx}>
                  {it.name} × {it.qty} = {it.price * it.qty} บาท
                </li>
              ))}
            </ul>

            <p style={{ marginBottom: 6 }}>
              <b>รวมสุทธิ: {order.total} บาท</b>
            </p>

            <p style={{ color: "#a78bfa", marginBottom: 12 }}>
              สถานะ: {order.status}
            </p>

            {/*   แสดงรูปสลิป (ขึ้นแน่นอน) */}
            {order.slip && (
              <div style={{ marginTop: 10 }}>
                {/*   รองรับ base64 string */}
                {typeof order.slip === "string" &&
                order.slip.startsWith("data:image") ? (
                  <img
                    src={order.slip}
                    alt="slip"
                    style={{
                      width: "140px",
                      borderRadius: 8,
                      border: "1px solid #555",
                    }}
                  />
                ) : (
                  order.slip /*   รองรับ JSX <img /> */
                )}
              </div>
            )}

            {/*   ปุ่มยกเลิกเมื่อรอตรวจสอบ */}
            {order.status === "รอตรวจสอบ" && (
              <button
                onClick={() => cancelOrder(order.id)}
                style={{
                  marginTop: 15,
                  padding: "10px 14px",
                  background: "#80304a",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                ยกเลิกคำสั่งซื้อ
              </button>
            )}
          </div>
        ))}
      </div>

      {/*   Footer อยู่ล่างสุด */}
      <div
        style={{
          marginTop: "auto",
          padding: "40px 0",
          textAlign: "center",
          borderTop: "1px solid #222",
          color: "#aaa",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: "bold" }}>Mellow Jewelry</div>
        © 2026 Mellow Jewelry. All rights reserved.
      </div>
    </div>
  );
}