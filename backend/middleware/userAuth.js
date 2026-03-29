import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    //   ดึง Token จาก Cookie
    const cookieToken = req.cookies?.token;

    //   ดึง Token จาก Header
    const authHeader = req.headers.authorization || "";
    const headerToken = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : "";

    //   เลือก Token ที่มีอยู่
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      });
    }

    //   หา secret จาก env แบบปลอดภัย
    const secret = process.env.JWT_SECRET || process.env.jwt_secret;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "เซิร์ฟเวอร์ตั้งค่า JWT_SECRET ไม่ครบ",
      });
    }

    //   ตรวจ token
    const decoded = jwt.verify(token, secret);

    //   บันทึกข้อมูล user ลง req
    req.userId = decoded.id;
    req.user = {
      id: decoded.id,
      role: decoded.role || "customer",
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token ไม่ถูกต้องหรือหมดอายุ",
    });
  }
};

export default userAuth;