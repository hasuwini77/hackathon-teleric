"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function WavyParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create a grid of points for the wavy surface
  const count = 100; // 100x100 grid
  const total = count * count;
  const positions = useMemo(() => {
    const pos = new Float32Array(total * 3);
    for (let i = 0; i < total; i++) {
        const x = (i % count) - count / 2;
        const z = Math.floor(i / count) - count / 2;
        pos[i * 3] = x * 0.25;
        pos[i * 3 + 1] = 0; // Y starts at 0
        pos[i * 3 + 2] = z * 0.25;
    }
    return pos;
  }, [count, total]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    
    for (let i = 0; i < total; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        
        // Create wave motion
        const wave1 = Math.sin(x * 0.5 + t) * 0.5;
        const wave2 = Math.sin(z * 0.3 + t * 0.8) * 0.4;
        const wave3 = Math.sin((x + z) * 0.2 + t * 0.5) * 0.3;
        
        posAttr.setY(i, wave1 + wave2 + wave3);
    }
    posAttr.needsUpdate = true;
    
    // Slight rotation
    pointsRef.current.rotation.y = Math.sin(t * 0.1) * 0.1;
  });

  return (
    <points ref={pointsRef} position={[0, -2, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={total}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        color="#3b82f6"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FloatingBokeh() {
    const ref = useRef<THREE.Group>(null);
    const count = 100;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 15;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    });

    return (
        <group ref={ref}>
            <Points positions={positions} stride={3}>
                <PointMaterial
                    transparent
                    color="#a855f7"
                    size={0.2}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.2}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

export default function StylishBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        <color attach="background" args={["#000308"]} />
        <ambientLight intensity={0.2} />
        
        <WavyParticles />
        <FloatingBokeh />
        
        <fog attach="fog" args={["#000308", 5, 20]} />
      </Canvas>
    </div>
  );
}
