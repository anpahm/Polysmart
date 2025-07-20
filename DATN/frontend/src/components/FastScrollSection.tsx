import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import PhotoStyleAppleMaskGallery from './PhotoStyleAppleMaskGallery';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

const FastScrollSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [expandedCard, setExpandedCard] = useState<'writing' | 'transcript' | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !videoRef.current) return;
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%', // Khi section bắt đầu xuất hiện trên viewport
      onEnter: () => {
        videoRef.current?.play();
      },
      once: true,
    });
  }, []);

  const handleCardToggle = (cardType: 'writing' | 'transcript') => {
    if (expandedCard === cardType) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardType);
    }
  };

  return (
    <div style={{ background: '#000', width: '100%', minHeight: '100vh' }}>
      <div
        ref={sectionRef}
        style={{
          width: '100%',
          minHeight: '100vh',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign:'center',
          fontSize: 60,
          fontWeight: 600,
          color: '#C8C1BD',
        }}
      >
        Chọn Phong Cách Nhiếp Ảnh bạn thích. <br /> Đổi qua. Đổi lại.
        {/* Hiệu ứng gallery chọn phong cách nhiếp ảnh */}
       
      </div>
      <PhotoStyleAppleMaskGallery />
      {/* Section mới: Chỉnh sửa với chế độ xem chi tiết song song + video */}
      <section style={{ width: '100%', minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '0px 0 60px 0' }}>
        <h2
          style={{
            maxWidth:850,
            fontSize: 80,
            fontWeight: 600,
            textShadow: '0 0 20px rgba(255,250,246,0.8), 0 0 40px rgba(208,126,67,0.6), 0 0 60px rgba(255,170,93,0.4), 0 0 80px rgba(116,42,0,0.3)',
            filter: 'drop-shadow(0 0 10px rgba(208,126,67,0.5))',
            marginBottom: 48,
            textAlign: 'center',
            lineHeight: 1.2,
            display: 'inline-block',
          }}
        >
          A18 Pro. <br /> <b style={{color:'#C8C2BD'}}>Con chip năng lực khủng.</b>
          
        </h2>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div>
            <video
              src="/videos/chiplag.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: 1536, height:960, borderRadius: 20 }}
            >
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        </div>
        {/* Text mô tả dưới video */}
        <div
          style={{
            marginTop: 32,
            maxWidth: 700,
            color: '#86868b',
            fontSize: 21,
            lineHeight: 1.6,
            padding: '24px 36px',
            textAlign: 'center',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >
Khám phá A18 Pro: chip mạnh mẽ phi thường mang lại <b style={{color:'#f5f5f5'}}> tốc độ và khả năng tiết kiệm điện vượt trội</b> cho iPhone 16 Pro. Chip cũng tăng cường các tính năng chụp ảnh và quay video tiên tiến như Điều Khiển Camera, đồng thời mang đến hiệu năng đồ họa vượt trội để chơi các game AAA.        </div>
        {/* Text lớn: Nói chuyện với Gemini về bất cứ điều gì bạn thấy */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            margin: '240px 0 0 0',
          }}
        >
          <h2
            style={{
              maxWidth: 900,
              fontSize: 48,
              fontWeight: 700,
              color: '#fff',
              padding: '8px 32px',
              textAlign: 'center',
              lineHeight: 1.2,
              display: 'inline-block',
            }}
          >
            Chọn mặc định tông màu da của bạn.
          </h2>
        </div>
        {/* Ảnh minh họa Gemini bên dưới text lớn */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '40px 0 0 0' }}>
          <img
            src="/images/s.jpg"
            alt="Gemini demo"
            loading="lazy"
            style={{ width: 333, height: 686 }}
          />
        </div>
        <div
          style={{
            marginTop: 32,
            maxWidth: 670,
            color: '#86868b',
            fontSize: 21,
            lineHeight: 1.6,
            padding: '24px 36px',
            textAlign: 'center',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >
Chúng tôi đã tạo ra các phong cách mới giúp bạn <b style={{color:'#f5f5f5'}}>chọn đúng diện mạo mong muốn với kết xuất tông màu da tiên tiến hơn</b> và thiết lập tông màu này làm mặc định trên mọi bức ảnh của bạn.        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '30px 0 0 0' }}>
        </div>
        {/* Text lớn: Nói chuyện với Gemini về bất cứ điều gì bạn thấy */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            margin: '240px 0 0 0',
          }}
        >
          <h2
            style={{
              maxWidth: 850,
              fontSize: 48,
              fontWeight: 700,
              color: '#fff',
              padding: '8px 32px',
              textAlign: 'center',
              lineHeight: 1.2,
              display: 'inline-block',
            }}
          >
           Cân chỉnh theo gu thẩm mỹ của bạn.
          </h2>
        </div>
        {/* Ảnh minh họa Gemini bên dưới text lớn */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '40px 0 0 0' }}>
          <img
            src="/images/s1.jpg"
            alt="Gemini demo"
            loading="lazy"
            style={{ width: 333, height: 686 }}
          />
        </div>
        <div
          style={{
            marginTop: 32,
            maxWidth: 850,
            color: '#86868b',
            fontSize: 21,
            lineHeight: 1.6,
            padding: '24px 36px',
            textAlign: 'center',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >
Quy trình xử lý hình ảnh cải tiến của chúng tôi cũng tạo ra nhiều phong cách sáng tạo hơn. Điều này giúp bạn <b style={{color:'#f5f5f5'}}> tùy chỉnh sắc thái bức ảnh </b>thông qua màu sắc.Với sức mạnh của A18 Pro, bạn có thể thấy phong cách được áp dụng trong bản xem trước trực tiếp, y như đang chỉnh tông màu ảnh chuyên nghiệp trong thời gian thực.
</div>

{/* Text lớn: Nói chuyện với Gemini về bất cứ điều gì bạn thấy */}
<div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            margin: '240px 0 0 0',
          }}
        >
          <h2
            style={{
              maxWidth: 850,
              fontSize: 48,
              fontWeight: 700,
              color: '#fff',
              padding: '8px 32px',
              textAlign: 'center',
              lineHeight: 1.2,
              display: 'inline-block',
            }}
          >
           Chỉnh cho ảnh đẹp đỉnh.

          </h2>
        </div>
        {/* Ảnh minh họa Gemini bên dưới text lớn */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '40px 0 0 0' }}>
          <img
            src="/images/s2.jpg"
            alt="Gemini demo"
            loading="lazy"
            style={{ width: 333, height: 686 }}
          />
        </div>
        <div
          style={{
            marginTop: 32,
            maxWidth: 850,
            color: '#86868b',
            fontSize: 21,
            lineHeight: 1.6,
            padding: '24px 36px',
            textAlign: 'center',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >Cá nhân hóa mọi phong cách hơn nữa với bảng điều khiển mới, giúp <b style={{color:'#f5f5f5'}}> dễ dàng điều chỉnh đồng thời tông màu và màu sắc.</b> Bạn cũng có thể sử dụng thanh trượt để điều chỉnh độ đậm nhạt của một số màu cụ thể, thay vì điều chỉnh toàn bộ màu sắc của ảnh.
</div>


      </section>
      {/* Section: Tóm tắt đơn giản, tổ chức thông minh + 2 card */}
      <section style={{ width: '100%', minHeight: '100vh', background: '#121212', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '120px 0 60px 0' }}>
        <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', padding: '0 160px' }}>
          <h2
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              lineHeight: 1.2,
              marginBottom: 48,
              display: 'block',
            }}
          >
            Tóm tắt đơn giản, tổ chức thông minh
          </h2>
          <div style={{ 
            display: 'flex', 
            gap: 32, 
            justifyContent: 'center', 
            alignItems: 'flex-start', 
            overflow: 'hidden',
            position: 'relative',
            minHeight: 400,
            width: '100%',
          }}>
            {/* Card 1 */}
            <SummaryCard
              title="Cá nhân hóa Màn Hình Chính của bạn."
              imgSmall="/images/mhc.jpg"
              imgLarge="/images/qa1.jpg"
              desc="Chọn màu bất kỳ cho các biểu tượng. Sắp xếp lại và thay đổi kích thước các ứng dụng và tiện ích. Bạn còn có thể tùy ý khóa hoặc ẩn các ứng dụng để bảo vệ thông tin nhạy cảm."
              backgroundColor="#000000"
              isExpanded={expandedCard === 'writing'}
              onToggle={() => handleCardToggle('writing')}
            />
            {/* Card 2 */}
            <SummaryCard
              title="Chọn các điều khiển của bạn."
              imgSmall="/images/mhp.jpg"
              imgLarge="/images/qe1.jpg"
              desc="Chuyển những nút điều khiển bạn thường sử dụng lên Màn Hình Khóa. Hoặc bạn có thể đặt nút Tác Vụ thành một công cụ điều khiển bạn thích."
              backgroundColor="#000000"
              isExpanded={expandedCard === 'transcript'}
              onToggle={() => handleCardToggle('transcript')}
            />
          </div>
          
        </div>
      </section>
      
      {/* Section: Phone with Shield Logo */}
      <section style={{ 
        width: '100%', 
        minHeight: '100vh', 
        background: '#000',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Shield Logo Foreground */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Main Heading */}
          <h2
            style={{
              maxWidth:1000,
              fontSize: 80,
              fontWeight: 600,
              color: '#C8C1BD',
              textAlign: 'center',
              lineHeight: 1,
              marginTop: 80,
              marginBottom: 80,
              display: 'block',
            }}
          >
           <b style={{textShadow: '0 0 20px rgba(255,250,246,0.8), 0 0 40px rgba(208,126,67,0.6), 0 0 60px rgba(255,170,93,0.4), 0 0 80px rgba(116,42,0,0.3)',
            filter: 'drop-shadow(0 0 10px rgba(208,126,67,0.5))',}}> iOS 18.</b> <br />
            Tùy chỉnh. Tạo phong cách. <br />
Gây thương nhớ.
          </h2>
          <img
            src="/images/pc.jpg"
            alt="Samsung Shield Logo"
            style={{
              width: 1596,
              height: 1229,
              zIndex: 2,
            }}
          />
          
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            zIndex: -1,
            animation: 'pulse 3s ease-in-out infinite',
          }} />
        </div>
  
      </section>
      
      {/* Section: Security & Privacy */}
      <section
        style={{
          width: '100%',
          minHeight: '100vh',
          background: '#0E0E0E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 0 120px 0',
        }}
      >
        <h1 style={{fontSize:21, fontWeight:600,marginBottom:60, color:'#fff'}}>Khám phá các công cụ mới giúp bạn viết lách, tập trung và giao tiếp.</h1>
        <div
          style={{
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 32,
            padding: '0 16px',
          }}
        >
          {/* Card lớn bên trái */}
          <div
            style={{
              flex: 6,
              background: '#000000',
              borderRadius: 28,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column', // Đổi sang column
              alignItems: 'center',
              height:685,
              maxWidth:540,
              overflow: 'hidden', // Đảm bảo ảnh không tràn
              justifyContent: 'center',
            }}
          >
            {/* Ảnh phía trên */}
            <div style={{ width: 210, height: 430, margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="/images/uo.jpg" 
                alt="Bảo vệ trên thiết bị" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', }} 
              />
            </div>
            {/* Text phía dưới ảnh */}
            <div style={{ textAlign: 'center',  }}>
              <p style={{ fontSize: 14, color: 'rgb(134,134,139)', fontWeight:600,maxWidth:300 }}>
             <b style={{color:'#f5f5f5'}}> Công Cụ Viết</b> có thể hiệu đính văn bản và viết lại các phiên bản khác nhau cho đến khi có được giọng văn và từ ngữ phù hợp và tóm tắt văn bản đã chọn bằng một thao tác chạm. Bạn có thể dùng các công cụ này ở hầu hết mọi nơi bạn viết, bao gồm cả các ứng dụng của bên thứ ba.
              </p>
            </div>
          </div>
          {/* 2 card nhỏ bên phải */}
          <div
            style={{
              flex: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              justifyContent: 'space-between',
            }}
          >
            {/* Card nhỏ 1 */}
            <div
              style={{
                background: '#000000',
                borderRadius: 28,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 24px',
                maxWidth: 540,
                height: 330,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Text phía trên */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: 'rgb(134,134,139)', fontWeight:600,maxWidth:330,marginBottom:60 }}>
                  Chỉ cần nhấn ghi âm trong ứng dụng Ghi Chú hoặc Điện Thoại để ghi âm và chép lại nội dung.<br/>
                  Apple Intelligence tạo <b style={{color:'#fff'}}>bản tóm tắt</b> cho nội dung chép lại, nhờ đó bạn có thể nắm bắt ngay thông tin quan trọng nhất.
                </p>
              </div>
              {/* Ảnh phía dưới */}
              <div style={{ width: 340, height: 90, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/images/ghi.jpg" alt="Ghi âm" style={{ width: 700, height: 104, objectFit: 'contain',marginBottom:50 }} />
              </div>
            </div>
            {/* Card nhỏ 2 */}
            <div
              style={{
                background: '#000000',
                borderRadius: 28,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 24px',
                maxWidth: 540,
                height: 330,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Text phía trên */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: 'rgb(134,134,139)', fontWeight:600,maxWidth:330, marginBottom:60 }}>
               <b style={{color:'#f5f5f5'}}> Thư ưu tiên trong Mail</b> đưa các thư gấp lên trên đầu hộp thư đến, chẳng hạn như lời mời có hạn chót hôm nay hoặc lời nhắc làm thủ tục cho chuyến bay của bạn chiều nay.
                </p>
              </div>
              {/* Ảnh phía dưới */}
              <div style={{ width: 340, height: 90, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/images/ghii.jpg" alt="Ghi âm" style={{ width: 542, height: 356, objectFit: 'contain', marginTop:150 }} />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section: One UI 8 */}
      <section style={{ 
        width: '100%', 
        minHeight: '100vh', 
        background: '#000000',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '0px 0 60px 0',
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '100vw', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          overflow: 'hidden', 
          padding: '0 160px' 
        }}>
          {/* Main Heading */}
          <h2
            style={{
              maxWidth:800,
              fontSize: 48,
              fontWeight: 700,
              color: '#86868B',
              textAlign: 'center',
              lineHeight: 1.2,
              marginBottom: 32,
              marginTop: 50,
              display: 'block',
            }}
          >
            Bấm và giữ để <b style={{color:'#fff'}}> bắt đầu quay video.</b>
          </h2> 
          {/* Video */}
          <div style={{
            width: '100%',
            maxWidth: 1200,
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 60,
          }}>
            <video
              src="/videos/ap.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: 780,
                height: 704,
              }}
            >
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        </div>
      </section>
      {/* Section text trái, ảnh phải (THÊM MỚI BÊN DƯỚI) */}
        <div
         style={{
           width: '100%',
           background: '#000000',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center',
           padding: '160px 20px 80px 20px',
           gap: 120,
           flexWrap: 'wrap',
           margin: 0,
           border: 'none',
         }}
       >
                 {/* Text bên trái */}
         <div
           style={{
             maxWidth: 440,
             color: '#C8C1BD',
             fontWeight: 700,
             lineHeight: 1.2,
             textAlign: 'left',
           }}
         >
          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 18 }}>
          Bấm để khởi chạy ứng dụng Camera. Bấm lần nữa để chụp ảnh ngay.
          </div>
        </div>
                          {/* Video bên phải */}
         <video
           src="/videos/ap1.mp4"
           autoPlay
           loop
           muted
           playsInline
           style={{
             width: 550,
             height:486,
             objectFit: 'cover',
           }}
         >
           Trình duyệt của bạn không hỗ trợ video.
         </video>
       </div>

       <div
         style={{
           width: '100%',
           background: '#000000',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center',
           padding: '160px 20px 80px 20px',
           gap: 120,
           flexWrap: 'wrap',
           margin: 0,
           border: 'none',
         }}
       >
     
                          {/* Video bên phải */}
         <video
           src="/videos/ap2.mp4"
           autoPlay
           loop
           muted
           playsInline
           style={{
             width: 550,
             height:486,
             objectFit: 'cover',
           }}
         >
           Trình duyệt của bạn không hỗ trợ video.
         </video>

                     {/* Text bên trái */}
                     <div
           style={{
             maxWidth: 440,
             color: '#C8C1BD',
             fontWeight: 700,
             lineHeight: 1.2,
             textAlign: 'left',
           }}
         >
          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 18 }}>
          Ấn nhẹ một lần để mở các công cụ điều khiển như thu phóng.
          </div>
        </div>
       </div>

       <div
         style={{
           width: '100%',
           background: '#000000',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center',
           padding: '160px 20px 80px 20px',
           gap: 120,
           flexWrap: 'wrap',
           margin: 0,
           border: 'none',
         }}
       >
                 {/* Text bên trái */}
         <div
           style={{
             maxWidth: 440,
             color: '#C8C1BD',
             fontWeight: 700,
             lineHeight: 1.2,
             textAlign: 'left',
           }}
         >
          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 18 }}>
          Khi ấn nhẹ hai lần, bạn có thể chọn cài đặt camera khác. Rồi trượt để điều chỉnh cài đặt đó.
          </div>
        </div>
                          {/* Video bên phải */}
         <video
           src="/videos/ap3.mp4"
           autoPlay
           loop
           muted
           playsInline
           style={{
             width: 550,
             height:486,
             objectFit: 'cover',
           }}
         >
           Trình duyệt của bạn không hỗ trợ video.
         </video>
       </div>
       {/* Section: Gallery Camera */}
       <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#000', padding: '60px 0 60px 0' }}>
        {/* Gallery Camera Section */}
        {(() => {
          const cameraGallery = [
            { label: 'Macro', img: '/images/m.jpg', caption: 'Macro 0,5x' },
            { label: '13 mm', img: '/images/m1.jpg', caption: 'Ultra Wide 0,5x' },
            { label: '24 mm', img: '/images/m2.jpg', caption: 'Fusion 1x 24mm' },
            { label: '28 mm', img: '/images/m3.jpg', caption: 'Fusion 1,2x 28mm' },
            { label: '35 mm', img: '/images/m4.jpg', caption: 'Fusion 1,5x 35mm' },
            { label: '48 mm', img: '/images/m5.jpg', caption: 'Telephoto 2x' },
            { label: '120 mm', img: '/images/m6.jpg', caption: 'Telephoto 5x' },
          ];
          const [selected, setSelected] = React.useState(0);
          return (
            <div style={{ textAlign: 'center', width: '100%', maxWidth: 1100, margin: '0 auto', padding: 32, }}>
              {/* Ảnh lớn */}
              <img
                src={cameraGallery[selected].img}
                alt={cameraGallery[selected].label}
                style={{ width: '100%', maxWidth: 885,  margin: '0 auto', height:665, objectFit: 'cover' }}
              />
              {/* Thanh chọn tiêu cự */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '32px 0',borderRadius: 24, background:'#333336', height:55, width:710, marginLeft:150 }}>
                {cameraGallery.map((item, idx) => (
                  <button
                    key={item.label}
                    onClick={() => setSelected(idx)}
                    style={{
                      padding: '12px 12px',
                      borderRadius: 24,
                      border: 'none',
                      background: idx === selected ? '#fff' : '#333336',
                      color: idx === selected ? '#000' : '#fff',
                      fontWeight: 600,
                      fontSize: 18,
                      cursor: 'pointer',
                      boxShadow: idx === selected ? '0 2px 8px #fff3' : 'none',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {/* Caption */}
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 500, marginBottom: 24 }}>
                {cameraGallery[selected].caption}
              </div>
            </div>
          );
        })()}
      </div>
       {/* Text bên dưới ảnh */}
       <div style={{
         background: '#000',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         padding: '0px 20px 60px 20px',
         textAlign: 'center',
       }}>
       </div>       
       {/* Section: Samsung Care+ Service */}
       <section style={{ 
         width: '100%', 
         minHeight: '100vh', 
         background: '#000',
         display: 'flex', 
         flexDirection: 'column',
         alignItems: 'center', 
         justifyContent: 'center', 
         padding: '120px 0 60px 0',
       }}>
         <div style={{ 
           width: '100%', 
           maxWidth: '100vw', 
           margin: '0 auto', 
           display: 'flex', 
           flexDirection: 'column', 
           alignItems: 'center', 
           overflow: 'hidden', 
           padding: '0 160px' 
         }}>
           {/* Main Heading */}
           <h2
             style={{
               maxWidth: 1200,
               fontSize: 80,
               fontWeight: 600,
               color: '#fff',
               textAlign: 'center',
               lineHeight: 1.2,
               marginBottom: 80,
               display: 'block',
             }}
           >
            Lúc khẩn cấp,<br />
            có iPhone trợ giúp.           
           </h2>
           <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 10,
          gap: 120,
          flexWrap: 'wrap',
        }}
      >
        {/* Text bên trái */}
        <div
          style={{
            maxWidth: 300,
            color: '#86868b',
            fontWeight: 600,
            lineHeight: 1.2,
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 21, fontWeight: 600, marginBottom: 10 }}>
         <b style={{color:'#fff'}}> Phát Hiện Va Chạm </b>sử dụng cảm biến phần cứng và thuật toán chuyển động tiên tiến để phát hiện va chạm ô tô nghiêm trọng, sau đó gọi dịch vụ khẩn cấp rồi gửi thông báo tới các liên hệ khẩn cấp của bạn khi cần kíp, ngay cả khi không có mạng di động.11
</div>
        </div>
        {/* Ảnh bên phải */}
        <img
          src="/images/sos.jpg"
          alt="Chỉnh sửa Pro"
          style={{
            width: 416,
            maxWidth: 858,
            borderRadius: 20,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            background: '#111',
            objectFit: 'cover',
          }}
        />
      </div>
         </div>
       </section>
    </div>
  );
};

export default FastScrollSection;

// Card component
const SummaryCard = ({ title, imgSmall, imgLarge, desc, backgroundColor, isExpanded, onToggle }: { 
  title: string; 
  imgSmall: string; 
  imgLarge: string; 
  desc: string; 
  backgroundColor: string;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  return (
    <div
      style={{
        width: isExpanded ? 1200 : 588,
        height: 550,
        background: isExpanded ? '#000' : backgroundColor,
        borderRadius: 32,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
      onClick={onToggle}
    >
      {/* Title trên nền background */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#86868b',
          marginBottom: 16,
          zIndex: 2,
          position: 'relative',
          padding: '24px 24px 0 24px',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flex: 1, width: '100%', alignItems: 'center', position: 'relative' }}>
        {!isExpanded ? (
          <img
            src={imgSmall}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        ) : (
          <>
            {/* Text content bên trái khi expanded */}
            <div 
              style={{ 
                fontSize: 18, 
                color: '#fff', 
                lineHeight: 1.6,
                position: 'relative',
                zIndex: 2,
                padding: '20px',
                width: '50%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                opacity: isExpanded ? 1 : 0,
                transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }} 
              dangerouslySetInnerHTML={{ __html: desc }} 
            />
            {/* Ảnh bên phải khi expanded */}
            <img
              src={imgLarge}
              alt={title}
              style={{
                width: '50%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                right: 0,
                transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            />
          </>
        )}
      </div>
      {/* Dấu cộng hoặc trừ */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 700,
          color: '#2563eb',
          cursor: 'pointer',
          zIndex: 3,
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onClick={e => { e.stopPropagation(); onToggle(); }}
      >
        {isExpanded ? '×' : '+'}
      </div>
    </div>
  );
}; 