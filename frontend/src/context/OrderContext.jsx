import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

/**
 * สร้าง Context สำหรับจัดการ "คำสั่งซื้อ" ทั้งระบบ
 * - เก็บรายการออเดอร์ (orders)
 * - เพิ่มออเดอร์ (addOrder)
 * - เปลี่ยนสถานะออเดอร์ (updateOrderStatus)
 * - ล้างออเดอร์ทั้งหมด (clearOrders)
 * กำหนดค่าเริ่มต้นเป็นฟังก์ชันเปล่า ๆ เพื่อกัน error เวลา context ยังไม่ถูกครอบ
 */
export const OrderContext = createContext({
  orders: [],
  addOrder: () => {},
  updateOrderStatus: () => {},
  clearOrders: () => {},
});

/**
 * ฟังก์ชันอ่านค่าเริ่มต้นของ orders จาก localStorage แบบปลอดภัย
 * - เผื่อกรณี JSON.parse พัง หรือ key ไม่มี ให้คืนเป็น []
 * - ใช้เป็น initialState ของ useState เพื่อให้โหลดจาก storage แค่ครั้งเดียวตอน mount
 */
const safeLoad = () => {
  try {
    const raw = localStorage.getItem("orders");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const OrderProvider = ({ children }) => {
  // state หลักเก็บรายการออเดอร์ทั้งหมด
  const [orders, setOrders] = useState(safeLoad);

  /**
   * เมื่อ orders เปลี่ยน ให้บันทึกลง localStorage ทันที
   * - ทำให้ข้อมูลยังอยู่แม้ผู้ใช้รีเฟรชหน้า
   * - ครอบ try/catch กัน storage quota/policy ทำให้ throw
   */
  useEffect(() => {
    try {
      localStorage.setItem("orders", JSON.stringify(orders || []));
    } catch {}
  }, [orders]);

  /**
   * เพิ่มออเดอร์ใหม่
   * - วางรายการใหม่ไว้ "บนสุด" เพื่อให้เห็นรายการล่าสุดก่อน
   * - เติม id และ createdAt ให้ถ้ายังไม่มี (ใช้ timestamp / ISO string)
   * - ใช้ useCallback เพื่อล็อก reference ไม่ให้เปลี่ยนทุกรอบ render
   */
  const addOrder = useCallback((order) => {
    setOrders((prev) => [
      {
        ...order,
        id: order.id ?? Date.now(),
        createdAt: order.createdAt ?? new Date().toISOString(),
      },
      ...(Array.isArray(prev) ? prev : []),
    ]);
  }, []);

  /**
   * เปลี่ยนสถานะของออเดอร์ตาม id
   * - แก้เฉพาะตัวที่ id ตรงกัน ตัวอื่นคงเดิม
   * - ใช้ map คืนอาร์เรย์ใหม่ (ไม่แก้ไขของเดิมโดยตรง)
   */
  const updateOrderStatus = useCallback((id, status) => {
    setOrders((prev) =>
      (prev || []).map((o) => (o.id === id ? { ...o, status } : o))
    );
  }, []);

  /**
   * ล้างรายการออเดอร์ทั้งหมด
   * - ใช้ตอนทดสอบ/รีเซ็ตข้อมูล (ควรหลบไว้เฉพาะ dev เท่านั้นในระบบจริง)
   */
  const clearOrders = useCallback(() => setOrders([]), []);

  /**
   * รวมฟังก์ชัน/สถานะที่ต้องการแชร์ให้ลูก ๆ ผ่าน Context
   * - useMemo ลดการสร้าง object ใหม่โดยไม่จำเป็น (ช่วยเรื่อง re-render)
   */
  const value = useMemo(
    () => ({ orders, addOrder, updateOrderStatus, clearOrders }),
    [orders, addOrder, updateOrderStatus, clearOrders]
  );

  // ครอบ children ด้วย Provider เพื่อให้ useOrders() ดึงค่าไปใช้ได้จากทุกที่
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

/**
 * hook อำนวยความสะดวก
 * - เรียกใช้แทน useContext(OrderContext) เพื่อให้โค้ดที่หน้าอื่นอ่านง่ายขึ้น
 */
export const useOrders = () => useContext(OrderContext);