console.log("✅ Force redeploy at", new Date());
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import conn from "./config/mongodb.js";
import dns from "dns/promises";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

// ✅ DNS Fix
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const port = process.env.PORT || 4000;

// ✅ Allowed origins (localhost + Vercel.)
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  process.env.CORS_ORIGIN
];

// ✅ CORS Options — เวอร์ชันแก้ครบ
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const allowed = allowedOrigins.some((item) => {
      if (!item) return false;
      if (item instanceof RegExp) return item.test(origin);
      return item === origin;
    });

    if (allowed) return callback(null, true);

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  exposedHeaders: "set-cookie",     // ✅ สำคัญมาก ทำให้ Cookie ส่งข้ามโดเมนได้
};

// ✅ ต้องเพิ่ม header นี้ก่อน cors() ด้วย
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ เปิด CORS
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ✅ ✅ FIX สำคัญสุด: ทำให้ secure cookie ทำงานบน Render
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  console.log("✅ TRUST PROXY ENABLED");
}

// ✅ Root
app.get("/", (req, res) => {
  res.send("API is working...");
});

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// ✅ 404
app.use((req, res) => {
  return res.status(404).json({ success: false, message: "Not Found" });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  return res
    .status(500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

// ✅ Start Server
(async () => {
  try {
    await conn();
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`✅ NODE_ENV = ${process.env.NODE_ENV}`);
      console.log(`✅ CORS_ORIGIN = ${process.env.CORS_ORIGIN}`);
    });
  } catch (e) {
    console.error("❌ Failed to start server:", e);
    process.exit(1);
  }
})();