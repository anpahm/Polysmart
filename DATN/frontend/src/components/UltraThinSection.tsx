'use client';
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const UltraThinSection: React.FC = () => {
  const b2ImgRef = useRef<HTMLImageElement>(null);
  const b2ContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (b2ImgRef.current && b2ContainerRef.current) {
      gsap.fromTo(
        b2ImgRef.current,
        { y: 0 },
        {
          y: 300, // Giá trị này sẽ cho ảnh trượt xuống vừa đủ lộ chữ
          scrollTrigger: {
            trigger: b2ContainerRef.current,
            start: 'top center',
            end: 'bottom top',
            scrub: true,
          },
          ease: 'none',
        }
      );
    }
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      style={{
        width: '100%',
        minHeight: '120vh',
        // background: 'linear-gradient(180deg, #b3b8e6 0%, #e6e9f5 100%)',
        background:"#000",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        padding: 0,
      }}
    >
      <div
        ref={b2ContainerRef}
        style={{
          position: 'relative',
          width: 1200,
          height: 1800,
          maxWidth: '100%',
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <img
          src="/images/textip.png"
          alt="Mỏng nhẹ chuẩn Ultra"
          style={{
            position: 'absolute',
            top: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 905,
            height: 185,
            zIndex: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
       
        <img
          ref={b2ImgRef}
          src="/images/iphand.jpg"
          alt="Galaxy Z Fold7 Ultra"
          loading="lazy"
          style={{
            position: 'absolute',
            top: 140,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 1036,
            height: 1100,
            zIndex: 2,
            willChange: 'transform',
          }}
        />
      </div>
    
      <p
        style={{
          color: '#86868b',
          fontSize: 21,
          fontWeight:600,
          maxWidth: 650,
          textAlign: 'center',
          padding: 0,
          marginTop: 0,
          marginBottom: 100,
        }}
      >
        iPhone 16 Pro được thiết kế cho Apple Intelligence, hệ thống trí tuệ cá nhân giúp bạn <b style={{color:'#f5f5f7'}}> viết lách, thể hiện bản thân và hoàn thành công việc dễ dàng.</b> Với tính năng bảo vệ quyền riêng tư đột phá, Apple Intelligence giúp bạn yên tâm rằng không một ai khác có thể truy cập dữ liệu của bạn, kể cả Apple.
      </p>
    </section>
  );
};

export default UltraThinSection; 