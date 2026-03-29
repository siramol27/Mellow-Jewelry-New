/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const CouponContext = createContext();

//   คูปองเริ่มต้น
const defaultCoupons = [
  { id: 1, code: "SAVE10", discount: 0.10 },
  { id: 2, code: "MELLOW20", discount: 0.20 },
];

export const CouponProvider = ({ children }) => {

  //   โหลดจาก localStorage ก่อน
  const stored = JSON.parse(localStorage.getItem("coupons") || "null");
  const [coupons, setCoupons] = useState(stored || defaultCoupons);

  //   บันทึกทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem("coupons", JSON.stringify(coupons));
  }, [coupons]);

  //   เพิ่มคูปองใหม่
  const addCoupon = (data) => {
    const newCoupon = {
      id: Date.now(),
      code: data.code,
      discount: Number(data.discount),
    };
    setCoupons(prev => [...prev, newCoupon]);
  };

  //   แก้ไขคูปอง
  const updateCoupon = (id, newData) => {
    setCoupons(prev =>
      prev.map(c => (c.id === id ? { ...c, ...newData } : c))
    );
  };

  //   ลบคูปอง
  const deleteCoupon = (id) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <CouponContext.Provider value={{ coupons, addCoupon, updateCoupon, deleteCoupon }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupons = () => useContext(CouponContext);