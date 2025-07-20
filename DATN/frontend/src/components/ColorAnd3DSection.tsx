'use client';
import React, { useState } from 'react';
import Phone3DViewer from './Phone3DViewer';

const colorOptions = [
  { name: 'Titan Sa Mạc', color: '#977E6B' },
  { name: 'Titan Tự Nhiên', color: '#959086' },
  { name: 'Titan Trắng', color: '#D3D1CD' },
  { name: 'Titan Đen', color: '#181919' },
];

const ColorAnd3DSection: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(0);

  return (
    <section style={{ width: '100%',
      minHeight: '120vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      position: 'relative',
      padding: 0 }}>
      <h2 style={{
        textAlign: 'center',
        fontSize: 48,
        fontWeight: 700,
        marginTop: 100,
        marginBottom: 0,
        color:'#fff'
      }}>
        Ngắm nhìn cận cảnh.
      </h2>
      {/* Container flex cho viewer và nút */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* 3D Viewer */}
        <div style={{ width: 400, aspectRatio: '9/20', maxWidth: '90vw', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom:200 }}>
          <Phone3DViewer />
        </div>
        {/* Các nút chọn màu và nút đặt trước */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          zIndex: 2,
        }}>
          {/* Tên màu */}
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 30,
            marginTop: 16,
            textAlign: 'center',
            color: '#fff',
          }}>
            <p>{colorOptions[selectedColor].name}</p>
          </div>
          {/* Dãy nút chọn màu */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            background: '#2E2E30',
            borderRadius: 40,
            padding: '16px 24px',
            alignItems: 'center',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          }}>
            {colorOptions.map((opt, idx) => (
              <button
                key={opt.name}
                onClick={() => setSelectedColor(idx)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: selectedColor === idx ? '1px solid #F5F5F7' : '2px solid #2E2E30',
                  background: opt.color,
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                aria-label={opt.name}
              />
            ))}
          </div>
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
            }}
          >
            Đặt trước
          </button>
        </div>
        {/* Icon 360° góc phải */}
        <div style={{
          position: 'absolute',
          right: 80,
          top: 200,
          fontSize: 24,
          color: '#fff',
          fontWeight: 600,
          userSelect: 'none',
          zIndex: 2,
        }}>
          <span role="img" aria-label="360">↺</span> 360°
        </div>
      </div>
    </section>
  );
};

export default ColorAnd3DSection; 