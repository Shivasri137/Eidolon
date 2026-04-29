import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sparkles } from '@react-three/drei';
import { motion } from 'framer-motion';

function GlassShape({ position, rotation, scale, color }: any) {
  const meshRef = useRef<any>();
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.9}
          opacity={1}
          metalness={0.2}
          roughness={0.1}
          ior={1.5}
          thickness={2}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  );
}

export function HeroGeometric({ title1, title2, badge }: { title1: string, title2: string, badge: string }) {
  return (
    <div className="relative w-full h-[60vh] flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-50">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          <Sparkles count={100} scale={10} size={2} speed={0.4} color="#00ffff" />
          <GlassShape position={[-2, 1, -2]} scale={1.5} color="#00ffff" />
          <GlassShape position={[2, -1, -3]} scale={2} color="#ff00ff" />
          <GlassShape position={[0, 0, -4]} scale={3} color="#ffffff" />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(0,255,255,0.2)]"
        >
          {badge}
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500">
            {title1}
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]">
            {title2}
          </span>
        </motion.h1>
      </div>
      
      {/* Fade out bottom edge */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </div>
  );
}
