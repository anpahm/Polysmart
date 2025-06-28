import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { generateUniqueVoucherCode } from '../utils/generateVoucherCode';

interface Voucher {
  _id: string;
  ma_voucher: string;
  giam_gia: number;
  user_emails: string[];
  da_su_dung: boolean;
  ngay_tao: string;
  het_han: string;
}

interface LuckyWheelProps {
  open: boolean;
  onClose: () => void;
}

const LuckyWheel: React.FC<LuckyWheelProps> = ({ open, onClose }) => {
  const { isLoggedIn, user } = useSelector((state: RootState) => state.user);
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
        label: voucher.ma_voucher,
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

  // Khi component's open prop thay đổi, trigger hiệu ứng scale
  useEffect(() => {
    if (open) {
      setTimeout(() => setModalScale(1), 10); // delay nhỏ để trigger transition
    } else {
      setModalScale(0);
    }
  }, [open]);

  const handleModalClose = () => {
    setModalScale(0);
    setTimeout(() => {
      onClose();
      setError('');
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
        const uniqueVoucherCode = generateUniqueVoucherCode(wonVoucher.ma_voucher);
        
        // Cập nhật kết quả hiển thị với mã riêng
        setResult({
          ...wonVoucher,
          ma_voucher: uniqueVoucherCode
        });

        if (user?.email) {
          localStorage.setItem(`luckywheel_spun_user_${user.email}`, 'true');
          // Tùy chọn: đánh dấu voucher đã sử dụng ở backend (bỏ ghi chú nếu backend sẵn sàng)
          // await fetch(`http://localhost:3000/api/vouchers/${wonVoucher._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ used: true, user_email: user.email }) });
        }
        setHasSpun(true);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm md:max-w-md lg:max-w-lg flex flex-col items-center animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-3xl font-bold transition-colors"
          onClick={handleModalClose}
          aria-label="Đóng"
        >
          ×
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-black-600 drop-shadow-md text-center">Vòng Quay May Mắn</h2>
        <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 flex flex-col items-center justify-center">
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
                
                // Dynamic colors for sectors (adjusted to match new image)
                const dynamicFillColors = [
                  '#f97316', // Orange (for 10%)
                  '#a855f7', // Purple (for 50.000đ)
                  '#1f2937', // Dark Grey (for Quần đen)
                  '#3b82f6', // Blue (for 100.000đ)
                  '#22c55e', // Green (for 20%)
                  '#facc15', // Yellow (for Buồn)
                  '#ef4444', // Red (for Thử lại)
                  '#f3f4f6'  // White (for Áo trắng)
                ];
                const fillColor = dynamicFillColors[i % dynamicFillColors.length];

                // Calculate text position and rotation
                const textAngle = angle + (360 / wheelSectors.length) / 2;
                const textRadius = r * 0.7; // Position text closer to center
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
                      {sector.label.length > 8 ? sector.label.substring(0, 8) + '...' : sector.label}
                    </text>
                  </React.Fragment>
                );
              })}
            </svg>
            {/* Kim chỉ - Pointer styled to golden color */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[24px] border-b-amber-500 z-20 shadow-lg"></div>
            {/* Trung tâm vòng quay - Bây giờ là nút Quay */}
            <button
              className="absolute w-20 h-20 rounded-full bg-amber-500 z-10 flex items-center justify-center
                         font-bold text-lg shadow-lg transition disabled:opacity-100 disabled:cursor-not-allowed"
              onClick={handleSpin}
              disabled={spinning || hasSpun || !isLoggedIn || wheelSectors.length === 0}
            >
              <span className="text-white text-md font-bold text-center leading-tight">
                {spinning ? 'Đang quay...' : hasSpun ? 'Đã quay' : 'Quay'}
              </span>
            </button>
          </div>
        </div>
        {/* Standing character */}
        <img
          src="/images/character.png"
          alt="Character"
          className="absolute bottom-[-20px] left-[-70px] w-48 h-auto hidden md:block"
        />
        {/* Kết quả */}
        <div className="mt-8 text-center">
          {error && <p className="text-red-500 font-semibold">{error}</p>}
          {result && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative animate-bounce">
              <strong className="font-bold">Chúc mừng!</strong>
              <p>Bạn đã trúng voucher: <span className="font-mono bg-green-200 px-2 py-1 rounded">{result.ma_voucher || result.ma_voucher}</span></p>
              <p>Giảm giá: {result.giam_gia.toLocaleString('vi-VN')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuckyWheel; 