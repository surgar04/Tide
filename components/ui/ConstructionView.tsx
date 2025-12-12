"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

interface ConstructionViewProps {
  icon?: IconDefinition;
  title: string;
  description: string;
  label?: string; // English/Tech label
}

export function ConstructionView({ 
  icon = faScrewdriverWrench, 
  title, 
  description,
  label = "SYSTEM MODULE UNDER CONSTRUCTION"
}: ConstructionViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className="relative flex flex-col items-center justify-center min-h-[60vh] w-full overflow-hidden rounded-xl border border-[var(--end-border)] bg-[var(--end-surface)]/50 backdrop-blur-sm"
    >
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
      
      {/* Decorative Corner Lines */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[var(--end-yellow)]/30 rounded-tl-xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[var(--end-yellow)]/30 rounded-br-xl" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 p-8 max-w-2xl">
        
        {/* Animated Icon Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[var(--end-yellow)]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative w-24 h-24 flex items-center justify-center rounded-2xl bg-[var(--end-surface-hover)] border border-[var(--end-border)] shadow-lg group-hover:border-[var(--end-yellow)]/50 transition-colors duration-300">
            <FontAwesomeIcon 
              icon={icon} 
              className="text-4xl text-[var(--end-yellow)] animate-[pulse_3s_infinite]" 
            />
            
            {/* Rotating Ring */}
            <div className="absolute inset-0 border border-dashed border-[var(--end-text-dim)]/30 rounded-2xl animate-[spin_10s_linear_infinite]" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--end-text-main)] tracking-tight uppercase">
              {title}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[var(--end-yellow)] font-mono text-xs tracking-widest">
              <span className="w-2 h-2 bg-[var(--end-yellow)] rounded-full animate-pulse" />
              {label}
              <span className="w-2 h-2 bg-[var(--end-yellow)] rounded-full animate-pulse" />
            </div>
          </div>
          
          <p className="text-[var(--end-text-sub)] text-lg leading-relaxed font-light">
            {description}
          </p>
          
          <div className="pt-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--end-surface-hover)] border border-[var(--end-border)] text-xs font-mono text-[var(--end-text-dim)]">
              // ESTIMATED_COMPLETION: TBD
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
