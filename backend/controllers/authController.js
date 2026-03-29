console.log("🔥 authController ถูกโหลดแล้ว")
// authControlle.js ย่อมาจาก authentication controller

import userModel from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporter from "../config/nodemailer.js";

// ================= REGISTER =================
export const register = async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" })
    }

    try {
        const existingUser = await userModel.findOne({ email })

        if (existingUser) {
            return res.json({ success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new userModel({ name, email, password: hashedPassword })
        await user.save()

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.json({
            success: true,
            message: "ลงทะเบียนสำเร็จ",
            user: { name: user.name, email: user.email }
        })

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}



// ================= LOGIN =================
export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "ข้อมูลไม่ถูกต้อง" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true,
            message: "เข้าสู่ระบบสำเร็จ",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "member"
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};



// ================= LOGOUT =================
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })

        return res.json({ success: true, message: "ออกจากระบบสำเร็จ" })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}



// ================= GET ME =================
export const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password')

        if (!user) {
            return res.json({ success: false, message: "ไม่พบผู้ใช้" })
        }
        return res.json({ success: true, user })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}



// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.json({ success: false, message: "กรุณากรอกอีเมล" })
    }

    try {
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "ไม่พบอีเมลนี้" })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        )

        return res.json({
            success: true,
            token
        })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}



// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
    const { token, password } = req.body

    if (!token || !password) {
        return res.json({ success: false, message: "ข้อมูลไม่ครบ" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.json({ success: false, message: "ไม่พบผู้ใช้" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        user.password = hashedPassword
        await user.save()

        return res.json({
            success: true,
            message: "รีเซ็ตรหัสผ่านสำเร็จ"
        })

    } catch (error) {
        return res.json({ success: false, message: "token ไม่ถูกต้อง หรือหมดอายุ" })
    }
}



// ================= UPDATE PROFILE =================
export const updateUserProfile = async (req, res) => {
    console.log("📌 updateUserProfile ถูกเรียกแล้ว");

    try {
        const userId = req.userId || req.params.id;

        const { username, avatar } = req.body;

        if (userId !== req.params.id) {
            return res.json({
                success: false,
                message: "ไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้นี้",
            });
        }

        const updated = await userModel.findByIdAndUpdate(
            userId,
            {
                username: username,
                avatar: avatar
            },
            { new: true }
        ).select("-password");

        if (!updated) {
            return res.json({ success: false, message: "ไม่พบผู้ใช้" });
        }

        return res.json({
            success: true,
            message: "อัปเดตข้อมูลสำเร็จ",
            user: updated
        });

    } catch (error) {
        console.error("❌ Update Profile Error:", error);
        return res.json({ success: false, message: error.message });
    }
};