"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function EndfieldLoading({ fullScreen = true }: { fullScreen?: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center bg-[var(--end-bg)] text-[var(--end-text-main)] ${fullScreen ? "fixed inset-0 z-50" : "w-full h-64"}`}>
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
        style={{ 
            backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)", 
            backgroundSize: "40px 40px" 
        }} 
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Rotating Geometric Logo */}
        <div className="relative w-24 h-24">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-[var(--end-yellow)] border-dashed rounded-full opacity-50"
            />
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border border-[var(--end-text-sub)] rounded-full opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-4 h-4 bg-[var(--end-yellow)] transform rotate-45"
                />
            </div>
            
            {/* Scanning Line */}
            <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-[var(--end-yellow)] shadow-[0_0_10px_var(--end-yellow)] opacity-50"
            />
        </div>

        {/* Text & Progress */}
        <div className="w-64 space-y-2">
            <div className="flex justify-between items-end">
                <span className="font-mono text-xs font-bold tracking-widest text-[var(--end-text-sub)]">
                    SYSTEM_INIT...
                </span>
                <span className="font-mono text-xl font-bold text-[var(--end-yellow)]">
                    {Math.min(100, Math.floor(progress))}%
                </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 w-full bg-[var(--end-border)] relative overflow-hidden">
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-[var(--end-yellow)]"
                    style={{ width: `${progress}%` }}
                />
            </div>
            
            <div className="flex justify-between text-[8px] font-mono text-[var(--end-text-dim)] uppercase">
                <span>Connecting to Tide Network</span>
                <span>Ver 0.9.2</span>
            </div>
        </div>
      </div>
    </div>
  );
}
