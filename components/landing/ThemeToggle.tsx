"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => {
  return (
    <motion.button
      onClick={onToggle}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] group flex items-center justify-center p-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <motion.div
          animate={{
            rotate: isDark ? 0 : 180,
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.5,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="absolute"
        >
          <Moon className="w-6 h-6 text-blue-400" />
        </motion.div>
        
        <motion.div
          animate={{
            rotate: isDark ? -180 : 0,
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="absolute"
        >
          <Sun className="w-6 h-6 text-yellow-400" />
        </motion.div>
      </div>

      <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-full transition-colors duration-500 blur-xl" />
    </motion.button>
  );
};

export default ThemeToggle;
