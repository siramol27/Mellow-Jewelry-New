// src/lib/api.js
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${backendUrl}/api`, // ให้ตรงกับพอร์ต backend
  withCredentials: true,        // ส่ง/รับ cookie token เสมอ
});