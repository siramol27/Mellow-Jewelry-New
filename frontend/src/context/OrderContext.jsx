/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

/**
 * Context จัดการคำสั่งซื้อ
 */
export const OrderContext = createContext({
  orders: [],
  addOrder: () => {},
  updateOrderStatus: () => {},
  cancelOrder: () => {},   
  clearOrders: () => {},
});

/**
 * โหลดข้อมูลจาก localStorage แบบปลอดภัย
 */
const safeLoad = () => {
  try {
    const raw = localStorage.getItem("orders");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn(error);
    return [];
  }
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(safeLoad);

  /**   บันทึก orders ลง localStorage */
  useEffect(() => {
    try {
      localStorage.setItem("orders", JSON.stringify(orders || []));
    } catch (error) {
      console.warn(error);
    }
  }, [orders]);

  /**   เพิ่มคำสั่งซื้อใหม่ */
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

  /**   เปลี่ยนสถานะคำสั่งซื้อ */
  const updateOrderStatus = useCallback((id, status) => {
    setOrders((prev) =>
      (prev || []).map((o) =>
        o.id === id ? { ...o, status } : o
      )
    );
  }, []);

  /**   ยกเลิกคำสั่งซื้อ — สำหรับลูกค้า */
  const cancelOrder = useCallback((id) => {
    setOrders((prev) =>
      (prev || []).map((o) =>
        o.id === id
          ? { ...o, status: "ถูกยกเลิกโดยลูกค้า" }
          : o
      )
    );
  }, []);

  /**   ล้างทั้งหมด */
  const clearOrders = useCallback(() => setOrders([]), []);

  /**   รวมค่าที่แชร์ให้ลูก */
  const value = useMemo(
    () => ({
      orders,
      addOrder,
      updateOrderStatus,
      cancelOrder,     //   เพิ่มตรงนี้
      clearOrders,
    }),
    [orders, addOrder, updateOrderStatus, cancelOrder, clearOrders]
  );

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

/**   Hook ใช้งานง่ายขึ้น */
export const useOrders = () => useContext(OrderContext);