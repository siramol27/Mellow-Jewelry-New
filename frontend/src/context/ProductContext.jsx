/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const ProductContext = createContext();

const defaultProducts = [
  { id: 1, name: "แหวนเพชร", price: 3290, img: "/images/feature2.2.webp", desc: "" },
  { id: 2, name: "ต่างหูไข่มุก", price: 1290, img: "/images/23.webp", desc: "" },
  { id: 3, name: "สร้อยคอ", price: 2890, img: "/images/istockphoto-522545031-612x612.jpg", desc: "" },
  { id: 4, name: "แหวนเงินชมพู", price: 2790, img: "/images/shopping.webp", desc: "" },
  { id: 5, name: "สร้อยข้อมือไข่มุก", price: 1890, img: "/images/133852_1.webp", desc: "" },
  { id: 6, name: "ต่างหูคริสตัล", price: 990, img: "/images/5211-5213-mp4.webp", desc: "" },
  { id: 7, name: "แหวนทองคำขาว", price: 3590, img: "/images/lozenge.jpg", desc: "" },
  { id: 8, name: "กำไลเงินแท้", price: 1590, img: "/images/w5zb1v.jpg", desc: "" },
];

export const ProductProvider = ({ children }) => {

  //  โหลดจาก localStorage ถ้ามี
  const stored = JSON.parse(localStorage.getItem("products") || "null");

  const [products, setProducts] = useState(stored || defaultProducts);

  //  บันทึกลง localStorage ทุกครั้งที่ products เปลี่ยน
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  //  เพิ่มสินค้าใหม่
  const addProduct = (data) => {
    const newProduct = {
      id: Date.now(),
      name: data.name,
      price: Number(data.price),
      img: data.img || "/images/fallback.jpg",
      desc: data.desc || "",
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  //  ลบ
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  //  แก้ไข
  const updateProduct = (id, newData) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, ...newData } : p)
    );
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      deleteProduct,
      updateProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);