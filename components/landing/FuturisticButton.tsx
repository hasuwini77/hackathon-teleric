"use client";

import React from "react";
import { motion } from "framer-motion";

interface FuturisticButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  theme?: "dark" | "light";
}

const FuturisticButton = ({ onClick, children, theme = "dark" }: FuturisticButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
      whileHover="hover"
      whileTap="tap"
      className="relative group px-12 py-5 rounded-full overflow-hidden transition-all duration-500"
    >
      {/* Liquid Border Beam */}
      <div className="absolute inset-0 rounded-full border border-white/10" />
      
      <motion.div
        className="absolute inset-0 rounded-full"
        variants={{
          hover: {
            boxShadow: theme === "dark" 
              ? "0 0 30px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.2)"
              : "0 0 30px rgba(37, 99, 235, 0.2), inset 0 0 20px rgba(37, 99, 235, 0.1)",
          }
        }}
      />

      {/* Rotating Beam Animation */}
      <motion.div
        className="absolute inset-[-100%] z-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div className={`h-full w-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,${theme === "dark" ? "#3b82f6" : "#2563eb"}_360deg)] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      </motion.div>

      {/* Clean Glass Background */}
      <div className={`absolute inset-[1px] rounded-full z-[1] backdrop-blur-md transition-colors duration-500 ${
        theme === "dark" ? "bg-black/40 group-hover:bg-black/60" : "bg-white/40 group-hover:bg-white/60"
      }`} />

      {/* Button Content */}
      <motion.span
        variants={{
          hover: { 
            letterSpacing: "0.4em",
            scale: 1.02
          }
        }}
        className={`relative z-10 flex items-center justify-center gap-3 text-sm font-bold tracking-[0.2em] uppercase transition-all duration-500 ${
          theme === "dark" ? "text-white" : "text-slate-900"
        }`}
      >
        {children}
      </motion.span>
      
      {/* Subtle Bottom Glow */}
      <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700 ${
        theme === "dark" ? "bg-blue-500" : "bg-blue-600"
      }`} />
    </motion.button>
  );
};

export default FuturisticButton;
