'use client';
import React, { Suspense, useRef, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function Model() {
  const { scene } = useGLTF('/models/iphone_16_pro_max.glb');
  scene.rotation.set(0, 0, 0);
  scene.position.set(0, 0, 0);
  return <primitive object={scene} scale={3} />; // tăng scale để mô hình lớn hơn
}

const Phone3DViewer = () => {
  const controlsRef = useRef(null); // Không truyền type để tránh lỗi linter
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-10, 10, 10]} intensity={0.7} />
      <Suspense fallback={null}>
        <Model />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        target={[0, 0, 0]}
        enablePan={false}
        enableZoom={false}
      />
    </Canvas>
  );
};

export default memo(Phone3DViewer); 