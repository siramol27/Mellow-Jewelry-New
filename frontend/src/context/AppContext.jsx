/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  const hasFetched = useRef(false);

  axios.defaults.withCredentials = true;

  /**   ดึงข้อมูลผู้ใช้ปัจจุบัน */
  const getUserData = useCallback(async () => {
    try {

      //     แก้ URL ให้ถูก
      const { data } = await axios.get(
        `${backendUrl}/api/auth/member`,
        { withCredentials: true }
      );

      if (data.success) {
        setIsLoggedIn(true);
        setUserData(data.user);
        setUser(data.user);

        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            username: data.user.username || data.user.name || "",
            email: data.user.email || "",
            role: data.user.role || "member",
            id: data.user.id || data.user._id || ""
          })
        );

      } else {
        setIsLoggedIn(false);
        setUserData(null);
        setUser(null);
        localStorage.removeItem("currentUser");
      }

    } catch (err) {
      setIsLoggedIn(false);
      setUserData(null);
      setUser(null);
      localStorage.removeItem("currentUser");
    } finally {
      setIsLoading(false);
    }

  }, [backendUrl]);

  /**   ออกจากระบบ */
  const logout = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);

      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        setUser(null);
        localStorage.removeItem("currentUser");

        toast.success(data.message || "ออกจากระบบสำเร็จ");
      } else {
        toast.error(data.message || "ออกจากระบบไม่สำเร็จ");
      }

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาดในการออกจากระบบ"
      );
    }
  };

  /**   โหลดข้อมูลตอนเปิดเว็บ */
  useEffect(() => {
    if (!backendUrl || hasFetched.current) return;

    hasFetched.current = true;
    getUserData();

  }, [backendUrl, getUserData]);

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
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};