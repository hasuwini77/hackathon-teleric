"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

interface KineticButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

const KineticButton = ({ onClick, children }: KineticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Magnetic effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Magnetic pull distance
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="relative group px-16 py-6 rounded-full font-black text-white tracking-[0.3em] uppercase overflow-visible transition-transform duration-300"
    >
      {/* Liquid Background Container */}
      <div className="absolute inset-0 rounded-full overflow-hidden border border-white/10 glass-effect">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-600 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
          animate={isHovered ? {
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1.1, 1],
          } : {}}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Animated Glow Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.3),transparent_70%)]" />
      </div>

      {/* Button Text Layer */}
      <span className="relative z-10 flex items-center gap-4 text-lg drop-shadow-2xl">
        {children}
        <motion.div
          animate={isHovered ? { x: 5 } : { x: 0 }}
          className="w-8 h-[1px] bg-white/40 group-hover:bg-white transition-colors"
        />
      </span>

      {/* Outer Halo */}
      <motion.div 
        className="absolute -inset-4 border border-blue-500/20 rounded-full z-0 opacity-0 group-hover:opacity-100 transition-opacity"
        animate={isHovered ? {
          scale: [1, 1.05, 1],
          opacity: [0, 0.4, 0]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
};

export default KineticButton;
