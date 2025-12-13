"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface ComingSoonCardProps {
  icon: IconDefinition;
  title: string;
  subtitle: string;
  description: string;
  statusText?: string;
  delay?: number;
}

export function ComingSoonCard({ 
  icon, 
  title, 
  subtitle, 
  description, 
  statusText = "ACCESS DENIED // 权限不足",
  delay = 0 
}: ComingSoonCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "circOut" }}
      className="bg-[var(--end-surface)] border border-[var(--end-border)] p-12 flex flex-col items-center justify-center text-center min-h-[500px] relative overflow-hidden group w-full"
    >
      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--end-yellow)]/50 to-transparent" />
      <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[var(--end-yellow)]/50 to-transparent" />
      <div className="absolute left-0 top-10 w-[2px] h-20 bg-[var(--end-yellow)]" />
      
      {/* Background Icon */}
      <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 pointer-events-none transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
        <FontAwesomeIcon icon={icon} className="text-[12rem]" />
      </div>

      {/* Main Icon */}
      <div className="w-24 h-24 rounded-full bg-[var(--end-yellow)]/5 border border-[var(--end-yellow)] flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,199,0,0.1)] relative">
         <div className="absolute inset-0 border border-[var(--end-yellow)] rounded-full animate-ping opacity-20" />
         <FontAwesomeIcon icon={icon} className="text-4xl text-[var(--end-yellow)]" />
      </div>

      {/* Text Content */}
      <div className="relative z-10 max-w-lg">
        <div className="inline-block px-3 py-1 mb-4 border border-[var(--end-text-dim)] bg-black/20 text-[10px] font-mono text-[var(--end-text-dim)] tracking-widest">
            {statusText}
        </div>
        
        <h2 className="text-3xl font-bold text-[var(--end-text-main)] mb-2 uppercase tracking-tight">
          {title}
        </h2>
        
        <p className="text-[var(--end-text-sub)] font-mono text-sm mb-8 tracking-wider opacity-80">
          // {subtitle}
        </p>

        <p className="text-[var(--end-text-dim)] leading-relaxed text-sm border-l-2 border-[var(--end-border)] pl-4 text-left mx-auto">
          {description}
        </p>
      </div>

      {/* Scanning Line Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_0%,rgba(255,199,0,0.05)_50%,transparent_100%)] bg-[length:100%_200%] animate-[scan_3s_linear_infinite]" />
    </motion.div>
  );
}
