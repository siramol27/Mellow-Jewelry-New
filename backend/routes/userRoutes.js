import express from "express";
import userAuth from "../middleware/userAuth.js";
import { updateUserProfile } from "../controllers/authController.js";

const router = express.Router();

//   อัปเดตโปรไฟล์ผู้ใช้
router.put("/update/:id", userAuth, updateUserProfile);

export default router;