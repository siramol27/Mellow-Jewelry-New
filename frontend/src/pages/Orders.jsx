import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

// ถ้ามี AppContext เก็บ backendUrl อยู่แล้ว แนะนำดึงจาก Context
const BACKEND_URL = "http://localhost:4000";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  //  สร้าง axios instance ที่แน่ใจว่าแนบคุกกี้เสมอ
  const api = useMemo(
    () =>
      axios.create({
        baseURL: BACKEND_URL,
        withCredentials: true, // สำคัญ: ให้ส่งคุกกี้ token
        headers: { "Content-Type": "application/json" },
        // ให้สถานะนอกช่วง 2xx โยน error ไป catch
        validateStatus: (s) => s >= 200 && s < 300,
      }),
    []
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        // 🔁 แก้ path ให้ถูก: /api/orders (Owner/Admin เท่านั้น)
        const { data } = await api.get("/api/orders");

        // เผื่อฝั่งเซิร์ฟเวอร์ส่งห่อเป็น { success, data } หรือเป็น Array ตรง ๆ
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setOrders(list);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "ไม่สามารถโหลดคำสั่งซื้อได้";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  // จัดรูปแบบเงิน
  const money = (n) =>
    typeof n === "number" ? n.toLocaleString("th-TH") : n;

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h1>📦 คำสั่งซื้อ</h1>
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ padding: 40 }}>
        <h1>📦 คำสั่งซื้อ</h1>
        <p style={{ color: "crimson" }}>{err}</p>
        <p style={{ color: "#888" }}>
          ตรวจสอบว่าคุณล็อกอินด้วยสิทธิ์ <b>Owner/Admin</b> แล้วหรือยัง
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>📦 คำสั่งซื้อ</h1>

      {orders.length === 0 ? (
        <p style={{ color: "#888" }}>ยังไม่มีคำสั่งซื้อ</p>
      ) : (
        orders.map((o) => (
          <div
            key={o.id || o._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <div>
              <b>OrderID:</b> {o.id || o._id}
            </div>
            <div>
              <b>วันที่:</b>{" "}
              {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
            </div>
            <div>
              <b>ธนาคาร:</b> {o.bank || "-"}
            </div>
            <div>
              <b>คูปอง:</b> {o.couponCode || "-"}
            </div>
            <div>
              <b>ยอดรวม:</b> {money(o.subtotal)} | <b>ส่วนลด:</b>{" "}
              {money(o.discount)} | <b>สุทธิ:</b> {money(o.total)} บาท
            </div>
            <div>
              <b>สถานะ:</b>{" "}
              <span style={{ color: "#7c3aed" }}>{o.status}</span>
            </div>

            <div style={{ marginTop: 8 }}>
              <b>รายการ:</b>
              {(o.items || []).map((it, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr auto",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#f7f7f7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    {it.img ? (
                      <img
                        src={it.img}
                        alt=""
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : null}
                  </div>
                  <div>
                    {it.name} x {it.qty}
                  </div>
                  <div>{money((it.price || 0) * (it.qty || 1))} บาท</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;