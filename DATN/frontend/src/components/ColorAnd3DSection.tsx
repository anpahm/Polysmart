'use client';
import React, { useState } from 'react';
import Phone3DViewer from './Phone3DViewer';

class ThreeDErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ColorAnd3DSection: React.FC = () => {
  const fallbackComponent = (
    <div style={{
      width: 400,
      aspectRatio: '9/20',
      maxWidth: '90vw',
      background: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      marginBottom: 200,
      borderRadius: '8px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
        <div>iPhone 16 Pro</div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
          Mô hình 3D đang được tải...
        </div>
      </div>
    </div>
  );

  return (
    <section style={{ 
      width: '100%',
      minHeight: '120vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      position: 'relative',
      padding: 0 
    }}>
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
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* 3D Viewer with Error Boundary */}
        <ThreeDErrorBoundary fallback={fallbackComponent}>
          <div style={{ 
            width: 400, 
            aspectRatio: '9/20', 
            maxWidth: '90vw', 
            overflow: 'hidden', 
            background: '#000', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: 200 
          }}>
            <Phone3DViewer />
          </div>
        </ThreeDErrorBoundary>
        
        {/* Chỉ giữ lại dòng chữ Titan Sa Mạc */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
        }}>
          {/* Tên màu */}
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            textAlign: 'center',
            color: '#fff',
          }}>
            <p>Titan Sa Mạc</p>
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