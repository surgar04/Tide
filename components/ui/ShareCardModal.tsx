"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faShareNodes, faQrcode, faFingerprint, faMicrochip, faShieldHalved, faPen, faCheck, faFileLines, faDatabase } from "@fortawesome/free-solid-svg-icons";
import { calculateLevel } from "@/lib/levelUtils";
import { useRef, useState, useEffect } from "react";
import { userClient } from "@/lib/data/userClient";

interface ShareCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    userData: any;
    stats: { uploads: number; projects: number };
    onUpdateSignature?: (newSignature: string) => void;
}

export function ShareCardModal({ isOpen, onClose, userData, stats, onUpdateSignature }: ShareCardModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const level = userData ? calculateLevel(userData.totalTime) : 1;
    const [isEditing, setIsEditing] = useState(false);
    const [tempSignature, setTempSignature] = useState("");

    useEffect(() => {
        if (userData?.signature) {
            setTempSignature(userData.signature);
        }
    }, [userData]);

    const handleSaveSignature = async () => {
        try {
            await userClient.updateSignature(tempSignature);
            
            if (onUpdateSignature) {
                onUpdateSignature(tempSignature);
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update signature", error);
        }
    };

    const handleCopy = () => {
        // In a real app, use html2canvas here.
        // For now, just simulate success.
        alert("卡片信息已复制到剪贴板 (模拟) | Card Copied");
    };

    return (
        <AnimatePresence>
            {isOpen && userData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative z-10 max-w-md w-full"
                    >
                        {/* The Share Card - Redesigned to match Identity Card style */}
                        <div 
                            ref={cardRef}
                            className="w-full bg-[var(--end-surface)] border border-[var(--end-border)] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col"
                            style={{ aspectRatio: "3/5" }}
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-[var(--end-yellow)]" />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <div className="w-12 h-1 bg-[var(--end-text-dim)]" />
                                <div className="w-4 h-1 bg-[var(--end-yellow)]" />
                            </div>
                            
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[var(--end-yellow)]/5 rounded-tl-full pointer-events-none" />
                            <div className="absolute bottom-20 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--end-border)] to-transparent" />

                            {/* Header */}
                            <div className="p-8 pb-4 relative z-10">
                                <div className="flex items-center gap-2 text-[var(--end-yellow)] mb-2">
                                    <FontAwesomeIcon icon={faFileLines} />
                                    <span className="text-xs font-bold tracking-widest">PERSONNEL DOSSIER</span>
                                </div>
                                <h2 className="text-3xl font-bold text-[var(--end-text-main)] uppercase tracking-tighter">
                                    档案记录
                                </h2>
                                <p className="text-[var(--end-text-dim)] font-mono text-[10px] tracking-widest">
                                    OPERATOR DATA LOG
                                </p>
                            </div>

                            {/* Content Grid */}
                            <div className="px-8 flex-1 flex flex-col gap-6 relative z-10">
                                
                                {/* User Basic Info & Avatar */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-20 h-20 rounded border border-[var(--end-yellow)] p-0.5 relative shrink-0">
                                        <div className="w-full h-full overflow-hidden bg-black relative">
                                            <img 
                                                src={userData.avatar} 
                                                className="w-full h-full object-cover grayscale contrast-125" 
                                                alt="Avatar"
                                            />
                                            {/* Scanner Overlay */}
                                            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,199,0,0.2)_50%,transparent_100%)] bg-[length:100%_200%] animate-[scan_3s_linear_infinite] pointer-events-none" />
                                        </div>
                                        {/* Corner Markers */}
                                        <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-[var(--end-yellow)]" />
                                        <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-[var(--end-yellow)]" />
                                    </div>
                                    
                                    <div className="flex-1 space-y-1 pt-1">
                                        <div className="text-xl font-bold text-[var(--end-text-main)] uppercase tracking-tight leading-none">
                                            {userData.username}
                                        </div>
                                        <div className="flex items-center gap-2 text-[var(--end-yellow)] text-xs font-mono">
                                            <FontAwesomeIcon icon={faShieldHalved} />
                                            <span>LEVEL {level}</span>
                                        </div>
                                        <div className="text-[9px] text-[var(--end-text-dim)] font-mono break-all leading-tight">
                                            ID: {userData.email?.split('@')[0].toUpperCase() || 'UNKNOWN'}
                                        </div>
                                    </div>
                                </div>

                                {/* Signature Section */}
                                <div className="border-t border-b border-[var(--end-border)] py-4 relative group">
                                    <label className="text-[9px] text-[var(--end-text-dim)] uppercase font-mono tracking-widest block mb-2">
                                        Personal Note
                                    </label>
                                    
                                    {isEditing ? (
                                        <div className="flex gap-2 items-center bg-black/20 p-2 rounded border border-[var(--end-yellow)]/30">
                                            <input 
                                                type="text" 
                                                value={tempSignature}
                                                onChange={(e) => setTempSignature(e.target.value)}
                                                className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                                                autoFocus
                                                placeholder="Enter signature..."
                                                maxLength={50}
                                            />
                                            <button 
                                                onClick={handleSaveSignature}
                                                className="text-[var(--end-yellow)] hover:text-white transition-colors p-1"
                                                title="Save"
                                            >
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative pl-3 border-l-2 border-[var(--end-yellow)]">
                                            <p className="text-sm font-mono text-[var(--end-text-main)] italic leading-relaxed pr-6 break-words opacity-90">
                                                "{userData.signature || "System User"}"
                                            </p>
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="absolute top-0 right-0 text-[var(--end-text-dim)] opacity-0 group-hover:opacity-100 hover:text-[var(--end-yellow)] transition-all duration-200"
                                                title="Edit Signature"
                                            >
                                                <FontAwesomeIcon icon={faPen} className="text-xs" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-[var(--end-text-dim)] uppercase font-mono tracking-widest block">Service Time</label>
                                        <div className="text-sm font-bold text-[var(--end-text-main)] font-mono">
                                            {Math.floor(userData.totalTime / 3600)}H {Math.floor((userData.totalTime % 3600) / 60)}M
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-[var(--end-text-dim)] uppercase font-mono tracking-widest block">Join Date</label>
                                        <div className="text-sm font-bold text-[var(--end-text-main)] font-mono">
                                            {new Date(userData.joinDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-[var(--end-text-dim)] uppercase font-mono tracking-widest block">Contributions</label>
                                        <div className="text-sm font-bold text-[var(--end-text-main)] font-mono flex items-center gap-2">
                                            <FontAwesomeIcon icon={faDatabase} className="text-[var(--end-text-dim)] text-[10px]" />
                                            {stats.uploads} UPLOADS
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-[var(--end-text-dim)] uppercase font-mono tracking-widest block">Projects</label>
                                        <div className="text-sm font-bold text-[var(--end-text-main)] font-mono flex items-center gap-2">
                                            <FontAwesomeIcon icon={faMicrochip} className="text-[var(--end-text-dim)] text-[10px]" />
                                            {stats.projects} MANAGED
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto p-6 flex justify-between items-end relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 text-[var(--end-text-dim)] mb-1">
                                        <FontAwesomeIcon icon={faFingerprint} className="text-xl opacity-50" />
                                        <div className="text-[9px] font-mono leading-none">
                                            DATA VERIFIED<br/>ENCRYPTED
                                        </div>
                                    </div>
                                    <div className="text-[var(--end-yellow)] font-bold text-lg tracking-tighter">
                                        TIDE OA
                                    </div>
                                </div>
                                
                                <div className="w-14 h-14 bg-white p-1">
                                    <div className="w-full h-full border border-black flex items-center justify-center">
                                        <FontAwesomeIcon icon={faQrcode} className="text-2xl text-black" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-center gap-4">
                            <button 
                                onClick={handleCopy}
                                className="px-6 py-2 bg-[var(--end-yellow)] text-black font-bold rounded hover:bg-white transition-colors flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faShareNodes} /> 分享 / 保存
                            </button>
                            <button 
                                onClick={onClose}
                                className="px-6 py-2 bg-transparent border border-white/20 text-white font-bold rounded hover:bg-white/10 transition-colors"
                            >
                                关闭
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
