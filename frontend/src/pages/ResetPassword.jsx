import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // --- ฟอร์มหลัก ---
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // --- toggle แสดง/ซ่อนรหัสผ่าน ---
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- สถานะ UI ---
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ส่งฟอร์มรีเซ็ตรหัสผ่าน
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // ตรวจ token จากพารามิเตอร์ก่อน
    if (!token) {
      return setError("ลิงก์ไม่ถูกต้อง");
    }

    // เช็คว่ารหัสผ่านสองช่องตรงกัน
    if (password !== confirm) {
      return setError("รหัสผ่านไม่ตรงกัน");
    }

    // ความยาวขั้นต่ำ (คุณตั้งไว้ 6)
    if (password.length < 6) {
      return setError("รหัสต้องอย่างน้อย 6 ตัว");
    }

    try {
      setLoading(true);

      // เรียกรีเซ็ต
      const res = await axios.post(
        "http://localhost:4000/api/auth/reset-password",
        { token, password },
        { withCredentials: true }
      );

      if (!res.data.success) {
        return setError(res.data.message || "รีเซ็ตไม่สำเร็จ");
      }

      setMessage("รีเซ็ตรหัสผ่านสำเร็จ 🎉");

      // ออกจากระบบ cookie เก่าก่อน (กัน session เก่า)
      await axios.post(
        "http://localhost:4000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      // พาไปหน้าเข้าสู่ระบบ
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="bg-black/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md border border-purple-500">
        {/* หัวข้อ */}
        <h2 className="text-2xl font-bold text-center text-purple-400 mb-4">
          รีเซ็ตรหัสผ่าน 🔐
        </h2>

        <p className="text-sm text-gray-300 mb-6 text-center">
          กรุณาตั้งรหัสผ่านใหม่ที่ปลอดภัย
        </p>

        {/* ฟอร์มตั้งรหัสผ่านใหม่ */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ช่องรหัสผ่านใหม่ + toggle แสดง/ซ่อน */}
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"} // ⬅ toggle type
              placeholder="รหัสผ่านใหม่"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-24 rounded-lg bg-gray-900 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoComplete="new-password"
            />

            {/* ปุ่ม toggle แสดง/ซ่อนรหัสผ่าน */}
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md text-xs font-medium border border-purple-500/60 text-purple-200/90 hover:bg-purple-500/10"
            >
              {showPwd ? "ซ่อน" : "แสดง"}
            </button>
          </div>

          {/* ช่องยืนยันรหัสผ่าน + toggle แสดง/ซ่อน */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"} // ⬅ toggle type
              placeholder="ยืนยันรหัสผ่าน"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 pr-24 rounded-lg bg-gray-900 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoComplete="new-password"
            />

            {/* ปุ่ม toggle แสดง/ซ่อนยืนยันรหัส */}
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md text-xs font-medium border border-purple-500/60 text-purple-200/90 hover:bg-purple-500/10"
            >
              {showConfirm ? "ซ่อน" : "แสดง"}
            </button>
          </div>

          {/* กล่องข้อความผลลัพธ์ */}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}

          {/* ปุ่มส่งฟอร์ม */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 transition p-3 rounded-lg text-white font-semibold disabled:opacity-50"
          >
            {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
          </button>
        </form>

        {/* ลิงก์กลับเข้าสู่ระบบ */}
        <div className="text-center mt-4">
          <a href="/login" className="text-purple-400 hover:underline text-sm">
            กลับไปหน้าเข้าสู่ระบบ
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;