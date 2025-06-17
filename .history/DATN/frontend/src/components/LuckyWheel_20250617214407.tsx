import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface Voucher {
  _id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  condition: object;
  used: boolean;
  user_email: string | null;
  created_at: string;
  expired_at: string;
}

const LuckyWheel: React.FC = () => {
  const { isLoggedIn, user } = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Voucher | null>(null);
  const [error, setError] = useState('');
  const [hasSpun, setHasSpun] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Debugging Redux state
  useEffect(() => {
    console.log('LuckyWheel - isLoggedIn:', isLoggedIn);
    console.log('LuckyWheel - user:', user);
  }, [isLoggedIn, user]);

  // Fetch available vouchers on component mount
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/vouchers');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Filter out used vouchers before setting
          setAvailableVouchers(data.data.filter((v: Voucher) => !v.used));
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

    // Add all available vouchers first, using their codes as labels
    availableVouchers.forEach(voucher => {
      sectors.push({
        label: voucher.code,
        type: 'voucher',
        actualVoucher: voucher
      });
    });

    // Add exactly one 'Thử lại' sector
    sectors.push({ label: 'Chúc bạn may mắn lần sau', type: 'try_again', actualVoucher: null });

    return sectors; // The total number of sectors will be dynamic
  }, [availableVouchers]);

  // Check if user has spun (by email)
  useEffect(() => {
    if (user?.email) {
      const spun = localStorage.getItem(`luckywheel_${user.email}`);
      setHasSpun(!!spun);
    }
  }, [user]);

  // Show modal on first load
  useEffect(() => {
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
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
    const selectedSector = wheelSectors[randomSectorIndex]; // This now includes actualVoucher

    const baseRotation = 360 * 5; // Spin 5 full circles
    const degreesPerSector = 360 / sectorCount;
    // Calculate target rotation to land in the middle of the selected sector
    const targetRotation = baseRotation + (degreesPerSector * randomSectorIndex) + (degreesPerSector / 2);

    setWheelRotation(targetRotation);

    setTimeout(async () => {
      // Use selectedSector.actualVoucher directly
      if (selectedSector.actualVoucher) {
        const wonVoucher = selectedSector.actualVoucher;
        setResult(wonVoucher);
        if (user?.email) {
          localStorage.setItem(`luckywheel_${user.email}`, 'spun');
          // Optionally, mark voucher as used in backend (uncomment if backend integration is ready)
          // await fetch(`http://localhost:3000/api/vouchers/${wonVoucher._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ used: true, user_email: user.email }) });
        }
        setHasSpun(true);
      } else {
        setError('Chúc bạn may mắn lần sau!');
        if (user?.email) {
          localStorage.setItem(`luckywheel_${user.email}`, 'spun');
        }
        setHasSpun(true);
      }
      setSpinning(false);
    }, 4000); // Increased timeout for spin animation
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm md:max-w-md lg:max-w-lg flex flex-col items-center animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-3xl font-bold transition-colors"
          onClick={handleClose}
          aria-label="Đóng"
        >
          ×
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-black-600 drop-shadow-md text-center">Vòng Quay May Mắn</h2>
        <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 flex flex-col items-center justify-center">
          {/* Vòng quay */}
          <div
            ref={wheelRef}
            // Adjusted border color to match image, removed pink. No dots added directly via CSS due to complexity.
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
                      strokeWidth="30"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="white" // Text color
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
          src="/images/character.png" // Assumed path for the character image
          alt="Character"
          className="absolute bottom-[-20px] left-[-70px] w-48 h-auto hidden md:block" // Adjust position and visibility as needed
        />
        {/* Kết quả */}
        {result && (
          <div className="mt-6 text-center bg-green-50 p-4 rounded-lg border border-green-200 animate-fade-in-up">
            <div className="text-xl font-bold text-green-700 mb-2">Chúc mừng bạn nhận được voucher!</div>
            <div className="text-3xl font-extrabold text-blue-700 mb-2">{result.code}</div>
            <div className="text-lg text-gray-700">
              {result.discount_type === 'percent'
                ? `Giảm ${result.discount_value}%`
                : `Giảm ${result.discount_value.toLocaleString()}₫`}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              HSD: {new Date(result.expired_at).toLocaleDateString()}
            </div>
          </div>
        )}
        {error && <div className="mt-4 text-red-600 font-semibold text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
        {!isLoggedIn && (
          <div className="mt-4 text-yellow-700 font-semibold text-center bg-yellow-50 p-3 rounded-lg border border-yellow-200">Bạn cần đăng nhập để sử dụng vòng quay!</div>
        )}
      </div>
    </div>
  );
};

export default LuckyWheel; 