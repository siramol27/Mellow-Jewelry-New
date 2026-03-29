// src/pages/EditProfile.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditProfile() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ โหลด user จาก localStorage แบบเดิมของคุณ
  const loadUser = () => {
    const u = JSON.parse(localStorage.getItem("currentUser") || "null") || {};

    // ✅ แก้ปัญหา _id undefined
    if (u.id && !u._id) u._id = u.id;

    return u;
  };

  const user = loadUser();

  const [username, setUsername] = useState(user.username || "");
  const [avatar, setAvatar] = useState(user.avatar || "");

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/update/${user._id}`,
        {
          username,
          avatar,
        },
        {
          withCredentials: true,
        }
      );

      if (!data.success) {
        alert("อัปเดตข้อมูลล้มเหลว");
        return;
      }

      // ✅ อัปเดต localStorage จากผลลัพธ์ backend
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      alert("บันทึกข้อมูลสำเร็จ!");
      navigate("/member");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด ระหว่างบันทึกข้อมูล");
    }
  };

  return (
    <div
      style={{
        background: "#0f0f14",
        minHeight: "100vh",
        color: "white",
        padding: "50px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* ✅ ✅ UI เดิม ทุกอย่างเหมือนเดิม 100% */}
      <div style={{ width: "420px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 20 }}>แก้ไขโปรไฟล์</h1>

        <div
          style={{
            width: "100%",
            background: "#1a1a23",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 15 }}>
            {avatar ? (
              <img
                src={avatar}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #a855f7",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "#333",
                  margin: "auto",
                }}
              />
            )}
            <br />
            <label
              style={{
                display: "inline-block",
                marginTop: 10,
                background: "#6d28d9",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              เลือกรูปโปรไฟล์
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatar}
              />
            </label>
          </div>

          <label>ชื่อผู้ใช้</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 15,
              borderRadius: 6,
              border: "1px solid #333",
              background: "#0f0f14",
              color: "white",
            }}
          />

          <label>อีเมล (แก้ไม่ได้)</label>
          <input
            value={user.email || ""}
            disabled
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 15,
              borderRadius: 6,
              border: "1px solid #333",
              background: "#1a1a23",
              color: "#777",
            }}
          />

          <button
            onClick={saveProfile}
            style={{
              width: "100%",
              padding: 10,
              background: "#6d28d9",
              color: "white",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            บันทึกข้อมูล
          </button>

          <button
            onClick={() => navigate("/member")}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 10,
              background: "#444",
              color: "white",
              borderRadius: 8,
              border: "none",
            }}
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}