"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  useEffect(() => {
    // Clear the pending order from localStorage
    localStorage.removeItem('pendingOrder');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {status === 'success' ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-600">
                Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Thanh toán thất bại</h1>
              <p className="text-gray-600">
                Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.
              </p>
            </div>
          </>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700"
          >
            Về trang chủ
          </Link>
          {status !== 'success' && (
            <button
              onClick={() => router.back()}
              className="w-full py-3 text-gray-600 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 