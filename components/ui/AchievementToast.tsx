"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Achievement } from "@/lib/achievements";

interface AchievementToastProps {
    achievement: Achievement | null;
    onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
    useEffect(() => {
        if (achievement) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-24 right-6 z-[100] w-80 bg-[var(--end-surface)] border border-[var(--end-yellow)] shadow-[0_0_20px_rgba(255,199,0,0.2)] overflow-hidden"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--end-yellow)]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[var(--end-yellow)]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--end-yellow)]" />
                    
                    {/* Scanline */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--end-yellow)]/5 to-transparent pointer-events-none animate-[scan_2s_linear_infinite]" />

                    <div className="p-4 pl-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--end-yellow)]/10 flex items-center justify-center text-[var(--end-yellow)] border border-[var(--end-yellow)]/20 shrink-0">
                            <FontAwesomeIcon icon={achievement.icon} className="text-lg" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <FontAwesomeIcon icon={faTrophy} className="text-[10px] text-[var(--end-yellow)]" />
                                <span className="text-[10px] font-bold text-[var(--end-yellow)] tracking-widest uppercase">
                                    ACHIEVEMENT UNLOCKED
                                </span>
                            </div>
                            
                            <h4 className="text-sm font-bold text-[var(--end-text-main)] mb-1 truncate">
                                {achievement.title}
                            </h4>
                            <p className="text-[10px] text-[var(--end-text-dim)] font-mono leading-tight">
                                {achievement.description}
                            </p>
                        </div>
                    </div>

                    {/* Progress Line */}
                    <motion.div 
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="h-0.5 bg-[var(--end-yellow)] origin-left"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
