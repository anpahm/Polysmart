'use client';

import { title } from 'process';
import React, { useState, useRef, useEffect, memo } from 'react';

const slides = [
  {
    type: 'video',
    video: '/videos/pm1.mp4',
    title: 'Thật nhanh. Thật mượt. Cảm nhận'

  },
  {
    type: 'video',
    video: '/videos/pm2.mp4',
    title: '4K Dolby Vision tốc độ 120 fps.'
  },
  {
    type: 'image',
    image: '/images/pm3.jpg',
    title: 'Viền mỏng hơn, cho màn hình lớn hơn.'
  },
  {
    type: 'video',
    video: '/videos/pm4.mp4',
    title: 'Chip A18 Pro hoàn toàn mới.'
  },
  {
    type: 'image',
    image: '/images/pm5.jpg',
    title: 'Bước nhảy vọt về thời lượng pin.'
  },
  {
    type: 'video',
    video: '/videos/pm6.mp4',
    title: 'iPhone đầu tiên được thiết kế cho Apple Intelligence.'
  },
];

const VerticalSlider = () => {
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tự động chuyển slide
  useEffect(() => {
    // Xóa timeout cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const slide = slides[current];
    if (slide.type === 'image') {
      timeoutRef.current = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    // Nếu là video, sẽ lắng nghe sự kiện ended ở video element
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [current]);

  // Khi video kết thúc thì chuyển slide
  const handleVideoEnded = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleDotClick = (idx: number) => {
    setCurrent(idx);
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '40px 0 140px 0' }}>
      {/* Wrapper flex cho slider và dots */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Slider */}
        <div style={{
          width: 995,
          height: 600,
          borderRadius: 22,
          overflow: 'hidden',
          position: 'relative',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* Slide wrapper */}
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            transition: 'transform 0.6s cubic-bezier(.77,0,.18,1)',
            transform: `translateY(-${current * 100}%)`,
          }}>
            {slides.map((slide, idx) => {
              // Chỉ render slide active và lân cận (trước/sau)
              if (Math.abs(idx - current) > 1) {
                return (
                  <div key={idx} style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: `${idx * 100}%`,
                    left: 0,
                  }} />
                );
              }
              return (
                <div key={idx} style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: `${idx * 100}%`,
                  left: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  color: '#fff',
                  padding: '40px 60px',
                  background: slide.type === 'image' ? `url(${slide.image}) center/cover no-repeat` : '#000',
                  overflow: 'hidden',
                }}>
                  {slide.type === 'video' && idx === current && (
                    <video
                      ref={videoRef}
                      src={slide.video}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                      autoPlay
                      loop={false}
                      muted
                      playsInline
                      onEnded={handleVideoEnded}
                    />
                  )}
                  {slide.type === 'image' && (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                    />
                  )}
                  {/* Tiêu đề góc trên trái */}
                  <div style={{
                    position: 'absolute',
                    top: 20,
                    left: 32,
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#fff',
                    zIndex: 2,
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}>
                    {slide.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Dots bên ngoài slider */}
        <div style={{
          marginLeft: 24,
          height: 600,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 20,
          zIndex: 10
        }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #ccc',
                background: current === idx ? '#111' : '#fff',
                margin: 0,
                outline: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              aria-label={`Chuyển đến slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(VerticalSlider); 