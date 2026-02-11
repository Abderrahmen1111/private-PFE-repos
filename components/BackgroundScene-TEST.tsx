'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple visible test cube
function TestCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
    </mesh>
  );
}

// Dynamic Photo Wall - Enhanced visibility
function DynamicPhotoWall() {
  const groupRef = useRef<THREE.Group>(null);
  
  const cards = useMemo(() => {
    const cardArray = [];
    const cols = 8;
    const rows = 5;
    const spacing = 4;
    
    const colors = [
      '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
      '#ff00ff', '#00ffff', '#ff8800', '#8800ff'
    ];
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i - cols / 2) * spacing;
        const y = (j - rows / 2) * spacing;
        const z = -15;
        
        cardArray.push({
          position: [x, y, z] as [number, number, number],
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
    
    return cardArray;
  }, []);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.5;
  });
  
  return (
    <group ref={groupRef}>
      {cards.map((card, i) => (
        <mesh key={i} position={card.position}>
          <planeGeometry args={[3, 4]} />
          <meshStandardMaterial
            color={card.color}
            emissive={card.color}
            emissiveIntensity={2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      {/* Very bright lighting */}
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <directionalLight position={[-10, -10, -5]} intensity={2} />
      <pointLight position={[0, 0, 20]} intensity={3} color="#ffffff" />
      
      {/* Test cube to verify rendering */}
      <TestCube />
      
      {/* Photo wall */}
      <DynamicPhotoWall />
    </>
  );
}

export default function BackgroundScene() {
  console.log('🎨 BackgroundScene rendering...');
  
  return (
    <div className="fixed inset-0 -z-10" style={{ background: '#000000' }}>
      <div className="absolute top-4 left-4 text-white bg-red-500 p-2 z-50">
        Canvas Loading...
      </div>
      <Canvas
        camera={{ position: [0, 0, 25], fov: 60 }}
        onCreated={({ gl }) => {
          console.log('✅ Canvas created!', gl);
        }}
        gl={{
          antialias: true,
          alpha: false,
        }}
      >
        <color attach="background" args={['#1a1a2e']} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
