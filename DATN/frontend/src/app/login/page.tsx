"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi, API_ENDPOINTS } from "@/config/api";
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetchApi(API_ENDPOINTS.GET_USER);
        if (response && response.user) {
          dispatch(setUser({
            _id: response.user._id,
            TenKH: response.user.TenKH,
            email: response.user.email,
            Sdt: response.user.Sdt,
            gioi_tinh: response.user.gioi_tinh,
            sinh_nhat: response.user.sinh_nhat,
            dia_chi: response.user.dia_chi,
            avatar: response.user.avatar,
            role: response.user.role,
          }));
          router.push('/');
        }
      } catch (error: any) {
        // Bỏ qua lỗi khi chưa đăng nhập
        console.log('Chưa đăng nhập');
      }
    };
    checkSession();
  }, [router, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchApi(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      } else if (typeof data === 'string') {
        localStorage.setItem('token', data);
      }
      const userResponse = await fetchApi(API_ENDPOINTS.GET_USER);
      if (userResponse) {
        localStorage.setItem('user', JSON.stringify(userResponse));
        dispatch(setUser({
          _id: userResponse._id,
          TenKH: userResponse.TenKH,
          email: userResponse.email,
          Sdt: userResponse.Sdt,
          gioi_tinh: userResponse.gioi_tinh,
          sinh_nhat: userResponse.sinh_nhat,
          dia_chi: userResponse.dia_chi,
          avatar: userResponse.avatar,
          role: userResponse.role,
        }));
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200/60 via-white/60 to-blue-100/80 py-8 px-2">
      <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border border-blue-100 backdrop-blur-md bg-white/60 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'linear-gradient(135deg,rgba(59,130,246,0.08) 0%,rgba(59,130,246,0.18) 100%)'}}></div>
        <h2 className="text-3xl font-extrabold mb-2 text-center text-blue-700 tracking-tight relative z-10">Đăng nhập</h2>
        <p className="text-center text-gray-500 mb-6 relative z-10">Chào mừng bạn quay lại PolySmart!</p>
        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200 text-center text-red-700 font-medium text-sm mb-2">{error}</div>
          )}
          {/* Email */}
          <div className="flex items-center border border-blue-200 rounded-full bg-white/80 px-4 py-2 focus-within:ring-2 focus-within:ring-blue-400 transition shadow-sm">
            <span className="text-blue-400 mr-2 flex items-center transition-colors duration-200">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>
            </span>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 text-base"
              placeholder="Email"
            />
          </div>
          {/* Password */}
          <div className="flex items-center border border-blue-200 rounded-full bg-white/80 px-4 py-2 focus-within:ring-2 focus-within:ring-blue-400 transition shadow-sm relative">
            <span className="text-blue-400 mr-2 flex items-center transition-colors duration-200">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={handleChange}
              className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 text-base pr-8"
              placeholder="Mật khẩu"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 focus:outline-none"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                // Eye-off icon
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.05 0-9.27-3.11-11-8 1.02-2.53 2.77-4.66 5-6.06M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97"/></svg>
              ) : (
                // Eye icon
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center text-sm text-gray-700">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              Ghi nhớ đăng nhập
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
              Quên mật khẩu?
            </Link>
          </div>
          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-700 text-white py-2 rounded-full font-semibold shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all text-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
