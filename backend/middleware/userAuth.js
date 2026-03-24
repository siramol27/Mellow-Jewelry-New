import jwt from 'jsonwebtoken'

const userAuth = (req, res, next) => {
    try {
        // ดึง token จาก cookie ที่ส่งมาพร้อมกับคำขอ
        const { token: cookieToken } = req.cookies || {} // ดึง token จาก cookie ที่ส่งมาพร้อมกับคำขอ
        // รองรับเผื่อส่งมาใน Header: Authorization: Bearer <token>
        const authHeader = req.headers.authorization || ''
        const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
        const token = cookieToken || headerToken

        if (!token) {
            return res.status(401).json({ success: false, message: "กรุณาเข้าสู่ระบบก่อน" })
        }

        // ใช้ JWT_SECRET ถ้ามี (fallback ไปตัวแปรเดิมเพื่อเข้ากับโปรเจกต์ปัจจุบัน)
        const secret = process.env.JWT_SECRET || process.env.jwt_secret
        if (!secret) {
            return res.status(500).json({ success: false, message: "เซิร์ฟเวอร์ตั้งค่าไม่ครบ (JWT_SECRET)" })
        }

        const decoded = jwt.verify(token, secret)
        // รองรับ payload ที่มีทั้ง id และ role
        req.userId = decoded.id
        req.user = { id: decoded.id, role: decoded.role || 'customer' }

        next()
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Token ไม่ถูกต้องหรือหมดอายุ"
        }) // ถ้า token ไม่ถูกต้อง ให้ส่งข้อความแจ้งเตือน
    }

}

export default userAuth;