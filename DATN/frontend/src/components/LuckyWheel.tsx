import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { generateUniqueVoucherCode } from '../utils/generateVoucherCode';

interface Voucher {
  _id: string;
  ma: string;
  ma_voucher?: string;
  giam_gia: number;
  user_emails: string[];
  used: boolean;
  created_at: string;
  expired_at: string;
}

const LuckyWheel: React.FC = () => {
  const { isLoggedIn, user } = useSelector((state: RootState) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Voucher | null>(null);
  const [error, setError] = useState('');
  const [hasSpun, setHasSpun] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [modalScale, setModalScale] = useState(0);

  // Fetch available vouchers on component mount
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/vouchers');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAvailableVouchers(data.data);
        }
      } catch (err) {
        console.error('Error fetching vouchers:', err);
      }
    };
    fetchVouchers();
  }, []);

  // Construct wheel sectors dynamically: all available vouchers + one 'Thử lại' slot
  const wheelSectors = React.useMemo(() => {
    const sectors: { label: string; type: 'voucher' | 'try_again'; actualVoucher: Voucher | null }[] = [];

    availableVouchers.forEach(voucher => {
      sectors.push({
        label: voucher.ma,
        type: 'voucher',
        actualVoucher: voucher
      });
    });

    sectors.push({ label: 'Chúc bạn may mắn lần sau', type: 'try_again', actualVoucher: null });

    return sectors;
  }, [availableVouchers]);

  // Check if user has spun (by email)
  useEffect(() => {
    if (user?.email) {
      const spun = localStorage.getItem(`luckywheel_spun_user_${user.email}`);
      setHasSpun(!!spun);
      // Lấy lại kết quả đã quay nếu có
      const savedResult = localStorage.getItem(`luckywheel_result_user_${user.email}`);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      } else {
        setResult(null);
      }
    } else {
      setHasSpun(false);
      setResult(null);
    }
  }, [user]);

  // Khi showModal thay đổi, trigger hiệu ứng scale
  useEffect(() => {
    if (showModal) {
      setTimeout(() => setModalScale(1), 10); // delay nhỏ để trigger transition
    } else {
      setModalScale(0);
    }
  }, [showModal]);

  const handleModalClose = () => {
    setModalScale(0);
    setTimeout(() => {
      setShowModal(false);
      setError('');
      setResult(null);
    }, 250); // duration khớp với transition
  };

  const handleSpin = async () => {
    if (!isLoggedIn) {
      setError('Bạn cần đăng nhập để sử dụng vòng quay!');
      return;
    }
    if (hasSpun) {
      setError('Bạn đã quay vòng này rồi!');
      return;
    }

    setSpinning(true);
    setResult(null);
    setError('');

    const sectorCount = wheelSectors.length;
    if (sectorCount === 0) {
      setError('Không có phần thưởng nào để quay!');
      setSpinning(false);
      return;
    }

    const randomSectorIndex = Math.floor(Math.random() * sectorCount);
    const selectedSector = wheelSectors[randomSectorIndex];

    const baseRotation = 360 * 5;
    const degreesPerSector = 360 / sectorCount;
    const targetRotation = baseRotation - (degreesPerSector * randomSectorIndex) - 45 + (degreesPerSector / 2);

    setWheelRotation(targetRotation);

    setTimeout(async () => {
      if (selectedSector.actualVoucher) {
        const wonVoucher = selectedSector.actualVoucher;
        // Tạo mã voucher riêng cho user này
        const uniqueVoucherCode = generateUniqueVoucherCode(wonVoucher.ma);
        
        // Cập nhật kết quả hiển thị với mã riêng
        setResult({
          ...wonVoucher,
          ma_voucher: uniqueVoucherCode
        });

        if (user?.email) {
          localStorage.setItem(`luckywheel_spun_user_${user.email}`, 'true');
          localStorage.setItem(`luckywheel_result_user_${user.email}`, JSON.stringify({
            ...wonVoucher,
            ma_voucher: uniqueVoucherCode
          }));
        }
        setHasSpun(true);

        try {
          if (user?.email) {
            await fetch('http://localhost:3000/api/vouchers/user-voucher', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_email: user.email,
                voucher_id: wonVoucher._id,
                ma_voucher: uniqueVoucherCode,
                expired_at: wonVoucher.expired_at
              })
            });
          }
        } catch (err) {
          console.error('Error creating user voucher:', err);
        }
      } else {
        setError('Chúc bạn may mắn lần sau!');
        if (user?.email) {
          localStorage.setItem(`luckywheel_spun_user_${user.email}`, 'true');
        }
        setHasSpun(true);
      }
      setSpinning(false);
    }, 4000);
  };

  // Nút mini ở góc phải dưới
  const renderMiniButton = () => (
    <button
      className={`fixed z-[60] bottom-6 right-6 w-16 h-16 rounded-full shadow-lg flex flex-col items-center justify-center transition-all duration-300
        bg-gradient-to-br from-yellow-400 to-amber-500 border-4 border-white hover:scale-110 active:scale-95
        ${hasSpun ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
      onClick={() => {
        if (!isLoggedIn) {
          alert('Bạn cần đăng nhập để sử dụng vòng quay!');
          return;
        }
        setShowModal(true);
      }}
      aria-label="Vòng quay may mắn"
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white mb-1">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M4.93 19.07l1.41-1.41" />
        <path d="M17.66 6.34l1.41-1.41" />
      </svg>
    
    </button>
  );

  // Box chat Lucky Wheel nổi góc phải dưới
  const renderChatBox = () => (
    <div
      className={`fixed z-[70] bottom-24 right-8 w-[350px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center transition-all duration-300
        ${modalScale === 1 ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'}
      `}
      style={{ transformOrigin: '80% 100%' }}
    >
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold transition-colors"
        onClick={handleModalClose}
        aria-label="Đóng"
      >
        ×
      </button>
      <h2 className="text-2xl font-extrabold mb-4 text-black-600 drop-shadow-md text-center mt-4">Vòng Quay May Mắn</h2>
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        {/* Mũi tên chỉ ở vòng tròn nhỏ */}
        <div
          className="absolute left-1/2 z-20"
          style={{
            top: 'calc(50% - 56px)', // 50% là tâm, 56px là bán kính nút nhỏ (w-16 = 64px, bán kính ~32px, trừ thêm 24px để mũi tên nằm sát mép)
            transform: 'translateX(-50%)'
          }}
        >
          <svg width="28" height="28" viewBox="0 0 32 32">
            <polygon points="16,0 28,20 4,20" fill="#f59e42" stroke="#fff" strokeWidth="2"/>
          </svg>
        </div>
        {/* Vòng quay */}
        <div
          ref={wheelRef}
          className={`w-full h-full flex items-center justify-center transition-transform duration-[4s] ease-out ${spinning ? '' : ''}`}
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        >
          <svg width="100%" height="100%" viewBox="0 0 256 256" className="absolute top-0 left-0">
            {wheelSectors.map((sector, i) => {
              const angle = (360 / wheelSectors.length) * i;
              const r = 120;
              const cx = 128, cy = 128;
              const x1 = cx + r * Math.cos((angle - 90) * Math.PI / 180);
              const y1 = cy + r * Math.sin((angle - 90) * Math.PI / 180);
              const x2 = cx + r * Math.cos((angle + 360 / wheelSectors.length - 90) * Math.PI / 180);
              const y2 = cy + r * Math.sin((angle + 360 / wheelSectors.length - 90) * Math.PI / 180);
              const dynamicFillColors = [
                '#f97316', '#a855f7', '#1f2937', '#3b82f6', '#22c55e', '#facc15', '#ef4444', '#f3f4f6'
              ];
              const fillColor = dynamicFillColors[i % dynamicFillColors.length];
              const textAngle = angle + (360 / wheelSectors.length) / 2;
              const textRadius = r * 0.7;
              const textX = cx + textRadius * Math.cos((textAngle - 90) * Math.PI / 180);
              const textY = cy + textRadius * Math.sin((textAngle - 90) * Math.PI / 180);
              const textTransform = `rotate(${textAngle} ${textX},${textY})`;
              return (
                <React.Fragment key={i}>
                  <path
                    d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                    fill={fillColor}
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    transform={textTransform}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {sector.label?.length > 8
                      ? sector.label.substring(0, 8) + '...'
                      : sector.label || ''}
                  </text>
                </React.Fragment>
              );
            })}
          </svg>
        </div>
        {/* Nút trung tâm - ĐÃ QUAY/QUAY (đưa ra ngoài wheelRef) */}
        <button
          className="absolute left-1/2 top-1/2 w-16 h-16 rounded-full bg-amber-500 z-30 flex items-center justify-center font-bold text-lg shadow-lg transition disabled:opacity-100 disabled:cursor-not-allowed"
          style={{ transform: 'translate(-50%, -50%)' }}
          onClick={handleSpin}
          disabled={spinning || hasSpun || !isLoggedIn || wheelSectors.length === 0}
        >
          <span className="text-white text-md font-bold text-center leading-tight">
            {spinning ? 'Đang quay...' : hasSpun ? 'Đã quay' : 'Quay'}
          </span>
        </button>
      </div>
      {/* Kết quả */}
      {result && (
        <div className="mt-4 text-center bg-green-50 p-3 rounded-lg border border-green-200 animate-fade-in-up w-[90%]">
          <div className="text-base font-bold text-green-700 mb-1">Chúc mừng bạn nhận được voucher!</div>
          <div className="text-2xl font-extrabold text-blue-700 mb-1">{result.ma_voucher || result.ma}</div>
          <div className="text-base text-gray-700">
            {`Giảm ${result.giam_gia.toLocaleString()}₫`}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            HSD: {new Date(result.expired_at).toLocaleDateString()}
          </div>
        </div>
      )}
      {error && <div className="mt-2 text-red-600 font-semibold text-center bg-red-50 p-2 rounded-lg border border-red-200 w-[90%]">{error}</div>}
      {!isLoggedIn && (
        <div className="mt-2 text-yellow-700 font-semibold text-center bg-yellow-50 p-2 rounded-lg border border-yellow-200 w-[90%]">Bạn cần đăng nhập để sử dụng vòng quay!</div>
      )}
      <div className="h-4" />
    </div>
  );

  return (
    <>
      {renderMiniButton()}
      {showModal && renderChatBox()}
    </>
  );
};

export default LuckyWheel; 