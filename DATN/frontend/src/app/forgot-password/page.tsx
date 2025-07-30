"use client";
import { useState } from "react";
import Link from "next/link";
import "./mobile-responsive.css";
import "./mobile-enhancements.css";
import "./mobile-viewport.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return "Vui lòng nhập email!";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Real-time validation for email format
    if (value.trim()) {
      const emailValidationError = validateEmail(value);
      setEmailError(emailValidationError);
    } else {
      // Clear error when field is empty
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    // Validate email before submission
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
      setMessage("Mật khẩu mới đã được gửi về email của bạn");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200/60 via-white/60 to-blue-100/80 py-8 px-2">
      <div className="forgot-password-card w-full max-w-md rounded-3xl shadow-2xl p-8 border border-blue-100 backdrop-blur-md bg-white/60 relative">
        <h2 className="forgot-password-title text-2xl md:text-3xl font-extrabold mb-4 text-center text-blue-700">Quên mật khẩu</h2>
        <p className="forgot-password-description text-center text-gray-500 mb-6">Nhập email đã đăng ký để nhận mật khẩu mới.</p>
        <form onSubmit={handleSubmit} className="forgot-password-form space-y-5" noValidate>
          <div>
            <div className={`forgot-password-input-container ${emailError ? 'border-red-300' : 'border-blue-200'}`}>
              <input
                type="email"
                className="forgot-password-input w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base bg-white/80 placeholder-gray-400"
                placeholder="Nhập email đã đăng ký"
                value={email}
                onChange={handleEmailChange}
                disabled={!!message}
              />
            </div>
            {emailError && (
              <p className="text-red-500 text-sm mt-1 ml-4">{emailError}</p>
            )}
          </div>
          <button
            type="submit"
            className="forgot-password-button w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-700 text-white py-2 rounded-full font-semibold shadow-lg transition-all text-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading || !!message}
          >
            {loading ? "Đang gửi..." : "Gửi mật khẩu mới"}
          </button>
        </form>
        {message && (
          <>
            <div className="forgot-password-message mt-6 text-green-600 text-center font-semibold flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
            <Link href="/login" className="forgot-password-link block mt-6 w-full text-center bg-gradient-to-r from-blue-500 via-blue-400 to-blue-700 text-white py-2 rounded-full font-semibold shadow-lg transition-all text-lg hover:opacity-90">Quay lại trang đăng nhập</Link>
          </>
        )}
        {error && <div className="forgot-password-error mt-4 text-red-600 text-center font-semibold">{error}</div>}
      </div>
    </div>
  );
}
