'use client';
 
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './Header';
import VerticalSlider from './VerticalSlider';
import Phone3DViewer from './Phone3DViewer';
import HorizontalCustomSlider from './HorizontalCustomSlider';
import PhoneComparisonSlider from './PhoneComparisonSlider';
import { ScrollContainer, ScrollPage, Animator, batch, Fade, ZoomIn, Sticky } from "react-scroll-motion";
import CameraUltraSection from './CameraUltraSection';
import CameraCompareSection from './CameraCompareSection';
import AccessoriesSection from './AccessoriesSection';
import ColorAnd3DSection from './ColorAnd3DSection';
import UltraThinSection from './UltraThinSection';
import NightDetailVideoSection from './NightDetailVideoSection';
import PinCompareSection from './PinCompareSection';
import StoreEverythingSection from './StoreEverythingSection';
import FastScrollSection from './FastScrollSection';
import Footer from './Footer';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const blackBgRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const whiteTextRef = useRef<HTMLDivElement>(null); // 🆕
  const scrollTriggerRef = useRef<any>(null);
  const b2ImgRef = useRef<HTMLImageElement>(null);
  const b2ContainerRef = useRef<HTMLDivElement>(null);

  // Thêm state cho chọn màu
  const colorOptions = [
    { name: 'Xanh Navy', color: '#2d4a7a' },
    { name: 'Xám', color: '#bfc3c6' },
    { name: 'Đen', color: '#3a3a3c' },
    { name: 'Xanh nhạt', color: '#d6e6e7' },
  ];
  const [selectedColor, setSelectedColor] = useState(0);
  const [openModal, setOpenModal] = useState<null | 0 | 1>(null); // 0: card 1, 1: card 2
  const [modalClosing, setModalClosing] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [showCameraInfo, setShowCameraInfo] = useState(false);
  const [selected, setSelected] = useState('Galaxy S22 Ultra');

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

  useEffect(() => {
    if (
      containerRef.current &&
      textRef.current &&
      blackBgRef.current &&
      videoRef.current &&
      whiteTextRef.current
    ) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          pin: true,
          markers: false,
        },
      });

      scrollTriggerRef.current = tl.scrollTrigger;

      // 1. Nền đen trượt lên
      tl.fromTo(
        blackBgRef.current,
        {
          y: window.innerHeight,
        },
        {
          y: 0,
          ease: 'none',
        },
        0
      );

      // 2. Text xuất hiện
      tl.fromTo(
        textRef.current,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          ease: 'power1.out',
        },
        0.5
      );

      // 3. Text biến mất
      tl.to(
        textRef.current,
        {
          y: -100,
          opacity: 0,
          ease: 'power1.in',
        },
        0.8
      );

      // 4. Video xuất hiện
      tl.fromTo(
        videoRef.current,
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          onStart: () => {
            if (videoRef.current) {
              videoRef.current.play();
            }
          },
        },
        1.0
      );

      // 5. White text xuất hiện khi scroll đến section trắng
      gsap.fromTo(
        whiteTextRef.current,
        {
          opacity: 0,
          y: 100,
        },
        {
          scrollTrigger: {
            trigger: whiteTextRef.current,
            start: 'top 80%',
            end: 'top 30%',
            scrub: true,
            markers: false,
          },
          opacity: 1,
          y: 0,
          ease: 'power2.out',
        }
      );
    }

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
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Thêm useEffect cho hiệu ứng GSAP section Camera Ultra
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

  // Thêm will-change cho các phần tử animate
  useEffect(() => {
    if (imageRef.current) imageRef.current.style.willChange = 'transform, opacity';
    if (blackBgRef.current) blackBgRef.current.style.willChange = 'transform, opacity';
    if (textRef.current) textRef.current.style.willChange = 'transform, opacity';
    if (videoRef.current) videoRef.current.style.willChange = 'transform, opacity';
    if (whiteTextRef.current) whiteTextRef.current.style.willChange = 'transform, opacity';
    if (b2ImgRef.current) b2ImgRef.current.style.willChange = 'transform, opacity';
  }, []);

  const cameraInfoRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

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
    <>
<Header/>
{/* Section ảnh b1.jpg - KHÔNG có logic GSAP */}
<section style={{
      width: '100%',
      height: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}>
        <img
          src="/images/modau.jpg"
          alt="Samsung Galaxy Z Fold7 Background"
          style={{
            width: '100%',
            height: 740,
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>
      
      {/* Content Container - CỐ ĐỊNH, không bị GSAP điều khiển */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column', 
        justifyContent: 'center', 
        color: '#000',
        maxWidth: '1200px',
        padding: '0 80px 0 0',
        width: '100%',
        height: '100%',
      }}>
        {/* Galaxy Z Fold7 Text */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '440px',
          marginLeft:510,
        }}>
          iPhone 16 Pro
        </h1>
        {/* Buttons Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Đặt trước Button */}
          <button style={{
            padding: '10px 10px',
            fontSize: '17px',
            fontWeight: 600,
            color: '#fff',
            background: '#0071E3',
            border: '1px solid #0071E3',
            borderRadius: '34px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width:65,
            height:40,
            marginTop:30,
            marginLeft:70,
          }}>
           Mua
          </button>
          
          {/* Xem đánh giá Link */}
          <p style={{
            fontSize: '17px',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft:80,
            marginTop:20,
          }}>
            Từ 28.471.000đ hoặc 1.159.000đ/th. trong 24 tháng.
          </p>
        </div>
      </div>
</section>
{/* Section mới với khoảng trống màu đen và logic GSAP */}
<section style={{ marginTop: 0 }}>
      <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
        {/* Khoảng trống màu đen */}
        <div
          ref={blackBgRef}
          className="absolute inset-0 w-full h-full bg-black"
          style={{ transform: 'translateY(100vh)' }}
        />

        {/* Video */}
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <video
            ref={videoRef}
            style={{ opacity: 0 }}
            muted
            onEnded={() => console.log("Video đã kết thúc")}
            playsInline
            className="w-full h-screen object-cover block m-0 p-0"
          >
            <source src="/videos/second.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Text "Trải nghiệm Ultra. Gập Mở" */}
        <div
          ref={textRef}
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-50"
          style={{ opacity: 0 }}
        >
          <h1 
            className="text-[75px] font-[700] leading-[90px] mb-4"
            style={{
              color:"#C8C1BD"
            }}
          >
            Mạnh. Đẹp.
          </h1>
          <h2 
            className="text-[75px] font-[700] leading-[90px]"
            style={{
              textShadow: '0 0 20px rgba(255,250,246,0.8), 0 0 40px rgba(208,126,67,0.6), 0 0 60px rgba(255,170,93,0.4), 0 0 80px rgba(116,42,0,0.3)',
              filter: 'drop-shadow(0 0 10px rgba(208,126,67,0.5))',
            }}
          >
            Bằng Titan.
          </h2>
        </div>

        {/* Nút scroll to top */}
        <button
          className="absolute bottom-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-30"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
</section>
{/* 🌟 SECTION MỚI SAU VIDEO 🌟 */}
<section  style={{
    backgroundColor: '#000',
    color: '#fff',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop:-2,
    transition: 'all 0.5s ease-in-out',
  }}
      className="bg-white text-black flex flex-col items-center justify-start px-4 py-12">
        <div
          ref={whiteTextRef}
          className="text-center max-w-3xl opacity-0"
          style={{ marginBottom: '200px' }}
        >
          <h2 className="text-[24px] leading-[36px] font-[700] md:text-5xl">
          iPhone 16 Pro có thiết kế titan Cấp 5 với kết cấu vi điểm tinh tế mới.
          </h2>
          <p className="mt-4 text-[24px] leading-[36px] md:text-xl text-center max-w-[800px] mx-auto">
          Titan là một trong những kim loại có tỷ số độ bền và trọng lượng cao nhất, giúp phiên bản này cực kỳ cứng cáp và nhẹ ấn tượng. iPhone 16 Pro có bốn màu tuyệt đẹp, bao gồm màu Titan Sa Mạc mới.
          </p>
        </div>
        {/* Slider Samsung nằm dưới đoạn text */}
        <div style={{
          width: 995,
          fontSize: 32,
          fontWeight: 700,
          color: '#000',
          lineHeight: 1.2,
          letterSpacing: '-1px',
          textAlign: 'left',
        }}>
          Các điểm nổi bật.
        </div>
        <VerticalSlider />
</section>
{/* SECTION NỀN GRADIENT + HÌNH B2 */}
<UltraThinSection />
{/* SECTION 3D VIEWER - THIẾT KẾ TINH GỌN */}
<ColorAnd3DSection />
{/* SECTION PHỤ KIỆN Z FOLD */}
<AccessoriesSection />    
{/* SECTION SLIDER NGANG CÔNG NGHỆ CHẾ TÁC */}
<HorizontalCustomSlider />
{/* SECTION SO SÁNH KÉO QUA KÉO LẠI */}
<PhoneComparisonSlider left={{name: 'Titan Sa Mạc',image: '/images/ssip3.jpg',thickness: '1',weight: '199 gram',}}/>
{/* SECTION CAMERA ULTRA 200MP */}
<CameraUltraSection />
{/* SECTION SO SÁNH CAMERA */}
{/* <CameraCompareSection selected={selected} setSelected={setSelected} /> */}
<NightDetailVideoSection />
{/* <PinCompareSection selected={selected} setSelected={setSelected} /> */}
<StoreEverythingSection/>
<FastScrollSection/>
    </>
  );
};

export default HeroSection;

