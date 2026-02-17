"use client";

import React from "react";
import { motion } from "framer-motion";

interface StylishButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

const StylishButton = ({ onClick, children }: StylishButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, translateY: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 10,
        opacity: { duration: 0.8, delay: 1.2 }
      }}
      className="relative group px-12 py-5 rounded-full font-bold text-white tracking-[0.2em] uppercase overflow-hidden"
    >
      {/* Glass Background */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/20 rounded-full transition-colors group-hover:bg-white/10" />
      
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 opacity-50 group-hover:opacity-100 transition-opacity" />
      
      {/* Animated Shine */}
      <motion.div 
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%]"
        animate={{
          translateX: ["100%", "-100%"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2
        }}
      />

      {/* Button Content */}
      <span className="relative z-10 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
        {children}
      </span>

      {/* Outer Pulse Glow */}
      <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.button>
  );
};

export default StylishButton;
