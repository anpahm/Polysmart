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
  const router = useRouter();
  const dispatch = useDispatch();

  // Kiểm tra nếu đã đăng nhập thì chuyển về trang chủ
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetchApi(API_ENDPOINTS.GET_USER);
        if (response && response.user) {
          dispatch(setUser({
            TenKH: response.user.TenKH,
            email: response.user.email,
            Sdt: response.user.Sdt,
            gioi_tinh: response.user.gioi_tinh,
            sinh_nhat: response.user.sinh_nhat,
            dia_chi: response.user.dia_chi,
            avatar: response.user.avatar,
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
      
      // Lưu token vào localStorage
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      } else if (typeof data === 'string') { // Trường hợp token được trả về trực tiếp dưới dạng chuỗi
        localStorage.setItem('token', data);
      }

      // Giả định API trả về thông tin người dùng cùng với token hoặc có thể gọi GET_USER sau đó
      // Nếu API_ENDPOINTS.LOGIN không trả về tên, bạn cần gọi API_ENDPOINTS.GET_USER sau đó.
      const userResponse = await fetchApi(API_ENDPOINTS.GET_USER);
      console.log("Login: Full userResponse from GET_USER API:", userResponse);
      if (userResponse) {
        console.log("Login: User data from API:", userResponse);
        localStorage.setItem('user', JSON.stringify(userResponse)); // Lưu thông tin user vào localStorage
        dispatch(setUser({
          TenKH: userResponse.TenKH,
          email: userResponse.email,
          Sdt: userResponse.Sdt,
          gioi_tinh: userResponse.gioi_tinh,
          sinh_nhat: userResponse.sinh_nhat,
          dia_chi: userResponse.dia_chi,
          avatar: userResponse.avatar,
        }));
      }

      // Chuyển hướng về trang chủ sau khi đăng nhập thành công
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào tài khoản
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
