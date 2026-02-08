"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import type * as THREE from "three";

function AnimatedSphere({ isSpeaking }: { isSpeaking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="#14d9f5"
        attach="material"
        distort={isSpeaking ? 0.6 : 0.3}
        speed={isSpeaking ? 2 : 1}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

export default function AgentAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffb347" />
        <AnimatedSphere isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
}
