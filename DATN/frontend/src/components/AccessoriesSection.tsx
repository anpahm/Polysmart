'use client';

import React, { useState } from 'react';

const modalImagesList = [
  [ // Card 1
    '/images/m1.jpg',
    '/images/m2.jpg',
    '/images/m3.jpg',
    '/images/m4.jpg',
    '/images/m5.jpg',
    '/images/m6.jpg',
  ],
  [ // Card 2
    '/images/n1.jpg',
    '/images/n2.jpg',
    '/images/n3.jpg',
    '/images/n4.jpg',
    '/images/n5.jpg',
  ]
];

const AccessoriesSection: React.FC = () => {
  const [openModal, setOpenModal] = useState<null | 0 | 1>(null); // 0: card 1, 1: card 2
  const [modalClosing, setModalClosing] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const handleOpenModal = (cardIdx: 0 | 1) => {
    setOpenModal(cardIdx);
    setModalIndex(0);
    setModalClosing(false);
  };
  const handleCloseModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setOpenModal(null);
      setModalClosing(false);
    }, 350); // Thời gian trùng với animation
  };

  return (
    <section
      style={{
        width: '100%',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 0 260px 0',
      }}
    >
      <h2
        style={{
          fontSize: 56,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 40,
          color: '#fff',
          letterSpacing: '-1px',
        }}
      >
        Lựa chọn phiên bản khác
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 25,
          justifyContent: 'center',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: 1200,
        }}
      >
        {/* Card 1 column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop:50 }}>
          <div
            style={{
              background: '#000',
              borderRadius: 18,
              width: 383,
              height: 370,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
            }}
          >
            <img
              src="/images/opip.jpg"
              alt="Ốp lưng bảo vệ Carbon Shield"
              loading="lazy"
              style={{ width: 257, height: 342, objectFit: 'contain' }}
            />
            {/* Icon plus */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 34,
                height: 34,
                background: '#888',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 32,
                fontWeight: 400,
                cursor: 'pointer',
              }}
              onClick={() => handleOpenModal(0)}
              title="Xem lớn"
            >
              +
            </div>
          </div>
          {/* Card 1 label */}
          <div
            style={{
              width: 383,
              textAlign: 'center',
              marginTop: 16,
              fontSize: 28,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            iPhone 16 Pro
          </div>
          <div
            style={{
              maxWidth: 330,
              textAlign: 'center',
              marginTop: 16,
              fontSize: 17,
              fontWeight: 600,
              color: '#fff',
            }}
          >
           Từ 28.471.000đ hoặc 1.159.000đ/th. trong 24 tháng.
            {/* Nút đặt trước */}
            <button
             style={{
               marginTop: 15,
               padding: '12px 18px',
               fontSize: 18,
               fontWeight: 700,
               borderRadius: 32,
               border: '1px solid #000',
               background: '#006FDF',
               color: '#fff',
               cursor: 'pointer',
               boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
               transition: 'all 0.2s',
               display: 'block',
               margin: '15px auto 0',
             }}
           >
             Mua ngay
           </button>
           
           {/* Container hình ảnh nhỏ nằm dọc */}
           <div style={{
             display: 'flex',
             flexDirection: 'column',
             gap: 12,
             marginTop: 20,
             alignItems: 'center',
           }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/chip.png"
                 alt="Chip A18 Pro"
                 style={{
                  width: 56,
                  height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
                 Chip A18 Pro<br />với GPU 6 lõi
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/tls.png"
                 alt="Apple Intelligence"
                 style={{
                  width: 56,
                  height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
                 Được thiết kế cho Apple Intelligence²
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/cam.png"
                 alt="Camera Control"
                 style={{
                  width: 56,
                  height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
                 Điều Khiển Camera
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/came.png"
                 alt="Professional Camera"
                 style={{
                  width: 56,
                  height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
               Hệ thống camera chuyên nghiệp <br /> Camera Fusion 48MP tiên tiến nhất của chúng tôi <br /> Camera Telephoto 5x <br /> Camera Ultra Wide 48MP
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/pin.png"
                 alt="Battery"
                 style={{
                   width: 56,
                   height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
               Thời gian xem video lên đến 33 giờ
               </div>
             </div>
           </div>
          </div>
        </div>
        {/* Card 2 column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',marginTop:50 }}>
          <div
            style={{
              background: '#000',
              borderRadius: 18,
              width: 383,
              height: 370,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
            }}
          >
            <img
              src="/images/opip1.jpg"
              alt="Ốp lưng Silicone"
              loading="lazy"
              style={{ width: 257, height: 342, objectFit: 'contain' }}
            />
            {/* Icon plus */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 34,
                height: 34,
                background: '#888',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 32,
                fontWeight: 400,
                cursor: 'pointer',
              }}
              onClick={() => handleOpenModal(1)}
              title="Xem lớn"
            >
              +
            </div>
          </div>
          {/* Card 2 label */}
          <div
            style={{
              width: 383,
              textAlign: 'center',
              marginTop: 16,
              fontSize: 28,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            iPhone 16
          </div>
          <div
            style={{
              maxWidth: 330,
              textAlign: 'center',
              marginTop: 16,
              fontSize: 17,
              fontWeight: 600,
              color: '#fff',
            }}
          >
           Từ 22.580.000đ hoặc 919.000đ/th. trong 24 tháng.
           
           {/* Nút đặt trước */}
           <button
             style={{
               marginTop: 15,
               padding: '12px 18px',
               fontSize: 18,
               fontWeight: 700,
               borderRadius: 32,
               border: '1px solid #000',
               background: '#006FDF',
               color: '#fff',
               cursor: 'pointer',
               boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
               transition: 'all 0.2s',
               display: 'block',
               margin: '15px auto 0',
             }}
           >
             Mua ngay
           </button>
           {/* Container hình ảnh nhỏ nằm dọc */}
           <div style={{
             display: 'flex',
             flexDirection: 'column',
             gap: 12,
             marginTop: 20,
             alignItems: 'center',
           }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/chip1.png"
                 alt="Chip A18 Pro"
                 style={{
                  width: 56,
                  height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
                 Chip A18<br />với GPU 5 lõi
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/tls1.png"
                 alt="Apple Intelligence"
                 style={{
                  width: 56,
                  height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
                 Được thiết kế cho Apple Intelligence²
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/cam1.png"
                 alt="Camera Control"
                 style={{
                  width: 56,
                  height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
                 Điều Khiển Camera
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/came1.png"
                 alt="Professional Camera"
                 style={{
                  width: 56,
                  height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
               Hệ thống camera kép tiên tiến  <br /> Camera Fusion 48MP tiên tiến <br />Telephoto 2x<br /> Camera Ultra Wide 12MP
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
               <img
                 src="/images/pin1.png"
                 alt="Battery"
                 style={{
                   width: 56,
                   height: 56,
                   objectFit: 'cover',
                 }}
               />
               <div style={{ fontSize: 12, color: '#fff', textAlign: 'center', fontWeight: 500 }}>
               Thời gian xem video lên đến 27 giờ
               </div>
             </div>
           </div>
          </div>
        </div>
      </div>
      {/* MODAL PHỤ KIỆN */}
      {openModal !== null && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            transition: 'background 0.3s',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: '#F4F4F4',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              width: '100%',
              maxWidth: 1200,
              minHeight: 680,
              padding: 32,
              boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
              transform: 'translateY(0)',
              animation: `${modalClosing ? 'slideDownModal' : 'slideUpModal'} 0.35s cubic-bezier(.4,0,.2,1)`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: 16,
                right: 24,
                background: 'none',
                border: 'none',
                fontSize: 32,
                color: '#888',
                cursor: 'pointer',
              }}
              aria-label="Đóng"
            >
              ×
            </button>
            {/* Ảnh lớn */}
            <img
              src={modalImagesList[openModal][modalIndex]}
              alt="Ảnh phụ kiện Z Fold"
              loading="lazy"
              style={{
                width: 'full',
                height: 'auto',
                objectFit: 'contain',
                marginTop: 20,
              }}
            />
            {/* Dots (giả lập) */}
            <div style={{ display: 'flex', gap: 8, marginTop: 30 }}>
              {modalImagesList[openModal].map((img, idx) => (
                <span
                  key={img}
                  onClick={e => { e.stopPropagation(); setModalIndex(idx); }}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: modalIndex === idx ? '#222' : '#eee',
                    display: 'inline-block',
                    cursor: 'pointer',
                    border: '0.1px solid #000',
                  }}
                />
              ))}
            </div>
            {/* Nút đóng dưới */}
            <button
              onClick={handleCloseModal}
              style={{
                marginTop: 24,
                padding: '8px 22px',
                borderRadius: 20,
                border: '1px solid #222',
                background: '#fff',
                fontSize: 20,
                fontWeight: 400,
                cursor: 'pointer',
                color: '#000',
              }}
            >
              Đóng
            </button>
          </div>
          {/* CSS animation */}
          <style>
            {`
              @keyframes slideUpModal {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
              @keyframes slideDownModal {
                from { transform: translateY(0); }
                to { transform: translateY(100%); }
              }
            `}
          </style>
        </div>
      )}
    </section>
  );
};

export default AccessoriesSection; 