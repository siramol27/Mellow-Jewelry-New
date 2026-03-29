
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    if (Date.now() < lockUntil) {
      const t = setInterval(() => setNowTick(Date.now()), 1000);
      return () => clearInterval(t);
    }
  }, [lockUntil]);

  const locked = nowTick < lockUntil;
  const remainSec = locked ? Math.ceil((lockUntil - nowTick) / 1000) : 0;

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isStrongPassword = (v) =>
    /[a-z]/.test(v) && /[A-Z]/.test(v) && v.length >= 8 && v.length <= 128;

  const api = useMemo(
    () =>
      axios.create({
        baseURL: backendUrl,
        withCredentials: true,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
        validateStatus: (status) => status >= 200 && status < 300,
      }),
    [backendUrl]
  );

  useEffect(() => {}, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (locked) {
      toast.error(`ล็อกชั่วคราว ${remainSec} วินาที`);
      return;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMsg('อีเมลไม่ถูกต้อง');
      return;
    }

    if (state === 'Sign Up') {
      if (!isStrongPassword(password)) {
        setErrorMsg('รหัสผ่านต้องมี พิมพ์เล็ก + พิมพ์ใหญ่ และยาว ≥ 8');
        return;
      }
      if (name.trim().length < 2) {
        setErrorMsg('กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      if (state === 'Sign Up') {
        const { data } = await api.post('/api/auth/register', {
          name,
          email: email.trim(),
          password,
        });

        toast.success(data?.message || 'สมัครสมาชิกสำเร็จ');
        setState('Login');
        setPassword('');
        setShowPwd(false);
        return;
      }

      /*   LOGIN */
      const { data } = await api.post('/api/auth/login', {
        email: email.trim(),
        password,
      });

      if (!data?.success) {
        const msg = data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        toast.error(msg);
        setErrorMsg(msg);

        const next = attempts + 1;
        setAttempts(next);
        if (next >= 3) {
          const base = 30;
          const backoff = Math.min(600, base * Math.pow(2, next - 3));
          setLockUntil(Date.now() + backoff * 1000);
        }
        return;
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      }

      toast.success('เข้าสู่ระบบสำเร็จ  ');
      setIsLoggedIn(true);


      /*   ดึงข้อมูล user */
      let me = null;
      try {
        me = await getUserData?.();
      } catch (error) {
        console.warn(error);
      }

      console.log("  me =", me); //   FIX ADMIN — debug

      /*   FIX 1 — Fallback ถ้า getUserData ไม่ส่ง role */
      if (!me && data.user) {
        me = data.user;
        console.log("  ใช้ข้อมูลจาก login response:", me);
      }

      if (me) {
        const role = (me.role || 'member').toLowerCase(); //   FIX 2 — normalize role

        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            username: me.username || me.name || '',
            email: me.email || '',
            role: role,
            id: me.id || me._id,
          })
        );

        /*   FIX 3 — บังคับ Admin redirect */
        if (role === 'admin') {
          navigate('/admin/orders', { replace: true });
          return;
        }

        navigate('/shop', { replace: true });
        return;
      }

      navigate('/shop', { replace: true });

      setAttempts(0);
      setLockUntil(0);

    } catch {
      toast.error('เข้าสู่ระบบล้มเหลว');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <div className="bg-slate-900/95 p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-[520px] text-indigo-200">

        <button
          type="button"
          onClick={() => navigate('/')}
          className="cursor-pointer text-slate-300 text-base sm:text-lg mb-8 hover:text-white transition"
        >
          กลับหน้าแรก
        </button>


        <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-center tracking-tight">
          {state === 'Sign Up' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
        </h2>

        <p className="text-center mt-3 mb-6 text-base sm:text-lg text-indigo-300/90">
          {state === 'Sign Up'
            ? 'กรอกข้อมูลเพื่อสมัครสมาชิก'
            : 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ'}
        </p>

        {locked && (
          <div className="mb-4 rounded-md bg-red-900/50 text-red-100 px-4 py-3">
            ระบบล็อกชั่วคราว {remainSec} วินาที
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-md bg-amber-900/40 text-amber-100 px-4 py-3">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmitHandler} noValidate>
          {state === 'Sign Up' && (
            <div className="mb-4 px-6 py-3.5 rounded-full bg-[#333A5C]">
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="w-full outline-none bg-transparent placeholder:text-indigo-300/70 text-lg text-indigo-100"
                type="text"
                placeholder="ชื่อผู้ใช้"
                required
              />
            </div>
          )}

          <div className="mb-4 px-6 py-3.5 rounded-full bg-[#333A5C]">
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full outline-none bg-transparent placeholder:text-indigo-300/70 text-lg text-indigo-100"
              type="email"
              placeholder="อีเมล"
              required
            />
          </div>

          <div className="mb-4 px-6 py-3.5 rounded-full bg-[#333A5C] flex items-center gap-2">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full outline-none bg-transparent placeholder:text-indigo-300/70 text-lg text-indigo-100"
              type={showPwd ? 'text' : 'password'}
              placeholder="รหัสผ่าน"
              required
            />

            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="px-3 py-1.5 bg-black/30 text-indigo-100 rounded-full hover:bg-black/40"
            >
              {showPwd ? 'ซ่อน' : 'แสดง'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || locked}
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-full text-xl font-semibold shadow-lg ${
              isSubmitting || locked
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            {isSubmitting
              ? 'กำลังเข้าสู่ระบบ...'
              : state === 'Sign Up'
              ? 'สมัครสมาชิก'
              : 'เข้าสู่ระบบ'}
          </button>
        {state === "Login" && (
          <p
            onClick={() => navigate("/forgot-password")}
            className="text-center text-indigo-300 mt-3 cursor-pointer hover:text-indigo-200 underline"
          >
            ลืมรหัสผ่าน?
          </p>
        )}
          <p className="text-center text-indigo-300 mt-6">
            {state === 'Sign Up' ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}
            <span
              onClick={() => {
                setState(state === 'Sign Up' ? 'Login' : 'Sign Up');
                setErrorMsg('');
                setShowPwd(false);
              }}
              className="text-indigo-400 ml-2 cursor-pointer hover:text-indigo-200 underline"
            >
              {state === 'Sign Up' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </span>
          </p>
        </form>

      </div>
      
    </div>
  );
};

export default Login;