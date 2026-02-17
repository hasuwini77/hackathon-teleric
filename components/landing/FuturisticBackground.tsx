"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Stars, Float } from "@react-three/drei";
import * as THREE from "three";

function NeuralNetwork() {
  const ref = useRef<THREE.Group>(null);
  
  // Create a mesh-like structure with particles
  const count = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    
    // Rotation based on time and mouse
    ref.current.rotation.y = t * 0.05;
    ref.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    
    // Mouse reactivity
    const { x, y } = state.mouse;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x * 0.5, 0.1);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, y * 0.5, 0.1);
  });

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#a855f7"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Add a secondary layer for depth */}
      <Points positions={positions.slice(0, 1500)} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function FlowingField() {
    const mesh = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (!mesh.current) return;
        const t = state.clock.getElapsedTime();
        mesh.current.rotation.z = t * 0.1;
        
        // Dynamic color shifting based on mouse X
        const { x } = state.mouse;
        const colorShift = (x + 1) / 2; // 0 to 1
        // (mesh.current.material as THREE.MeshStandardMaterial).color.setHSL(0.7 + colorShift * 0.1, 0.8, 0.5);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={mesh} position={[0, 0, -2]}>
                <torusKnotGeometry args={[3, 0.8, 256, 32]} />
                <meshStandardMaterial 
                    color="#1e1b4b" 
                    wireframe 
                    transparent 
                    opacity={0.15} 
                    emissive="#4f46e5"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </Float>
    );
}

export default function FuturisticBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <NeuralNetwork />
        <FlowingField />
        
        <fog attach="fog" args={["#020617", 5, 15]} />
      </Canvas>
    </div>
  );
}
