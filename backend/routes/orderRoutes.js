// backend/routes/orderRoutes.js
import express from "express";
import {
  listAllOrders,     //   Admin/Owner
  listMyOrders,      //   ลูกค้า
  createOrder,       //   สร้างออเดอร์
  updateOrderStatus, //   Admin เปลี่ยนสถานะ
  deleteOrder        //   ลบออเดอร์
} from "../controllers/orderController.js";

const router = express.Router();

//   GET ออเดอร์ทั้งหมด (Admin)
router.get("/", listAllOrders);

//   GET ออเดอร์ของลูกค้า (ต้องมีระบบ auth)
router.get("/me", listMyOrders);

//   ลูกค้าสร้างออเดอร์
router.post("/", createOrder);

//   Admin เปลี่ยนสถานะออเดอร์
router.patch("/:id/status", updateOrderStatus);

//   ลบออเดอร์
router.delete("/:id", deleteOrder);

export default router;