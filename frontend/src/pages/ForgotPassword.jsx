import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const ForgotPassword = () => {

  const navigate = useNavigate()

  // --- ฟอร์ม+UI state พื้นฐาน ---
  const [email, setEmail] = useState('')       // อีเมลที่ผู้ใช้กรอก
  const [message, setMessage] = useState('')   // ข้อความแจ้งผลลัพธ์ (สำเร็จ/ผิดพลาด)
  const [error, setError] = useState(false)    // ธงบอกว่า message เป็น error หรือไม่
  const [loading, setLoading] = useState(false)// ธงหมุนโหลดระหว่างยิงคำขอ

  // ส่งฟอร์มขอรีเซ็ตรหัสผ่าน
  const handleSubmit = async (e) => {
    e.preventDefault()

    // เคลียร์ข้อความเดิมก่อนทุกครั้ง
    setMessage('')
    setError(false)

    // ตรวจสอบความครบถ้วน/รูปแบบขั้นต้น (client-side)
    if (!email) {
      setMessage('กรุณากรอกอีเมล')
      setError(true)
      return
    }
    if (!email.includes('@')) {   // เช็คแบบง่าย ๆ
      setMessage('รูปแบบอีเมลไม่ถูกต้อง')
      setError(true)
      return
    }

    setLoading(true)

    try {
      // เรียก API ขอรีเซ็ต (backend จะส่งลิงก์หรือ token กลับมา)
      // หมายเหตุ: ระหว่าง dev ระบุ URL ตรง ๆ; ถ้าใช้ axios instance ให้แก้เป็น api.post('/auth/forgot-password', ...)
      const res = await axios.post(
        'http://localhost:4000/api/auth/forgot-password',
        { email },
        { withCredentials: true } // แนบคุกกี้ไปด้วย (ถ้าระบบ auth อาศัย cookie)
      )

      if (res.data.success) {
        // สำเร็จ: แจ้งผู้ใช้และพาไปหน้าตั้งรหัสด้วย token ที่ได้จาก backend
        setMessage('รีเซ็ตได้แล้ว กำลังพาไปหน้าเปลี่ยนรหัส...')

        // ใช้ token จากฝั่ง server เท่านั้น (อย่าสุ่มเองฝั่ง client)
        const token = res.data.token

        // หน่วงสั้น ๆ ให้ผู้ใช้เห็นข้อความก่อน แล้วค่อยเปลี่ยนหน้า
        setTimeout(() => {
          navigate(`/reset-password/${token}`)
        }, 1500)

      } else {
        // backend ตอบไม่สำเร็จ แต่ยังได้ข้อความกลับมา — แสดงให้ผู้ใช้ทราบ
        setMessage(res.data.message || 'ไม่พบอีเมลนี้ในระบบ')
        setError(true)
      }

    } catch (err) {
      // กรณี error จาก network/เซิร์ฟเวอร์ — แสดงข้อความกลาง ๆ
      setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่')
      setError(true)
    }

    setLoading(false)
  }

  // --- UI แบบเรียบง่าย อ่านง่าย ไม่พึ่ง CSS framework ---
  return (
    <div style={{
      padding: '40px',
      maxWidth: '400px',
      margin: '100px auto',
      border: '1px solid #ddd',
      borderRadius: '10px',
      textAlign: 'center'
    }}>
      <h2 style={{ marginBottom: '15px' }}>ลืมรหัสผ่าน</h2>

      <p style={{ fontSize: '13px', color: '#555'}}>
        กรอกอีเมลของคุณ แล้วเราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
      </p>

      <form onSubmit={handleSubmit}>
        {/* ช่องกรอกอีเมล */}
        <input
          type="email"
          placeholder="กรอกอีเมลของคุณ"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            outline: 'none'
          }}
        />

        {/* ปุ่มส่งคำขอ (ปิดการกดเมื่อกำลังโหลด) */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '15px',
            padding: '10px',
            width: '100%',
            background: 'purple',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          {loading ? 'กำลังส่ง...' : 'ส่งลิงก์'}
        </button>
      </form>

      {/* กล่องข้อความผลลัพธ์ (เขียว/แดง ตามสถานะ) */}
      {message && (
        <p style={{ color: error ? 'red' : 'green', marginTop: '10px' }}>
          {message}
        </p>
      )}

      <p style={{ fontSize: '12px', color: '#777', marginTop: '10px' }}>
        หากไม่ได้รับอีเมลภายใน 5 นาที กรุณาตรวจสอบโฟลเดอร์สแปม
      </p>

      {/* ลิงก์ย้อนกลับหน้าล็อกอิน */}
      <p style={{ marginTop: '15px' }}>
        <Link to="/login" style={{ color: 'purple' }}>
          ← กลับไปเข้าสู่ระบบ
        </Link>
      </p>
    </div>
  )
}

export default ForgotPassword;