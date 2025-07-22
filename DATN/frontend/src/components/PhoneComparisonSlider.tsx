'use client';
import React, { useRef, useState, useEffect, memo } from 'react';

interface PhoneComparisonSliderProps {
  left: {
    name: string;
    image: string;
    thickness: string;
    weight: string;
  };
}

const IMAGE_WIDTH = 760;
const IMAGE_HEIGHT = 400;
const SIDE_TEXT_WIDTH = 245;
const HANDLE_SIZE = 45;

const comparisonProducts = [
  { name: 'Titan Đen', image: '/images/ssip.jpg', thickness: '14.4', weight: '271' },
  { name: 'Titan Trắng', image: '/images/ssip1.jpg', thickness: '14.2', weight: '311' },
  { name: 'Titan Tự Nhiên', image: '/images/ssip2.jpg', thickness: '13.4', weight: '253' },
];

const PhoneComparisonSlider: React.FC<PhoneComparisonSliderProps> = ({ left }) => {
  const [sliderPos, setSliderPos] = useState(50); // % trong vùng ảnh
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [rightIndex, setRightIndex] = useState(1); // mặc định Fold4
  const right = comparisonProducts[rightIndex];

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Tính toán sliderPos dựa trên vùng ảnh, không phải toàn bộ container
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!imageContainerRef.current) return;
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const rect = imageContainerRef.current.getBoundingClientRect();
    let percent = ((clientX - rect.left) / rect.width) * 100;
    percent = Math.max(0, Math.min(100, percent));
    setSliderPos(percent);
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true;
    handleDrag(e);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
  };
  const onDrag = (e: any) => {
    if (!dragging.current) return;
    handleDrag(e);
  };
  const stopDrag = () => {
    dragging.current = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchend', stopDrag);
  };

  return (
    <section style={{ width: '100%', background: '#1D1D1F', padding: '60px 0 40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Tiêu đề + dropdown nằm ngang */}
      <div style={{
        width: '100%',
        maxWidth: 1000,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: '#fff', lineHeight: 1.2, flex: 1, minWidth: 260 }}>
          Xem {left.name} mỏng và nhẹ như <br></br> thế nào
        </h2>
        {/* Dropdown custom */}
        <div
          ref={dropdownRef}
          style={{
            textAlign: 'right',
            width: 340,
            minWidth: 290,
            position: 'relative',
            marginLeft: 'auto'
          }}
        >
          <button
            onClick={() => setDropdownOpen(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              padding: 0,
            }}
          >
            <span style={{ fontSize: 24, color: '#8d8d8d', fontWeight: 400, marginLeft: 100 }}>So sánh với</span>
            <div style={{ fontWeight: 700, fontSize: 28, marginTop: 4, color: '#111', display: 'flex', alignItems: 'center', gap: 8, marginLeft: 100 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 700,
                fontSize: 28,
                color: '#fff',
                borderBottom: '2px solid #111',
                paddingBottom: 2
              }}>
                {right.name}
                {/* Icon SVG mũi tên V đậm */}
                <svg width="28" height="28" viewBox="0 0 28 28" style={{ display: 'inline-block', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="7,11 14,18 21,11" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </button>
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                left: 'auto',
                background: '#000',
                borderRadius: 18,
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                marginTop: 8,
                zIndex: 100,
                padding: '8px 0',
                width: 340, // hoặc minWidth: 290
                maxHeight: 320,
                overflowY: 'auto',
                textAlign: 'right'
              }}
            >
              {comparisonProducts.map((p, idx) => (
                <div
                  key={p.name}
                  onClick={() => { setRightIndex(idx); setDropdownOpen(false); }}
                  style={{
                    padding: '12px 24px',
                    fontSize: 20,
                    color: idx === rightIndex ? '#2563eb' : '#222',
                    fontWeight: idx === rightIndex ? 700 : 400,
                    background: idx === rightIndex ? '#f3f6ff' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    textAlign: 'right'
                  }}
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: IMAGE_WIDTH + SIDE_TEXT_WIDTH * 2,
          maxWidth: '98vw',
          background: '#000',
          borderRadius: 20,
          boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
          marginBottom: 32,
          padding: 0,
        }}
      >
        {/* Text trái */}
        <div style={{
          width: SIDE_TEXT_WIDTH,
          minWidth: SIDE_TEXT_WIDTH,
          maxWidth: SIDE_TEXT_WIDTH,
          height: IMAGE_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          paddingLeft: 32,
          paddingRight: 16,
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 28, marginBottom: 8, marginTop: 32 }}>{left.name}</div>
        </div>
        {/* Vùng ảnh so sánh */}
        <div
          ref={imageContainerRef}
          style={{
            position: 'relative',
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            background: '#000',
            borderRadius: 12,
            overflow: 'hidden',
            userSelect: 'none',
            flexShrink: 0,
            flexGrow: 0,
            cursor: 'ew-resize',
          }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          {/* Ảnh phải (luôn full) */}
          <img
            src={right.image}
            alt={right.name}
            loading="lazy"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 1,
              pointerEvents: 'none', // Không cho ảnh nhận sự kiện chuột
              background: '#000',
            }}
          />
          {/* Ảnh trái (clip-path) */}
          <img
            src={left.image}
            alt={left.name}
            loading="lazy"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 2,
              pointerEvents: 'none', // Không cho ảnh nhận sự kiện chuột
              background: '#000',
              clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
              transition: dragging.current ? 'none' : 'clip-path 0.2s',
            }}
          />
          {/* Đường chia */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${sliderPos}% - 1px)`,
              top: 0,
              width: 2,
              height: '100%',
              background: '#bbb',
              zIndex: 5,
              pointerEvents: 'none',
              transition: dragging.current ? 'none' : 'left 0.2s',
            }}
          />
          {/* Slider handle */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${sliderPos}% - ${HANDLE_SIZE / 2}px)`,
              top: '30%',
              transform: 'translateY(-50%)',
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'ew-resize',
              background: '#fff',
              borderRadius: '50%',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
              border: '2px solid #e5e7eb',
              fontSize: 32,
              color: '#222',
              userSelect: 'none',
              transition: dragging.current ? 'none' : 'left 0.2s',
              pointerEvents: 'auto',
            }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          >
            {/* Icon do user cung cấp */}
            <img src="/images/left-right.png" alt="compare arrows" loading="lazy" style={{ width: 28, height: 28, display: 'block', pointerEvents: 'none' }} />
          </div>
        </div>
        {/* Text phải */}
        <div style={{
          width: SIDE_TEXT_WIDTH,
          minWidth: SIDE_TEXT_WIDTH,
          maxWidth: SIDE_TEXT_WIDTH,
          height: IMAGE_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          paddingRight: 22,
          paddingLeft: 16,
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 28, marginBottom: 8, marginTop: 32 }}>{right.name}</div>
        </div>
      </div>
      {/* Số liệu so sánh */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 360, marginTop: 24, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, color: '#fff', fontWeight: 700 }}>Camera</div>
          <div style={{ fontSize: 60, fontWeight: 700, display: 'inline-block' }}>
            <span
              style={{
                background: 'linear-gradient(90deg, #3de6d1 0%, #3de6d1 40%, #0099ff 60%, #0099ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block',
              }}
            >
              48MP
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, color: '#fff', fontWeight: 700 }}>Trọng lượng</div>
          <div style={{ fontSize: 60, fontWeight: 700, display: 'inline-block' }}>
            <span
              style={{
                background: 'linear-gradient(90deg, #3de6d1 0%, #3de6d1 40%, #0099ff 60%, #0099ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block',
              }}
            >
              227
            </span>
            <span style={{ color: '#0099ff', fontWeight: 700, fontSize: 60, marginLeft: 2 }}>g</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(PhoneComparisonSlider); 