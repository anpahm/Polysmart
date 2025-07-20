'use client';

import React from 'react';

type CameraCompareSectionProps = {
  selected: string;
  setSelected: (value: string) => void;
};

type CameraCompareDropdownProps = {
  selected: string;
  setSelected: (value: string) => void;
};

type CameraCompareRightOnlySpecProps = {
  selected: string;
};

function CameraCompareDropdown({ selected, setSelected }: CameraCompareDropdownProps) {
  const compareList = [
    { name: 'Galaxy S22 Ultra', mp: 108 },
    { name: 'Galaxy S23 Ultra', mp: 200 },
    { name: 'iPhone 15 Pro Max', mp: 48 },
    { name: 'Xiaomi 13 Ultra', mp: 50 },
    { name: 'Galaxy S24 Ultra', mp: 48 },
    { name: 'Galaxy S25 Ultra', mp: 50 },
    { name: 'Galaxy Z Fold3', mp: 108 },
    { name: 'Galaxy Z Fold4', mp: 200 },
    { name: 'Galaxy Z Fold5', mp: 48 },
    { name: 'Galaxy Z Fold6', mp: 50 },
  ];
  return (
    <div style={{ position: 'relative', width: 320, marginBottom: 18, textAlign: 'left' }}>
      <div style={{ color: '#bfc3c6', fontSize: 24, marginBottom: 2, textAlign: 'left' }}>
        So sánh với
      </div>
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        style={{
          width: '100%',
          fontSize: 32,
          fontWeight: 700,
          background: 'transparent',
          color: '#fff',
          border: 'none',
          borderBottom: '2px solid #fff',
          padding: '8px 32px 8px 0',
          appearance: 'none',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {compareList.map(opt => (
          <option key={opt.name} value={opt.name} style={{ color: '#000' }}>{opt.name}</option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 8, top: 44, pointerEvents: 'none', fontSize: 24 }}>▼</span>
    </div>
  );
}

function CameraCompareRightOnlySpec({ selected }: CameraCompareRightOnlySpecProps) {
  const compareList = [
    { name: 'Galaxy S22 Ultra', mp: 108 },
    { name: 'Galaxy S23 Ultra', mp: 200 },
    { name: 'iPhone 15 Pro Max', mp: 48 },
    { name: 'Xiaomi 13 Ultra', mp: 50 },
    { name: 'Galaxy S24 Ultra', mp: 48 },
    { name: 'Galaxy S25 Ultra', mp: 50 },
    { name: 'Galaxy Z Fold3', mp: 108 },
    { name: 'Galaxy Z Fold4', mp: 200 },
    { name: 'Galaxy Z Fold5', mp: 48 },
    { name: 'Galaxy Z Fold6', mp: 50 },
  ];
  const current = compareList.find(c => c.name === selected) || compareList[0];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',paddingLeft:30, paddingTop:35 }}>
      <div style={{ fontSize: 60, fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 8 }}>{current.mp}<span style={{
                background: 'linear-gradient(90deg, #3de6d1 0%, #3de6d1 40%, #0099ff 60%, #0099ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block',
              }}>MP</span></div>
      <div style={{ fontSize: 20, color: '#e0e0e0', marginTop: 8  }}>Camera góc rộng</div>
    </div>
  );
}

const CameraCompareSection: React.FC<CameraCompareSectionProps> = ({ selected, setSelected }) => {
  return (
    <section
      style={{
        width: '100%',
        minHeight: '60vh',
        background: '#1C1C1C',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '60px 0 0 0',
        position: 'relative',
      }}
    >
      {/* Hàng tiêu đề + dropdown */}
      <div style={{
        width: '100%',
        maxWidth: 1400,
        margin: '0 auto',
        paddingLeft: 200,
        paddingRight: 60,
        marginBottom: 30,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 160,
      }}>
        {/* Tiêu đề bên trái */}
        <div style={{
          fontSize: 36,
          fontWeight: 700,
          textAlign: 'left',
          lineHeight: 1.15,
          color: '#fff',
          letterSpacing: '-1.5px',
          maxWidth: 500,
          whiteSpace: 'pre-line',
        }}>
          Xem sự khác biệt về thông số kỹ thuật của camera
        </div>
        {/* So sánh với + dropdown bên phải */}
        <CameraCompareDropdown selected={selected} setSelected={setSelected} />
      </div>
      {/* 2 cột so sánh */}
      <div style={{ maxWidth: 1400, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, margin: '0 auto', paddingLeft: 60, paddingRight: 60 }}>
        {/* Bên trái: Z Fold7 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 230, paddingTop: 40 }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#fff', textAlign: 'left' }}>Galaxy Z Fold7</div>
          <div style={{ fontSize: 60, fontWeight: 700, color: '#1ec0ff', lineHeight: 1, marginBottom: 8, textAlign: 'left' }}>200<span style={{
                    background: 'linear-gradient(90deg, #3de6d1 0%, #3de6d1 40%, #0099ff 60%, #0099ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                    display: 'inline-block',
                  }}>MP</span></div>
          <div style={{ fontSize: 20, color: '#e0e0e0', marginTop: 8, textAlign: 'left' }}>Camera góc rộng</div>
        </div>
        {/* Bên phải: Máy so sánh - chỉ hiển thị thông số */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 50 }}>
          <CameraCompareRightOnlySpec selected={selected} />
        </div>
      </div>
    </section>
  );
};

export default CameraCompareSection; 