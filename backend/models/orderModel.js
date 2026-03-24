// backend/models/orderModel.js
import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ผู้สั่งซื้อ (ถ้ามีระบบผู้ใช้)
    buyerName: { type: String, default: 'ลูกค้า' },
    items: { type: [ItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['ใหม่', 'รอชำระ', 'ชำระแล้ว', 'ยกเลิก'], default: 'ใหม่' },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);
export default Order;