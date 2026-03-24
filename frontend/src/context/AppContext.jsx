// src/context/AppContext.jsx
import { createContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// สร้าง Context กลางของแอป เพื่อแชร์สถานะผู้ใช้/ล็อกอิน/ฟังก์ชันที่เกี่ยวข้องไปยังทุกหน้า
export const AppContext = createContext()

// ตัวครอบ (Provider) ที่จะหุ้มทั้งแอป แล้วส่งค่า (value) ให้ลูกหลานผ่าน Context
export const AppContextProvider = ({ children }) => {

    // อ่าน URL ของ backend จากตัวแปรแวดล้อมฝั่ง Vite
    // ตัวอย่างใน .env: VITE_BACKEND_URL=http://localhost:4000
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // สถานะว่า "ล็อกอินอยู่หรือไม่"
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    // เก็บข้อมูลผู้ใช้ (เวอร์ชันเดิม)
    const [userData, setUserData] = useState(null)
    // เก็บข้อมูลผู้ใช้ (เวอร์ชันที่ใช้งานจริงในโค้ดนี้) — เลือกใช้ตัวนี้เป็นหลัก
    const [user, setUser] = useState(null) // 🔥 ใช้ตัวนี้
    // สถานะโหลด (ใช้บอกว่ากำลังตรวจสอบ/ดึงข้อมูลอยู่)
    const [isLoading, setIsLoading] = useState(true)

    // ธงกันการยิงคำขอซ้ำซ้อนตอน mount ครั้งแรก
    const hasFetched = useRef(false)

    // ตั้งค่า axios ให้ส่ง cookie แนบไปกับทุกคำขอโดยอัตโนมัติ
    axios.defaults.withCredentials = true

    // ฟังก์ชันดึงข้อมูลผู้ใช้ปัจจุบันจากฝั่งเซิร์ฟเวอร์
    // - จุดประสงค์: ใช้ตรวจว่า token/cookie ยังใช้ได้ไหม และอ่านข้อมูลผู้ใช้ (id/name/role) มาใส่ Context
    // - Endpoint ที่เรียก: GET {backendUrl}/api/auth/member
    const getUserData = async () => {
        try {
            // เรียก API เพื่อตรวจสิทธิ์และรับข้อมูลผู้ใช้
            const { data } = await axios.get(`${backendUrl}/api/auth/member`)

            if (data.success) {
                // ถ้าเซิร์ฟเวอร์ตอบว่าล็อกอินถูกต้อง → เซ็ตสถานะเป็นล็อกอิน และเก็บข้อมูลผู้ใช้
                setIsLoggedIn(true)

                // เก็บทั้ง 2 ตัวแปรเพื่อความเข้ากันได้ย้อนหลัง
                setUserData(data.user)
                setUser(data.user) // 🔥 สำคัญมาก — คอมโพเนนต์อื่น ๆ ใช้ตัวนี้อ่าน role/id
            } else {
                // ถ้าเซิร์ฟเวอร์ตอบว่าไม่ผ่าน → เคลียร์สถานะทั้งหมด
                setIsLoggedIn(false)
                setUserData(null)
                setUser(null)
            }

        } catch (error) {
            // กรณี error (เช่น token หมดอายุ/เชื่อมต่อไม่ได้) → ปรับสถานะเป็นไม่ล็อกอิน
            setIsLoggedIn(false)
            setUserData(null)
            setUser(null)
        } finally {
            // ไม่ว่าจะสำเร็จหรือพลาด ให้ปิดสถานะโหลดเสมอ
            setIsLoading(false)
        }
    }

    // ฟังก์ชันออกจากระบบ
    // - เรียก POST {backendUrl}/api/auth/logout เพื่อให้ฝั่งเซิร์ฟเวอร์ลบ/ทำให้ token หมดอายุ
    // - จากนั้นล้างสถานะฝั่ง client และแจ้งเตือน
    const logout = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/logout`)

            if (data.success) {
                // สำเร็จ → เคลียร์สถานะผู้ใช้ทั้งหมด
                setIsLoggedIn(false)
                setUserData(null)
                setUser(null) // 🔥 เคลียร์ด้วย

                toast.success(data.message || 'ออกจากระบบสำเร็จ')
            } else {
                // ไม่สำเร็จ → แจ้งเตือนข้อความจากฝั่งเซิร์ฟเวอร์
                toast.error(data.message || 'ออกจากระบบไม่สำเร็จ')
            }

        } catch (error) {
            // กรณีเกิดข้อผิดพลาดขณะติดต่อเซิร์ฟเวอร์
            toast.error(
                error.response?.data?.message ||
                error.message || 'ผิดพลาดในการออกจากระบบ'
            )
        }
    }

    // ดึงข้อมูลผู้ใช้ทันทีที่ Provider ถูก mount (ครั้งแรก)
    // - ป้องกันยิงซ้ำด้วย hasFetched.current
    // - จะทำงานก็ต่อเมื่อมี backendUrl (ป้องกันกรณี env ยังไม่พร้อม)
    useEffect(() => {
        if (!backendUrl || hasFetched.current) return

        hasFetched.current = true
        getUserData()

    }, [backendUrl])

    // รวมค่า/ฟังก์ชันที่ต้องการกระจายไปให้ลูกหลานผ่าน Context
    // - เลือกส่งทั้ง userData และ user เพื่อรองรับโค้ดที่อ้างสองชื่อ
    // - isLoading ไว้ให้หน้าอื่น render สถานะโหลด/สเกเลตันได้
    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        user,       
        setUser,    
        getUserData,
        logout,
        isLoading,
    }

    // ครอบ children ด้วย Provider เพื่อให้ทุกคอมโพเนนต์เข้าถึง value ได้ผ่าน useContext(AppContext)
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}