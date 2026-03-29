import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    verifyOTP: { type: String, default: '' },
    verifyOTPExpire: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    resetOTP: { type: String, default: '' },
    resetOTPExpire: { type: Number, default: 0 },

    role: { type: String, enum: ["customer", "owner", "admin"], default: "customer" },

    isActive: { type: Boolean, default: true },

    claimedCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],

    //     เพิ่มสองฟิลด์นี้ (สำคัญ)
    username: { type: String, default: "" },
    avatar: { type: String, default: "" },

}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;