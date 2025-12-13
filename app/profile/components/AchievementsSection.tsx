"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faTrophy, 
    faLock
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { ACHIEVEMENTS } from "@/lib/achievements";

interface AchievementsSectionProps {
    userData: any;
    uploadCount: number;
    projectCount: number;
}

export function AchievementsSection({ userData, uploadCount, projectCount }: AchievementsSectionProps) {
    if (!userData) return null;

    const unlockedCount = ACHIEVEMENTS.filter(a => a.condition(userData, uploadCount, projectCount)).length;
    const progressPercent = (unlockedCount / ACHIEVEMENTS.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="end-card p-6"
        >
            <div className="end-corner-tr" />
            
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrophy} className="text-[var(--end-yellow)]" />
                    成就徽章 | ACHIEVEMENTS
                </h3>
                <div className="text-xs font-mono text-[var(--end-text-dim)]">
                    COLLECTED: <span className="text-[var(--end-yellow)]">{unlockedCount}</span>/{ACHIEVEMENTS.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-[var(--end-surface-hover)] mb-6 relative overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-[var(--end-yellow)] transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = achievement.condition(userData, uploadCount, projectCount);
                    
                    return (
                        <div 
                            key={achievement.id}
                            className={`
                                relative p-4 border rounded-lg flex flex-col items-center text-center gap-3 transition-all duration-300 group
                                ${isUnlocked 
                                    ? "bg-[var(--end-surface-hover)] border-[var(--end-yellow)]/30 hover:border-[var(--end-yellow)]" 
                                    : "bg-black/20 border-[var(--end-border)] opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                }
                            `}
                        >
                            {/* Icon Container */}
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 relative
                                ${isUnlocked ? "text-[var(--end-yellow)] bg-[var(--end-yellow)]/10" : "text-[var(--end-text-dim)] bg-white/5"}
                            `}>
                                <FontAwesomeIcon icon={achievement.icon} />
                                
                                {!isUnlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                                        <FontAwesomeIcon icon={faLock} className="text-[10px] text-white/50" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className={`text-[10px] font-bold ${isUnlocked ? "text-[var(--end-text-main)]" : "text-[var(--end-text-dim)]"}`}>
                                    {achievement.title}
                                </div>
                                <div className="text-[9px] text-[var(--end-text-dim)] leading-tight hidden group-hover:block absolute top-full left-0 right-0 bg-black/90 p-2 rounded z-10 border border-[var(--end-border)]">
                                    {achievement.description}
                                </div>
                            </div>

                            {/* Status Indicator */}
                            {isUnlocked && (
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--end-yellow)] shadow-[0_0_5px_var(--end-yellow)] animate-pulse" />
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
