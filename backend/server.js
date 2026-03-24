import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import conn from "./config/mongodb.js";
import dns from "dns/promises";
import authRouter from "./routes/authRoutes.js";

// ตั้ง DNS Resolver เอง (ทางเลือก)
// - ถ้าเครื่อง/เครือข่ายมีปัญหา DNS ช้า หรือเจอ ENOTFOUND บ่อย ๆ การชี้ไปที่ 8.8.8.8/1.1.1.1 จะช่วย
// - ถ้าโปรเจกต์ไม่เจอปัญหาเรื่อง resolve โดเมน จะคอมเมนต์บรรทัดนี้ทิ้งก็ได้
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const port = process.env.PORT || 4000;   // พอร์ตหลักของ API; ถ้าไม่ตั้งใน .env จะใช้ 4000

/** 
 * whitelist โดเมน/พอร์ตที่อนุญาตให้เรียก API ข้ามโดเมน (CORS)
 * - รูปแบบ RegExp เพื่อครอบ dev ทุกพอร์ตของ localhost (เช่น 3000, 5173)
 * - ถ้ามีโดเมนโปรดักชัน ให้เพิ่ม RegExp ด้านล่าง (ตัวอย่างคอมเมนต์ไว้)
 */
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,            // dev: http://localhost:3000,5173,5174 ฯลฯ
  // /^https:\/\/(www\.)?yourdomain\.com$/ // prod (ตัวอย่าง)
];

/** ตั้งค่า CORS กลางของเซิร์ฟเวอร์
 * - origin: ตรวจสอบว่า origin ต้นทางอยู่ใน whitelist หรือไม่ (และยอมรับกรณีไม่มี origin เช่น curl/Postman)
 * - credentials: true เพื่อให้ส่ง cookie/Authorization header ข้ามโดเมนได้
 * - methods/allowedHeaders: เปิด method/headers พื้นฐานที่ต้องใช้
 * - optionsSuccessStatus: เผื่อบาง client แปลผล 204 ได้ถูกต้อง
 */
const corsOptions = {
  origin(origin, callback) {
    // กรณีไม่มี origin (เช่น curl, Postman, หรือ same-origin) ให้ผ่านได้
    if (!origin) return callback(null, true);

    const allowed = allowedOrigins.some((re) => re.test(origin));
    if (allowed) return callback(null, true);

    // ไม่อยู่ใน whitelist → ตอบเป็น error ให้ไปเข้าตัวดักถัดไป
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // ต้องเปิด ถ้าจะใช้ cookie/token ระหว่าง frontend<->backend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

/** มิดเดิลแวร์ระดับแอป */
app.use((req, res, next) => {
  // ใส่ Vary: Origin เพื่อให้ cache/proxy แยกแคชตามต้นทางถูกต้องเมื่อเปิด CORS
  res.setHeader("Vary", "Origin");
  next();
});
app.use(cors(corsOptions));   // เปิด CORS ตาม config ข้างบน
app.use(express.json());      // ให้ Express อ่าน JSON body ได้ (req.body)
app.use(cookieParser());      // ให้ Express อ่าน cookie ได้ (req.cookies)

// สำหรับกรณีวางหลัง proxy/load balancer และจะใช้ secure cookies
// ตั้ง TRUST_PROXY=1 ใน .env แล้วค่อยเปิดบรรทัดนี้
if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

/** เส้นทางทดสอบง่าย ๆ: ใช้เช็คว่าเซิร์ฟเวอร์ยังหายใจอยู่ไหม */
app.get("/", (_req, res) => res.send("API is working..."));

/** รวมกลุ่มเส้นทางจริงของแอป */
// กลุ่ม auth (login/register/me/logout ฯลฯ) จะอยู่ใต้ prefix /api/auth
app.use("/api/auth", authRouter);

// ถ้าจะเพิ่มกลุ่มอื่น ๆ ในอนาคต ให้ import แล้ว mount ตามตัวอย่างด้านล่าง
// import productRoutes from "./routes/productRoutes.js";
// import couponRoutes from "./routes/couponRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// app.use("/api/products", productRoutes);
// app.use("/api/coupons", couponRoutes);
// app.use("/api/orders", orderRoutes);

/** 404 handler
 * - มาที่นี่เมื่อไม่มีเส้นทางไหนรับคำขอ
 * - พิเศษ: ถ้าเป็น preflight (OPTIONS) ให้ตอบ 204 ทันทีเพื่อความไว
 */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return res.status(404).json({ success: false, message: "Not Found" });
});

/** ตัวดัก error ของ CORS (กรณี origin ไม่ผ่าน whitelist) */
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "Not allowed by CORS" });
  }
  return next(err);
});

/** ตัวดัก error รวม
 * - ถ้าไม่เข้าเงื่อนไขอื่น ๆ จะมาเข้าบล็อกนี้
 * - log ฝั่งเซิร์ฟเวอร์ไว้ และตอบ 500 พร้อมข้อความสั้น ๆ กลับไป
 */
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

/** เริ่มต้นเซิร์ฟเวอร์หลังเชื่อม MongoDB สำเร็จ
 * - conn() ควรโยน error ถ้าต่อไม่ได้ → จะเข้า catch และ process.exit(1)
 * - ถ้าต่อได้แล้วค่อย listen ที่พอร์ตที่กำหนด
 */
(async () => {
  try {
    await conn(); // รอให้ MongoDB พร้อมก่อน
    app.listen(port, () => {
      console.log(`เซิร์ฟเวอร์เริ่มทำงานที่พอร์ต : ${port}`);
    });
  } catch (e) {
    console.error("เชื่อมต่อฐานข้อมูลล้มเหลว:", e?.message || e);
    process.exit(1); // ออกจากโปรเซสด้วยสถานะผิดพลาดให้ระบบภายนอก (pm2/docker) restart ได้
  }
})();