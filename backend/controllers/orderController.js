
import Order from "../models/orderModel.js";
/**
 * 📌 GET /api/orders  (Admin/Owner)
 * ดึงออเดอร์ทั้งหมด เรียงจากใหม่ -> เก่า
 */
export async function listAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Error listAllOrders:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * 📌 GET /api/orders/api/auth/member  (ลูกค้า)
 * ดึงออเดอร์เฉพาะของ user
 */
export async function listMyOrders(req, res) {
  try {
    const userId = req.user?.id || req.user?._id; // เผื่อ JWT เก็บแบบไหน
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Error listMyOrders:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * 📌 POST /api/orders
 * ลูกค้าสร้างคำสั่งซื้อ
 */
export async function createOrder(req, res) {
  try {
    const { buyerName, items, total, status } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items required" });
    }

    const order = await Order.create({
      buyerName: buyerName || "ลูกค้าทั่วไป",
      items,
      total: Number(total) || 0,
      status: status || "ใหม่",
    });

    return res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error("Error createOrder:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * 📌 PATCH /api/orders/:id/status
 * อัปเดตสถานะคำสั่งซื้อ
 */
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status required" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "order not found" });
    }

    return res.json({ success: true, data: order });
  } catch (err) {
    console.error("Error updateOrderStatus:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * 📌 DELETE /api/orders/:id
 * ลบออเดอร์ (ถ้าต้องการ)
 */
export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "order not found" });
    }

    return res.json({ success: true, message: "ลบคำสั่งซื้อแล้ว" });
  } catch (err) {
    console.error("Error deleteOrder:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}