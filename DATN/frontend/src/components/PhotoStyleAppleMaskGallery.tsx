import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const images = [
  '/images/nu1.jpg',
  '/images/nu2.jpg',
  '/images/nu3.jpg',
];

export default function PhotoStyleAppleMaskGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftImgRef = useRef<HTMLImageElement>(null);
  const rightImgRef = useRef<HTMLImageElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const [pair, setPair] = useState<[number, number]>([0, 1]);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const leftImg = leftImgRef.current;
    const rightImg = rightImgRef.current;
    const mask = maskRef.current;
    if (!container || !leftImg || !rightImg || !mask) return;

    const totalSections = images.length - 1; // 2 đoạn chuyển cho 3 ảnh
    const sectionLength = 1 / totalSections;

    const update = (progress: number) => {
      // Xác định đang ở đoạn chuyển nào
      let section = Math.floor(progress / sectionLength);
      if (section >= totalSections) section = totalSections - 1;
      if (section < 0) section = 0;

      // Tính local progress trong đoạn chuyển
      const localProgress = (progress - section * sectionLength) / sectionLength;
      // Cập nhật cặp ảnh
      setPair([section, section + 1]);

      // Di chuyển mask
      const maskX = localProgress * (container.offsetWidth - 8);
      mask.style.transform = `translateX(${maskX}px)`;

      // Cập nhật clip-path cho ảnh trái/phải
      leftImg.style.clipPath = `polygon(0 0, ${maskX}px 0, ${maskX}px 100%, 0 100%)`;
      rightImg.style.clipPath = `polygon(${maskX}px 0, 100vw 0, 100vw 100%, ${maskX}px 100%)`;
      setHide(progress >= 0.999); // Ẩn khi cuộn hết
    };

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      pin: true,
      pinSpacing: true,
      onUpdate: self => update(self.progress),
    });
    update(0);
    return () => {
      st.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        zIndex: 1000,
        background: '#000',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        display: hide ? 'none' : 'block',
      }}
    >
      {/* Ảnh bên trái mask */}
      <img
        ref={leftImgRef}
        src={images[pair[0]]}
        alt=""
        loading="lazy"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          left: 0,
          top: 0,
          zIndex: 1,
          transition: 'clip-path 0.2s',
        }}
      />
      {/* Ảnh bên phải mask */}
      <img
        ref={rightImgRef}
        src={images[pair[1]]}
        alt=""
        loading="lazy"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          left: 0,
          top: 0,
          zIndex: 2,
          transition: 'clip-path 0.2s',
        }}
      />
      {/* Mask (thanh đen) */}
      <div
        ref={maskRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 8,
          height: '100%',
          background: '#111',
          zIndex: 10,
          boxShadow: '0 0 16px 4px #000a',
          borderRadius: 4,
        }}
      />
    </div>
  );
} 