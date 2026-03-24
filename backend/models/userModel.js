import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        verifyOTP: {type: String, default: ''},
        verifyOTPExpire: {type: Number, default: 0},
        isVerified: {type: Boolean, default: false},
        resetOTP: {type: String, default: ''},
        resetOTPExpire: {type: Number, default: 0},

        // --- เพิ่มเพื่อรองรับสิทธิ์การใช้งาน (Customer/Owner/Admin) และการจัดการระบบ ---
        role: { type: String, enum: ["customer", "owner", "admin"], default: "customer" },

        // เปิด/ปิดการใช้งานผู้ใช้ (Admin ใช้ปิดบัญชีชั่วคราวได้)
        isActive: { type: Boolean, default: true },

        // ถ้าต้องการให้ผู้ใช้ "กดรับคูปอง" ก่อนถึงใช้ได้
        // จะเก็บรายการคูปองที่ผู้ใช้เคยกดรับไว้ที่นี่ (ต้องมี Coupon model)
        claimedCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],

}, { timestamps: true }); // เปิด timestamps เพื่อเก็บ createdAt/updatedAt อัตโนมัติ

//บรรทัดนี้สำหรับสร้างโมเดลของผู้ใช้ โดยใช้ชื่อ "user" และโครงสร้างที่กำหนดใน userSchema
//โดยเครื่องหมาย || จะตรวจสอบวามีโมเดล "user" อยู่แล้วหรือไม่ ถ้ามีจะใช้โมเดลที่มีอยู่แล้ว
// แต่ถ้าไม่มีจะสร้างโมเดลขึ้นมาใหม่
const userModel = mongoose.models.user || mongoose.model("user" , userSchema)

//บรรทัดนี้สำหรับนำไฟล์ไปใช้ในที่อื่นๆ โดยการเรียกใช้ชื่อ userModel
export default userModel