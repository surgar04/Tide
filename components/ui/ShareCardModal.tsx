"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faShareNodes, faQrcode, faFingerprint, faMicrochip, faShieldHalved, faPen, faCheck } from "@fortawesome/free-solid-svg-icons";
import { calculateLevel } from "@/lib/levelUtils";
import { useRef, useState, useEffect } from "react";

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
            const res = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "update_signature",
                    signature: tempSignature
                })
            });

            if (res.ok) {
                if (onUpdateSignature) {
                    onUpdateSignature(tempSignature);
                }
                setIsEditing(false);
            }
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
                        {/* The Share Card */}
                        <div 
                            ref={cardRef}
                            className="bg-[#1a1a1a] border-2 border-[var(--end-yellow)] relative overflow-hidden text-white"
                            style={{ aspectRatio: "3/5" }}
                        >
                            {/* Background Texture */}
                            <div className="absolute inset-0 opacity-10" 
                                style={{ 
                                    backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", 
                                    backgroundSize: "20px 20px" 
                                }} 
                            />
                            
                            {/* Top Band */}
                            <div className="h-24 bg-[var(--end-yellow)] relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000_0,#000_10px,transparent_10px,transparent_20px)]" />
                                <div className="absolute bottom-2 right-4 text-black font-bold text-4xl tracking-tighter opacity-50">
                                    TIDE OA
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 relative">
                                {/* Avatar */}
                                <div className="absolute -top-16 left-8 w-24 h-24 bg-[#1a1a1a] p-1 border-2 border-[var(--end-yellow)] rounded-lg">
                                    <img 
                                        src={userData.avatar} 
                                        className="w-full h-full object-cover grayscale contrast-125" 
                                        alt="Avatar"
                                    />
                                </div>

                                <div className="mt-10 space-y-6">
                                    {/* Header Info */}
                                    <div>
                                        <h2 className="text-3xl font-bold uppercase tracking-wide text-white mb-1">
                                            {userData.username}
                                        </h2>
                                        <div className="flex items-center gap-2 text-[var(--end-yellow)] text-xs font-mono">
                                            <FontAwesomeIcon icon={faShieldHalved} />
                                            <span>LEVEL {level} OPERATOR</span>
                                            <span className="w-px h-3 bg-[var(--end-yellow)]/50 mx-1" />
                                            <span>ID: {userData.email?.split('@')[0].toUpperCase() || 'UNKNOWN'}</span>
                                        </div>
                                    </div>

                                    {/* Signature Box */}
                                    <div className="border border-[var(--end-text-dim)]/30 bg-white/5 p-4 relative group">
                                        <FontAwesomeIcon icon={faMicrochip} className="absolute top-2 right-2 text-[var(--end-text-dim)] opacity-20 text-2xl" />
                                        
                                        {isEditing ? (
                                            <div className="flex gap-2 items-center">
                                                <input 
                                                    type="text" 
                                                    value={tempSignature}
                                                    onChange={(e) => setTempSignature(e.target.value)}
                                                    className="w-full bg-black/50 border-b border-[var(--end-yellow)] text-white font-mono text-sm focus:outline-none px-1 py-1"
                                                    autoFocus
                                                    placeholder="Enter your signature..."
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
                                            <>
                                                <p className="text-sm font-mono text-[var(--end-text-dim)] italic leading-relaxed pr-6 break-words">
                                                    "{userData.signature || "System User"}"
                                                </p>
                                                <button 
                                                    onClick={() => setIsEditing(true)}
                                                    className="absolute bottom-2 right-2 text-[var(--end-text-dim)] opacity-0 group-hover:opacity-100 hover:text-[var(--end-yellow)] transition-all duration-200"
                                                    title="Edit Signature"
                                                >
                                                    <FontAwesomeIcon icon={faPen} className="text-xs" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-[var(--end-text-dim)] uppercase tracking-wider">Join Date</div>
                                            <div className="font-mono text-sm">
                                                {new Date(userData.joinDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-[var(--end-text-dim)] uppercase tracking-wider">Online Time</div>
                                            <div className="font-mono text-sm">
                                                {Math.floor(userData.totalTime / 3600)}H {Math.floor((userData.totalTime % 3600) / 60)}M
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-[var(--end-text-dim)] uppercase tracking-wider">Contribution</div>
                                            <div className="font-mono text-sm">
                                                {stats.uploads} Resources
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-[var(--end-text-dim)] uppercase tracking-wider">Projects</div>
                                            <div className="font-mono text-sm">
                                                {stats.projects} Managed
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer / QR */}
                                    <div className="pt-6 border-t border-[var(--end-text-dim)]/20 flex justify-between items-end">
                                        <div>
                                            <div className="text-[var(--end-yellow)] font-bold text-lg tracking-tighter">END-FIELD</div>
                                            <div className="text-[9px] text-[var(--end-text-dim)] uppercase">Authorized Personnel Only</div>
                                        </div>
                                        <div className="w-16 h-16 bg-white p-1">
                                            <div className="w-full h-full border border-black flex items-center justify-center">
                                                <FontAwesomeIcon icon={faQrcode} className="text-3xl text-black" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Decorative Fingerprint */}
                                <FontAwesomeIcon 
                                    icon={faFingerprint} 
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[100px] text-[var(--end-yellow)] opacity-5 pointer-events-none" 
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex justify-center gap-4">
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
