import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NightDetailVideoSection: React.FC = () => {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const phoneVideoRef = useRef<HTMLVideoElement>(null);
  const ultraTextRef = useRef<HTMLDivElement>(null);

  // Hàm đồng bộ play/pause/seek
  const syncVideos = () => {
    const main = mainVideoRef.current;
    const phone = phoneVideoRef.current;
    if (main && phone) {
      // Nếu thời gian chênh lệch > 0.1s thì tua lại cho khớp
      if (Math.abs(main.currentTime - phone.currentTime) > 0.1) {
        phone.currentTime = main.currentTime;
      }
      // Nếu trạng thái play/pause khác nhau thì đồng bộ
      if (main.paused !== phone.paused) {
        if (main.paused) phone.pause();
        else phone.play();
      }
    }
  };

  // GSAP hiệu ứng text lớn xuất hiện từ dưới lên
  useEffect(() => {
    if (typeof window === 'undefined' || !ultraTextRef.current) return;
    gsap.fromTo(
      ultraTextRef.current,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ultraTextRef.current,
          start: 'top 95%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  return (
    <section style={{
      width: '100%',
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '100px 0 60px 0',
      position: 'relative',
      minHeight: '100vh',
      // overflow: 'hidden', // Bỏ dòng này
    }}>
      {/* Text lớn */}
      <h2 style={{
        fontSize: 48,
        fontWeight: 700,
        textAlign: 'left',
        marginBottom: 65,
        marginLeft: 160,
        paddingTop: 150,
        letterSpacing: '-1px',
        lineHeight: 1.2,
      }}>
        Bật nét từng chi tiết ẩn trong bóng tối
      </h2>
      {/* Video toàn màn hình */}
      <div style={{
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#000',
      }}>
        <video
          ref={mainVideoRef}
          src="/videos/camdark.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: 'auto', objectFit: 'cover', background: '#000' }}
          onPlay={syncVideos}
          onPause={syncVideos}
          onSeeked={syncVideos}
          onTimeUpdate={syncVideos}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>
      {/* Video điện thoại nhỏ căn giữa bên dưới video lớn */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          marginTop: 32,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 775,
            height: 360,
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Video nhỏ nằm đè lên, căn giữa, bo góc */}
          <video
            ref={phoneVideoRef}
            src="/videos/camdark.mp4"
            muted
            playsInline
            style={{
              position: 'absolute',
              bottom: 105,
              left: 7.5,
              zIndex: 1,
              width: 760,
              height: 336,
              borderRadius: 60,
              objectFit: 'cover',
              background: '#000',
              display: 'block',
            }}
          />
          {/* Ảnh khung điện thoại đè lên video */}
          <img
            src="/images/framedark.png"
            alt="Phone Frame"
            style={{
              position: 'absolute',
              bottom: 90,
              left: 0,
              width: 775,
              height: 360,
              zIndex: 2,
              pointerEvents: 'none',
              userSelect: 'none',
              display: 'block',
            }}
          />
        </div>
      </div>
      {/* Text mô tả bên dưới điện thoại */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: 24,
        }}
      >
        <div
          style={{
            maxWidth: 850,
            background: 'rgba(0,0,0,0.7)',
            color: '#86868b',
            fontSize: 21,
            lineHeight: 1.6,
            borderRadius: 12,
            padding: '0px 32px',
            textAlign: 'center',
            fontWeight: 600,
            boxShadow: '0 2px 16px 0 rgba(0,0,0,0.15)',
          }}
        >
iPhone 16 Pro đưa tính năng quay video lên đẳng cấp hoàn toàn mới với 4K Dolby Vision tốc độ 120 fps — độ phân giải và tốc độ khung hình cao nhất hiện nay của Apple. Với sự hỗ trợ của camera Fusion 48MP mới cùng cảm biến quad-pixel thế hệ thứ hai và chip A18 Pro mạnh mẽ, iPhone 16 Pro cho phép bạn quay phim 4K Dolby Vision tốc độ 120 fps ở chế độ video hoặc slo-mo        </div>
      </div>
      {/* Section ảnh trái, text phải */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 280,
          gap: 165,
          flexWrap: 'wrap',
        }}
      >
        {/* Ảnh bên trái */}
        <img
          src="/images/tdkh.jpg"
          alt="Chỉnh sửa Pro"
          style={{
            width: 588,
            maxWidth: 650,
            borderRadius: 20,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            background: '#111',
            objectFit: 'cover',
          }}
        />
        {/* Text bên phải */}
        <div
          style={{
            maxWidth: 450,
            color: '#fff',
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 18 }}>
          Trong khung hình
          </div>
          <div style={{ fontSize: 18, fontWeight: 400, marginBottom: 10 }}>
          Chỉ thu giọng nói của những người trong khung hình camera, ngay cả khi những người ở ngoài khung hình đang nói chuyện trong lúc quay phim.          </div>
        </div>
      </div>
      {/* Section text trái, ảnh phải (THÊM MỚI BÊN DƯỚI) */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 280,
          gap: 120,
          marginLeft:82,
          flexWrap: 'wrap',
        }}
      >
        {/* Text bên trái */}
        <div
          style={{
            maxWidth: 300,
            color: '#fff',
            fontWeight: 600,
            lineHeight: 1.2,
            textAlign: 'left',
          }}
        >
          
          <div style={{ fontSize: 21, fontWeight: 600, marginBottom: 10, color:'#86868b' }}>
          Zoom thêm nữa? Xong. Giờ đây, bạn có thể chụp ảnh có tiêu cự 120 mm bằng camera Telephoto 5x trên cả hai phiên bản Pro và <b style={{color:'#fff'}}> chụp ảnh cận cảnh sắc nét hơn từ khoảng cách xa hơn.</b> Với nhiều lựa chọn khung hình, như thể bạn đang sở hữu bảy ống kính chuyên nghiệp ngay trong túi, trên mọi nẻo đường.          </div>
        </div>
        {/* Ảnh bên phải */}
        <img
          src="/images/zcam.jpg"
          alt="Chỉnh sửa Pro"
          style={{
            width: 588,
            maxWidth: 650,
            borderRadius: 20,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            background: '#111',
            objectFit: 'cover',
          }}
        />
      </div>
      {/* Section text lớn GSAP xuất hiện từ dưới lên */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '120px 0 0 0',
          minHeight: 200,
        }}
      >
        <h1
          ref={ultraTextRef} // Đặt ref ở đây!
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#fff',
            textAlign: 'center',
            letterSpacing: '-2px',
            lineHeight: 1.1,
            margin: 0,
            opacity: 0, // ban đầu ẩn, GSAP sẽ hiện
            transition: 'opacity 0.5s, transform 0.5s',
          }}
        >
          Chơi game. <br />
          Trong ánh sáng hoàn toàn mới.
        </h1>
      </div>
      {/* Video toàn màn hình dưới đoạn text lớn */}
      <div style={{
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#000',
        marginTop: 48,
      }}>
        <img
          src="/images/gamip.jpg"
          alt="Game Video"
          style={{ width: '100%', height: 'auto', objectFit: 'cover', background: '#000' }}
        />
        {/* <video
          src="/videos/ssgame.webm" // Đổi tên file nếu cần
          autoPlay
          muted
          playsInline
          loop
          style={{ width: '100%', height: 'auto', objectFit: 'cover', background: '#000' }}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video> */}
      </div>
      {/* Text mô tả dưới video toàn màn hình */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 32,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            background: 'rgba(0,0,0,0.7)',
            color: '#8f8f8f',
            fontSize: 22,
            lineHeight: 1.6,
            borderRadius: 12,
            padding: '24px 36px',
            textAlign: 'center',
            fontWeight: 400,
            boxShadow: '0 2px 16px 0 rgba(0,0,0,0.15)',
          }}
        >
          <style>{`#night-detail-bottom-desc b { color: #dddddd; }`}</style>
          <span id="night-detail-bottom-desc">
          Với công nghệ dò tia tốc độ cao bằng phần cứng nhanh hơn lên đến hai lần, A18 Pro <b> giúp các trò chơi trông thật sống động và chân thực,</b> với đồ họa mượt hơn và ánh sáng chân thực. Và với Chế Độ Trò Chơi trên iOS 18, bạn sẽ có tốc độ khung hình duy trì ổn định hơn để chơi liên tục và độ nhạy được cải thiện nếu bạn sử dụng các điều khiển không dây và AirPods.
          </span>
        </div>
      </div>
      {/* 3 text lớn CPU, GPU, NPU và hình logo game */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 120,
          margin: '60px 0 0 0',
          flexWrap: 'wrap',
        }}
      >
        {/* CPU */}
        <div style={{ textAlign: 'center', minWidth: 220 }}>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>CPU</div>
          <div style={{ fontSize: 60, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(90deg, #3de6d1 0%, #3de6d1 40%, #0099ff 60%, #0099ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block' }}>38%</div>
          <div style={{ color: '#dddddd', fontSize: 20 }}>xử lý nhanh hơn<sup>16</sup></div>
        </div>
        {/* GPU */}
        <div style={{ textAlign: 'center', minWidth: 220 }}>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>GPU</div>
          <div style={{  fontSize: 60, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(90deg, #3de6d1 0%, #3de6d1 40%, #0099ff 60%, #0099ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block',}}>26%</div>
          <div style={{ color: '#dddddd', fontSize: 20 }}>đồ họa mượt mà hơn<sup>16</sup></div>
        </div>
        {/* NPU */}
        <div style={{ textAlign: 'center', minWidth: 220 }}>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>NPU</div>
          <div style={{ fontSize: 60, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(90deg, #3de6d1 0%, #3de6d1 40%, #0099ff 60%, #0099ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block' }}>41%</div>
          <div style={{ color: '#dddddd', fontSize: 20 }}>AI nhanh hơn<sup>16</sup></div>
        </div>
      </div>
      {/* Hình logo game dưới 3 text lớn */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column', // Thêm dòng này để xếp dọc
          justifyContent: 'center',
          alignItems: 'center',
          margin: '40px 0 0 0'
        }}
      >
        <img
          src="/images/hkss.jpg"
          alt="Star Rail Game Logo"
          style={{ maxWidth: 270, width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
        />
        <img
          src="/images/hys.jpg"
          alt="Star Rail Game Logo"
          style={{ maxWidth: 184, width: '100%', height: 'auto', objectFit: 'contain', display: 'block', marginTop: 16 }}
        />
        <p style={{fontSize:14, color:'#8f8f8f', marginTop:40}}>*Bản quyền © COGNOSPHERE. Bảo lưu Mọi quyền. </p>
      </div>
      {/* Section text trái, ảnh phải (THÊM MỚI BÊN DƯỚI) */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 280,
          gap: 120,
          flexWrap: 'wrap',
        }}
      >
        {/* Text bên trái */}
        <div
          style={{
            maxWidth: 450,
            color: '#fff',
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 18 }}>
          Pin bền bỉ cả ngày dài
          </div>
          <div style={{ fontSize: 18, fontWeight: 400, marginBottom: 10 }}>
          Khi bạn đang di chuyển, việc chơi game, xem video hay đa nhiệm mà không phải lo lắng về pin là điều vô cùng quan trọng. Với dung lượng pin 4400 mAh cùng công nghệ mDNIe giúp <b> tối ưu hiệu suất mà vẫn tiết kiệm pin tối đa</b>, Galaxy Z Fold7 hoàn toàn đáp ứng điều đó.<sup>2,3,4</sup>          </div>
        </div>
        {/* Ảnh bên phải */}
        <img
          src="/images/spe.jpg"
          alt="Chỉnh sửa Pro"
          style={{
            width: 588,
            maxWidth: 650,
            borderRadius: 20,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            background: '#111',
            objectFit: 'cover',
          }}
        />
      </div>
    </section>
  );
};

export default NightDetailVideoSection; 