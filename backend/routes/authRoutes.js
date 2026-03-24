console.log("🔥 authRoutes ถูกโหลดแล้ว")

import express from 'express';

// 👉 เพิ่ม resetPassword เข้ามาด้วย (สำคัญมาก)
import { 
  register, 
  login, 
  logout, 
  getMe, 
  forgotPassword,
  resetPassword   
} from '../controllers/authController.js';

import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();


// ================= REGISTER =================
// สมัครสมาชิก
authRouter.post('/register', register)


// ================= LOGIN =================
// เข้าสู่ระบบ
authRouter.post('/login', login)


// ================= LOGOUT =================
// ออกจากระบบ
authRouter.post('/logout', logout)


// ================= GET USER =================
// ดึงข้อมูลผู้ใช้ (ต้อง login ก่อน)
authRouter.get('/member', userAuth, getMe)


// ================= FORGOT PASSWORD =================
// ลืมรหัสผ่าน → ส่งลิงก์ไป email
authRouter.post('/forgot-password', forgotPassword)


// ================= RESET PASSWORD =================
// ตั้งรหัสใหม่ (สำคัญมาก ไม่งั้นใช้ไม่ได้)
authRouter.post('/reset-password', resetPassword)


export default authRouter;