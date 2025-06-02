"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const getImageUrl = (url: string | string[]) => {
  if (Array.isArray(url)) url = url[0];
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
  if (url.startsWith('../images/')) return url.replace('../images', '/images');
  if (url.startsWith('/images/')) return `${backendUrl}${url}`;
  return `${backendUrl}/images/${url}`;
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    TenKH: "",
    gender: "",
    day: "",
    month: "",
    year: "",
    Sdt: "",
    Dia_chi: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [phoneShake, setPhoneShake] = useState(false);
  const [typingText, setTypingText] = useState("");
  const phoneRef = useRef<HTMLDivElement>(null);
  const [activeField, setActiveField] = useState("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setActiveField(name);
    // Hiện chữ đang nhập lên "màn hình điện thoại"
    if (name === "password" || name === "confirmPassword") {
      setTypingText("•".repeat(value.length));
    } else {
      setTypingText(value);
    }
    // Rung nhẹ điện thoại
    setPhoneShake(true);
    setTimeout(() => setPhoneShake(false), 300);
  };

  useEffect(() => {
    if (window && !(window as any).grecaptcha) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TenKH: form.TenKH,
          email: form.email,
          Sdt: form.Sdt,
          Dia_chi: form.Dia_chi,
          password: form.password,
          role: "user"
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ảnh minh họa lấy từ backend (ví dụ: /images/register.png)
  const illustration = getImageUrl("DATN/DATN/backend/public/images/pk1.jpeg");

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex w-full max-w-5xl bg-white rounded shadow-lg overflow-hidden">
        {/* Cột trái: Ảnh */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-50">
          <Image src={illustration} alt="Đăng ký" width={200} height={200} className="object-contain" style={{ maxWidth: '50%', height: 'auto' }} />
        </div>
        {/* Cột phải: Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký</h2>
          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
          {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block mb-1 text-sm">Họ và tên:</label>
              <input name="TenKH" value={form.TenKH} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">Địa chỉ:</label>
              <input name="Dia_chi" value={form.Dia_chi} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">Điện thoại:</label>
              <input name="Sdt" value={form.Sdt} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-3 flex items-center gap-4">
              <label className="text-sm">Giới tính:</label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="gender" value="Nam" checked={form.gender === "Nam"} onChange={handleChange} /> Nam
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="gender" value="Nữ" checked={form.gender === "Nữ"} onChange={handleChange} /> Nữ
              </label>
            </div>
            <div className="mb-3 flex gap-2">
              <div>
                <label className="block mb-1 text-sm">Ngày sinh:</label>
                <select name="day" value={form.day} onChange={handleChange} className="border rounded px-2 py-1">
                  <option value="">Ngày</option>
                  {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">&nbsp;</label>
                <select name="month" value={form.month} onChange={handleChange} className="border rounded px-2 py-1">
                  <option value="">Tháng</option>
                  {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">&nbsp;</label>
                <select name="year" value={form.year} onChange={handleChange} className="border rounded px-2 py-1">
                  <option value="">Năm</option>
                  {Array.from({length: 100}, (_, i) => 2024 - i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">E-mail:</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">Username:</label>
              <input name="username" value={form.username || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">Mật khẩu:</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              <div className="text-xs text-gray-500 mt-1">Lưu ý: Mật khẩu phải có tối thiểu 8 ký tự bao gồm chữ, số và các ký tự đặc biệt</div>
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">Xác nhận mật khẩu:</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-3">
              <div className="g-recaptcha" data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"></div>
            </div>
            <div className="mb-3 text-xs text-gray-500">
              Bằng việc đăng ký tài khoản Tôi đồng ý với các <a href="#" className="text-blue-600 underline">điều khoản bảo mật</a> & sử dụng thông tin cá nhân của PolySmart
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
            <div className="mt-4 text-center text-sm">
              Bạn Đã Có Tài Khoản? <a href="/login" className="text-blue-600 underline">Đăng Nhập Ngay</a>
            </div>
          </form>
        </div>
      </div>
  
    </div>
  );
}
