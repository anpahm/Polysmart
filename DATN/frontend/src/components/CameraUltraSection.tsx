'use client';
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

const CameraUltraSection: React.FC = () => {
  const [showCameraInfo, setShowCameraInfo] = useState(false);
  const cameraInfoRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // GSAP hiệu ứng text và bg
  useEffect(() => {
    const text = document.getElementById('camera-ultra-text');
    const bg = document.getElementById('camera-ultra-bg');
    const section = document.getElementById('camera-ultra-section');
    if (text && bg && section) {
      gsap.set(text, { scale: 1.5, opacity: 1, transformOrigin: "center center" });
      gsap.set(bg, { scale: 0.3, opacity: 0, transformOrigin: "center center" });

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
        .to(text, {
          scale: 2.5,
          opacity: 0,
          ease: 'power1.inOut',
          transformOrigin: "center center",
        }, 0)
        .to(bg, {
          scale: 1,
          opacity: 1,
          ease: 'power1.inOut',
          transformOrigin: "center center",
        }, 0);
    }
  }, []);

  // GSAP hiệu ứng info camera
  useEffect(() => {
    if (showCameraInfo) {
      cameraInfoRefs.forEach((ref, idx) => {
        if (ref.current) {
          gsap.fromTo(
            ref.current,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: idx * 0.2,
              ease: 'power2.out',
            }
          );
        }
      });
    } else {
      cameraInfoRefs.forEach((ref) => {
        if (ref.current) {
          gsap.set(ref.current, { opacity: 0, y: 40 });
        }
      });
    }
  }, [showCameraInfo]);

  return (
    <section
      id="camera-ultra-section"
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Text lớn */}
      <div
        id="camera-ultra-text"
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          color: '#C8BFBB',
          maxWidth: 1200,
          marginTop: 100,
          marginBottom: 300,
        }}
      >
        <h2 style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, }}>
        Nắm toàn quyền
   
        </h2>
        <h2  style={{
              textShadow: '0 0 20px rgba(255,250,246,0.8), 0 0 40px rgba(208,126,67,0.6), 0 0 60px rgba(255,170,93,0.4), 0 0 80px rgba(116,42,0,0.3)',
              filter: 'drop-shadow(0 0 10px rgba(208,126,67,0.5))',fontSize: 72, fontWeight: 700, lineHeight: 1.1, marginBottom: 32
            }}>    Điều Khiển Camera.</h2>
        <div style={{ fontSize: 24, fontWeight: 600, color: '#86868b', maxWidth: 900, margin: '50px 0 0 0', textAlign: 'center' }}>
        Nay bạn có thể chụp ảnh hoặc quay video đẹp hoàn hảo và siêu nhanh. Điều Khiển Camera giúp bạn <b style={{color:'#fff'}}>truy cập nhanh các công cụ camera dễ dàng</b>  hơn. Chỉ cần trượt ngón tay để điều chỉnh các chức năng của camera như độ phơi sáng hay chiều sâu trường ảnh, và chuyển đổi qua lại giữa các ống kính hoặc dùng tính năng thu phóng kỹ thuật số để căn chỉnh khung hình, theo cách bạn thích.        </div>
      </div>
      {/* Video bên dưới text lớn */}
      <div className="flex items-center justify-center w-full" style={{ position: 'relative' }}>
        <video
          src="/videos/cameraip.mp4"
          autoPlay
          muted
          playsInline
          className="w-full object-cover block m-0 p-0"
          onEnded={() => setShowCameraInfo(true)}
          onPlay={() => setShowCameraInfo(false)}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
        {/* Overlay camera info/lines */}
        {showCameraInfo && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              opacity: showCameraInfo ? 1 : 0,
              transition: 'opacity 0.8s',
            }}
          >
            {/* Camera lines and info - căn chỉnh lại vị trí cho từng camera */}
            {/* 10MP Tele (trái) */}
            <div ref={cameraInfoRefs[0]} style={{ position: 'absolute', left: '25.8%', bottom: '62%', color: '#fff', textAlign: 'left', minWidth: 180, opacity: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 28, marginBottom:10 }}>48MP</div>
              <div style={{ fontSize: 18, color: '#bfc3c6', marginTop: 4 }}>Chống rung quang học<br />Thu phóng Quang <br /> học  3x</div>
              <div style={{ width: 2, height: 250, background: '#fff', margin: '18px 0 0 6px', opacity: 0.7 }} />
            </div>
            {/* 200MP (giữa trái) */}
            <div ref={cameraInfoRefs[1]} style={{ position: 'absolute', left: '55%', bottom: '76%', color: '#fff', textAlign: 'left', minWidth: 260, opacity: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 28, marginBottom:10 }}>Photographic Styles</div>
              <div style={{ fontSize: 18, color: '#bfc3c6', marginTop: 4 }}>Chế độ rộng<br />Thu phóng Chất lượng Quang học 2x</div>
              <div style={{ width: 2, height: 255, background: '#fff', margin: '18px 0 0 8px', opacity: 0.7 }} />
            </div>
            <div ref={cameraInfoRefs[2]} style={{ position: 'absolute', left: '58%', bottom: '76%', color: '#fff', textAlign: 'left', opacity: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 28, marginBottom:10 }}>Macro Mode</div>
              <div style={{ fontSize: 18, color: '#ccc' }}>Góc siêu rộng</div>
              <div style={{ width: 2, height: 164, background: '#fff', margin: '16px auto 0 8px', opacity: 0.7 }} />
            </div>
        
          </div>
        )}
      </div>
    </section>
  );
};

export default CameraUltraSection; 