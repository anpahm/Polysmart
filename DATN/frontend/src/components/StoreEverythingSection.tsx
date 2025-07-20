import React from 'react';

const StoreEverythingSection = () => (
  <>
    {/* Section ảnh trái, text phải */}
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 140,
        gap: 165,
        flexWrap: 'wrap',
        background: '#000',
      }}
    >
        {/* Ảnh bên trái */}
        <img
          src="/images/strss.jpg"
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
            color: '#8f8f8f',
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 18, color:'#fff' }}>
            Lưu trữ mọi thứ bạn cần
          </div>
          <style>{`#store-everything-desc b { color: #dddddd; }`}</style>
          <div id="store-everything-desc" style={{ fontSize: 18, fontWeight: 400, marginBottom: 10 }}>
            Giữ tất cả những khoảnh khắc quý giá của bạn trong tay với bộ nhớ 12 GB hoặc 16 GB và <b>lựa chọn ba tùy chọn về dung lượng lưu trữ.</b> Chọn dung lượng lưu trữ lên đến 256 GB hoặc 512 GB nếu bạn muốn chụp ảnh và chủ yếu là phát trực tuyến video. <b> Hoặc, bạn thậm chí có thể chọn tùy chọn lớn hơn với dung lượng lưu trữ lên đến 1 TB,</b> nếu bạn là một game thủ đam mê, tải xuống các ứng dụng lớn hơn hoặc quay video ở độ phân giải cao, để tránh hết dung lượng lưu trữ và làm chậm tốc độ điện thoại. <sup> 17</sup>
          </div>
        </div>
      </div>
  </>
);

export default StoreEverythingSection;