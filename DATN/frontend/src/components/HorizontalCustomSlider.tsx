'use client';
import React, { useState, memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const cards = [
  {
    img: '/images/ho1.jpg',
    caption: 'iPhone 16 Pro Max sở hữu màn hình iPhone lớn nhất từng có'
  },
  {
    img: '/images/ho2.jpg',
    caption: 'Viền mỏng nhất từng có trên sản phẩm Apple'
  },
  {
    img: '/images/ho3.jpg',
    caption: 'Titan Cấp 5 cao cấp cực kỳ bền bỉ'
  },
  {
    img: '/images/ho4.jpg',
    caption: 'Bốn màu tuyệt đẹp, từ Titan Đen đến Titan Sa Mạc mới'
  },
];

const HorizontalCustomSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <section style={{ width: '100%', background: 'linear-gradient(135deg, #000000 0%, #000000 20%, #251B16 50%, #271C17 80%, #000000 100%)', padding: '100px 0 110px 0', display: 'flex', flexDirection: 'column' }}>
      <p style={{ fontSize: 48, fontWeight: 700, marginBottom: 56, marginLeft:160, color: '#fff', letterSpacing: '-1px' }}>
      Bề ngoài mỏng nhẹ. Nội tại mạnh mẽ.
      </p>
      <div style={{ width: '100%', maxWidth: 1540 }}>
        <Swiper
          modules={[Pagination]}
          slidesPerView="auto"
          spaceBetween={25}
          pagination={{ clickable: true }}
          style={{ width: '100%', paddingBottom: 60, paddingLeft: 160, paddingRight: 160 }}
          speed={800}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          <SwiperSlide style={{  width: 550, height: 650, borderRadius: 20, overflow: 'visible', background: 'transparent' }}>
            <div style={{ width: 550, height: 550, borderRadius: 18, overflow: 'hidden', }}>
              <img src={cards[0].img} loading="lazy" style={{ width: 550, height: 550, objectFit: 'cover', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} />
            </div>
            <p style={{ 
              fontSize: 17,
              maxWidth:350, 
              fontWeight:600,
              color: '#E7C5B2', 
              margin: '20px 0 0 0',
              textAlign: 'left',
              marginLeft: 40,
              opacity: 0.9
            }}>
              {cards[0].caption}
            </p>
          </SwiperSlide>

          <SwiperSlide style={{  width: 550, height: 650, borderRadius: 20, overflow: 'visible', background: 'transparent' }}>
            <div style={{ width: 550, height: 550, borderRadius: 20, overflow: 'hidden', background: '#f4f4f4' }}>
              <img src={cards[1].img} loading="lazy" style={{  width: 550, height: 550, objectFit: 'cover', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} />
            </div>
            <p style={{ 
              fontSize: 17,
              maxWidth:350, 
              fontWeight:600,
              color: '#E7C5B2', 
              margin: '20px 0 0 0',
              textAlign: 'left',
              marginLeft: 40,
              opacity: 0.9
            }}>
              {cards[1].caption}
            </p>
          </SwiperSlide>

          <SwiperSlide style={{  width: 550, height: 650, borderRadius: 20, overflow: 'visible', background: 'transparent' }}>
            <div style={{ width: 550, height: 550, borderRadius: 20, overflow: 'hidden', background: '#f4f4f4' }}>
              <img src={cards[2].img} loading="lazy" style={{ width: 550, height: 550, objectFit: 'cover', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} />
            </div>
            <p style={{ 
              fontSize: 17,
              maxWidth:350, 
              fontWeight:600,
              color: '#E7C5B2', 
              margin: '20px 0 0 0',
              textAlign: 'left',
              marginLeft: 40,
              opacity: 0.9
            }}>
              {cards[2].caption}
            </p>
          </SwiperSlide>
          
          <SwiperSlide style={{ width: 550, height: 650, borderRadius: 20, overflow: 'visible', background: 'transparent' }}>
            <div style={{ width: 550, height: 550, borderRadius: 20, overflow: 'hidden', background: '#f4f4f4' }}>
              <img src={cards[3].img} loading="lazy" style={{  width: 550, height: 550, objectFit: 'cover', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} />
            </div>
            <p style={{ 
              fontSize: 17,
              maxWidth:350, 
              fontWeight:600,
              color: '#E7C5B2', 
              margin: '20px 0 0 0',
              textAlign: 'left',
              marginLeft: 40,
              opacity: 0.9
            }}>
              {cards[3].caption}
            </p>
          </SwiperSlide>
        </Swiper>
      </div>
      
      {/* Text blocks giống Apple - bên dưới slide */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        paddingLeft: 310, 
        paddingRight: 300,
        marginTop: 60
      }}>
        {/* Right text block */}
        <div style={{ maxWidth: '45%' }}>
          <p style={{ 
            maxWidth:350,
            textAlign:'left',
            fontSize: 21, 
            fontWeight:600,
            color: '#86868b', 
            lineHeight: 1.5,
            opacity: 0.9
          }}>
            Công nghệ màn hình mới cho phép chúng tôi định tuyến dữ liệu hiển thị dưới các điểm ảnh hoạt động mà không bị biến dạng, giúp <b style={{color:'#f5f5f7'}}> màn hình Super Retina XDR</b> 6,3 inch và 6,9 inch lớn hơn có viền mỏng hơn, đem đến cảm giác tuyệt vời khi cầm trên tay.
          </p>
        </div>
        
        {/* Left text block */}
        <div style={{ maxWidth: '45%', textAlign: 'right' }}>
          <p style={{ 
            maxWidth:350,
            textAlign:'left',
            fontSize: 21, 
            fontWeight:600,
            color: '#86868b', 
            lineHeight: 1.5,
            opacity: 0.9
          }}>
            iPhone 16 Pro có khả năng chống tia nước, chống nước và chống bụi. Thiết bị <b style={{color:'#f5f5f7'}}> cực kỳ bền bỉ </b> với chất liệu Ceramic Shield thế hệ mới nhất.
          </p>
        </div>
      </div>
      
      <style>{`
      .swiper-pagination-bullet {
        width: 12px !important;
        height: 12px !important;
        border-radius: 50% !important;
        background: #eee !important;
        border: 0.1px solid #000 !important;
        opacity: 1 !important;
        margin: 0 6px !important;
        transition: background 0.2s;
      }
      .swiper-pagination-bullet-active {
        background: #222 !important;
      }
    `}</style>
    </section>
  );
};

export default memo(HorizontalCustomSlider); 