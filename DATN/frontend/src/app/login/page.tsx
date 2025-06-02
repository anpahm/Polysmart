"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");
      localStorage.setItem("token", data);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/images/')) return `${backendUrl}${url}`;
    return `${backendUrl}/images/${url}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex w-full max-w-5xl bg-white rounded shadow-lg overflow-hidden">
        {/* Cột trái: Ảnh minh họa */}
        <div className="hidden md:flex w-1/2 justify-center items-start" style={{ minHeight: 400 }}>
          <Image
            src={getImageUrl("/images/login_banner.jpeg")}
            alt="Đăng nhập"
            width={500}
            height={500}
            className="object-contain"
            style={{ width: '100%', height: 'auto' }}
            unoptimized
          />
        </div>
        {/* Cột phải: Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 text-center">Đăng nhập</h2>
          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email:</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Mật khẩu:</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                Nhớ mật khẩu
              </label>
              <a href="#" className="text-blue-600 text-sm hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <div className="mt-4 text-center text-sm">
              Bạn Chưa Có Tài Khoản?{" "}
              <a href="/register" className="text-blue-600 underline">
                Tạo tài khoản ngay
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
