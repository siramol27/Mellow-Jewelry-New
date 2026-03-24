// src/lib/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000/api', // ให้ตรงกับพอร์ต backend ของคุณ
  withCredentials: true,                // ส่ง/รับ cookie token เสมอ
});