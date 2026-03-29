// src/pages/EditProfile.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditProfile() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL; //   backend URL

  //   โหลด user และ map id → _id ถ้าจำเป็น
  const loadUser = () => {
    const u = JSON.parse(localStorage.getItem("currentUser") || "null") || {};
    if (u.id && !u._id) u._id = u.id; //   แก้ปัญหา user._id = undefined
    return u;
  };

  const user = loadUser();
  const [username, setUsername] = useState(user.username || "");
  const [avatar, setAvatar] = useState(user.avatar || "");

  //   อ่านรูปโปรไฟล์ที่อัปโหลด
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  //   บันทึกข้อมูลลง MongoDB
  const saveProfile = async () => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/update/${user._id}`, //   _id ไม่ undefined แน่นอน
        {
          username,
          avatar,
        },
        {
          withCredentials: true, //   ส่ง cookie token
        }
      );

      if (!data.success) {
        alert("อัปเดตข้อมูลล้มเหลว");
        return;
      }

      //   อัปเดต localStorage ให้เป็นข้อมูลใหม่จาก MongoDB
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
          {/* Avatar */}
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

          {/* ชื่อผู้ใช้ */}
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

          {/* อีเมล */}
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

          {/* ปุ่มบันทึก */}
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

          {/* ปุ่มยกเลิก */}
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