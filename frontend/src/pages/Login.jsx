import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

  // โหมดเริ่มที่ "เข้าสู่ระบบ"
  const [state, setState] = useState('Login');

  // ฟอร์ม
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // แสดง/ซ่อนรหัสผ่าน
  const [showPwd, setShowPwd] = useState(false);

  // สถานะ
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ล็อกกันเดารหัส (UI)
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

  // validate
  const isValidEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
  const isStrongPassword = (v) =>
    /[a-z]/.test(v) && /[A-Z]/.test(v) && v.length >= 8 && v.length <= 128;

  //  Axios instance: ส่งคุกกี้ทุกครั้ง + timeout + ให้ error เด้งมาที่ catch
  const api = useMemo(
    () =>
      axios.create({
        baseURL: backendUrl,           // เช่น http://localhost:4000
        withCredentials: true,         // สำคัญ: ให้ส่ง/รับคุกกี้ token
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
        validateStatus: (status) => status >= 200 && status < 300, // สถานะอื่นๆ ไปที่ catch
      }),
    [backendUrl]
  );

  // ถ้าล็อกอินอยู่แล้ว ไม่ให้เข้าหน้า Login → ไป /shop
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.id || u?.role) {
        navigate('/shop', { replace: true });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (locked) {
      toast.error(`พยายามผิดหลายครั้ง ระบบล็อกชั่วคราว ${remainSec} วินาที`);
      return;
    }
    if (!isValidEmail(email.trim())) {
      setErrorMsg('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
    if (state === 'Sign Up') {
      if (!isStrongPassword(password)) {
        setErrorMsg('รหัสผ่านต้องยาวอย่างน้อย 8 ตัว และมีพิมพ์เล็ก+พิมพ์ใหญ่');
        return;
      }
      if (name.trim().length < 2) {
        setErrorMsg('กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร');
        return;
      }
    } else {
      if (password.length < 1) {
        setErrorMsg('กรุณากรอกรหัสผ่าน');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      if (state === 'Sign Up') {
        const { data } = await api.post('/api/auth/register', {
          name: name.trim(),
          email: email.trim(),
          password,
        });
        // server ควรส่ง { success, message } กลับมา
        toast.success(data?.message || 'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ');
        setIsLoggedIn(false);
        setState('Login');
        setPassword('');
        setShowPwd(false);
        return;
      }

      // --- เข้าสู่ระบบ ---
      const { data } = await api.post('/api/auth/login', {
        email: email.trim(),
        password,
      });

      // ยืนยันว่าล็อกอินสำเร็จจริง (กันกรณี API คืน 200 แต่ success=false)
      if (!data?.success) {
        const msg = data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง ❌';
        toast.error(msg);
        setErrorMsg(msg);

        // Backoff เมื่อล้มเหลว
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 3) {
          const base = 30;
          const backoff = Math.min(600, base * Math.pow(2, next - 3)); // 30,60,120,240,480,600
          setLockUntil(Date.now() + backoff * 1000);
        }
        return;
      }

      //  สำเร็จ → set state และไป /shop ทันที (ไม่ว่า getUserData จะสำเร็จหรือไม่)
      toast.success(data?.message || 'เข้าสู่ระบบสำเร็จ');
      setIsLoggedIn(true);

      try {
        const me = await getUserData?.(); // คาดหวัง { id, name, role, email }
        if (me) localStorage.setItem('user', JSON.stringify(me));
      } catch {
        // เงียบไว้ ไม่ต้องบล็อกการนำทาง
      } finally {
        // ⛳ เปลี่ยนจาก /member → /shop
        navigate('/shop', { replace: true });
      }

      setAttempts(0);
      setLockUntil(0);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (state === 'Sign Up'
          ? 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่ ❌'
          : 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่ ❌');
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      {/* กล่องฟอร์มใหญ่ อ่านง่าย */}
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
            ? 'กรุณากรอกข้อมูลเพื่อสมัครสมาชิก'
            : 'กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ'}
        </p>

        {locked && (
          <div className="mb-4 rounded-md bg-red-900/50 text-red-100 px-4 py-3 text-sm sm:text-base">
            พยายามผิดหลายครั้ง ระบบล็อกชั่วคราว {remainSec} วินาที
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 rounded-md bg-amber-900/40 text-amber-100 px-4 py-3 text-sm sm:text-base">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmitHandler} noValidate>
          {state === 'Sign Up' && (
            <div className="mb-4 px-6 py-3.5 rounded-full bg-[#333A5C]">
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="w-full outline-none bg-transparent placeholder:text-indigo-300/70 text-base sm:text-lg text-indigo-100"
                type="text"
                placeholder="ชื่อผู้ใช้"
                minLength={2}
                maxLength={60}
                required
              />
            </div>
          )}

          <div className="mb-4 px-6 py-3.5 rounded-full bg-[#333A5C]">
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full outline-none bg-transparent placeholder:text-indigo-300/70 text-base sm:text-lg text-indigo-100"
              type="email"
              placeholder="อีเมล"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              required
            />
          </div>

          {/* ช่องรหัสผ่าน + ปุ่มแสดง/ซ่อน */}
          <div className="mb-3 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-[#333A5C] flex items-center gap-2">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full outline-none bg-transparent placeholder:text-indigo-300/70 text-base sm:text-lg text-indigo-100"
              type={showPwd ? 'text' : 'password'}
              placeholder={
                state === 'Sign Up'
                  ? 'รหัสผ่าน (≥ 8 ตัว และมีพิมพ์เล็ก+พิมพ์ใหญ่)'
                  : 'รหัสผ่าน'
              }
              minLength={state === 'Sign Up' ? 8 : 1}
              maxLength={128}
              required
            />

            {/* ปุ่ม toggle แสดง/ซ่อน */}
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs sm:text-sm bg-black/30 text-indigo-100 hover:bg-black/40 transition"
            >
              {showPwd ? 'ซ่อน' : 'แสดง'}
            </button>
          </div>

          {state === 'Sign Up' && (
            <ul className="text-xs sm:text-sm text-indigo-300/80 mb-4 list-disc list-inside space-y-1">
              <li>ยาวอย่างน้อย 8 ตัวอักษร</li>
              <li>ต้องมีตัวพิมพ์เล็กและตัวพิมพ์ใหญ่</li>
            </ul>
          )}

          {state !== 'Sign Up' && (
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="mb-4 text-indigo-400 hover:text-indigo-200 text-sm sm:text-base underline-offset-2 hover:underline"
            >
              ลืมรหัสผ่าน?
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || locked}
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3.5 sm:py-4 rounded-full text-lg sm:text-xl font-semibold shadow-lg transition-all ${
              isSubmitting || locked
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            {isSubmitting
              ? 'กำลังโหลด...'
              : state === 'Sign Up'
              ? 'สมัครสมาชิก'
              : 'เข้าสู่ระบบ'}
          </button>

          <p className="text-center text-sm sm:text-base text-indigo-300 mt-5">
            {state === 'Sign Up' ? 'มีบัญชีแล้ว?' : 'ยังไม่มีบัญชี?'}
            <span
              onClick={() => {
                setState(state === 'Sign Up' ? 'Login' : 'Sign Up');
                setErrorMsg('');
                setShowPwd(false);
              }}
              className="text-indigo-400 cursor-pointer ml-2 hover:text-indigo-200 underline underline-offset-2"
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