import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import conn from "./config/mongodb.js";
import dns from "dns/promises";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

//   DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const port = process.env.PORT || 4000;

//   Allow localhost + vercel
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  process.env.CORS_ORIGIN
];

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
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//   ROOT
app.get("/", (req, res) => {
  res.send("API is working...");
});

//   ROUTES
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

//   404
app.use((req, res) => {
  return res.status(404).json({ success: false, message: "Not Found" });
});

//   ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  return res
    .status(500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

//   START SERVER
(async () => {
  try {
    await conn(); // 🔥 connect MongoDB
    app.listen(port, () => {
      console.log(`  Server running on port ${port}`);
    });
  } catch (e) {
    console.error("❌ Failed to start server:", e);
    process.exit(1);
  }
})();