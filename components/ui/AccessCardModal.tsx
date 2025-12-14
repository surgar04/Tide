import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faFingerprint, faIdCard, faTimes, faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { calculateLevel } from "@/lib/levelUtils";
import { userClient } from "@/lib/data/userClient";

interface User {
  username: string;
  email: string;
  avatar: string;
}

interface AccessCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function AccessCardModal({ isOpen, onClose, user }: AccessCardModalProps) {
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (isOpen) {
      // Fetch latest user data to get totalTime for level calculation
      userClient.getUserData()
        .then(data => {
           if (data && typeof data.totalTime === 'number') {
               setLevel(calculateLevel(data.totalTime));
           }
        })
        .catch(err => console.error("Failed to fetch user level", err));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="relative w-[400px] h-[600px] perspective-1000 z-10"
          >
            {/* The Card */}
            <div className="w-full h-full bg-[var(--end-surface)] border border-[var(--end-border)] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col">
              
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[var(--end-yellow)]" />
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-12 h-1 bg-[var(--end-text-dim)]" />
                <div className="w-4 h-1 bg-[var(--end-yellow)]" />
              </div>
              
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--end-yellow)]/5 rounded-tl-full pointer-events-none" />
              <div className="absolute bottom-10 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--end-border)] to-transparent" />

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-[var(--end-text-sub)] hover:text-[var(--end-yellow)] transition-colors z-20"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>

              {/* Header */}
              <div className="p-8 pb-4">
                <div className="flex items-center gap-2 text-[var(--end-yellow)] mb-2">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span className="text-xs font-bold tracking-widest">ACCESS GRANTED</span>
                </div>
                <h2 className="text-3xl font-bold text-[var(--end-text-main)] uppercase tracking-tighter">
                    身份识别卡
                </h2>
                <p className="text-[var(--end-text-dim)] font-mono text-[10px] tracking-widest">
                    IDENTITY CLEARANCE CARD
                </p>
              </div>

              {/* Avatar Section */}
              <div className="px-8 py-4 flex justify-center relative">
                <div className="w-32 h-32 rounded-lg border-2 border-[var(--end-yellow)] p-1 relative group">
                    <div className="w-full h-full overflow-hidden bg-black relative">
                         <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                         {/* Scanner Overlay */}
                         <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,199,0,0.2)_50%,transparent_100%)] bg-[length:100%_200%] animate-[scan_2s_linear_infinite] pointer-events-none" />
                    </div>
                    
                    {/* Corner Markers */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[var(--end-yellow)]" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[var(--end-yellow)]" />
                </div>
              </div>

              {/* Info Grid */}
              <div className="px-8 py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] text-[var(--end-text-dim)] uppercase font-mono tracking-widest block">Operator</label>
                        <div className="text-lg font-bold text-[var(--end-text-main)]">{user.username}</div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-[var(--end-text-dim)] uppercase font-mono tracking-widest block">Clearance</label>
                        <div className="text-lg font-bold text-[var(--end-yellow)] flex items-center gap-2">
                            LEVEL {level}
                            <FontAwesomeIcon icon={faMicrochip} className="text-xs opacity-50" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1 border-t border-[var(--end-border)] pt-4">
                     <label className="text-[9px] text-[var(--end-text-dim)] uppercase font-mono tracking-widest block">Department</label>
                     <div className="text-sm text-[var(--end-text-main)] font-mono">
                        CENTRAL COMMAND / ADMIN
                     </div>
                </div>

                <div className="space-y-1">
                     <label className="text-[9px] text-[var(--end-text-dim)] uppercase font-mono tracking-widest block">ID Signature</label>
                     <div className="text-[10px] text-[var(--end-text-sub)] font-mono break-all leading-tight bg-black/20 p-2 border border-[var(--end-border)] rounded">
                        {user.email.toUpperCase()}
                        <br/>
                        HASH: {Math.random().toString(36).substring(2, 15).toUpperCase()}
                     </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto p-4 bg-black/40 border-t border-[var(--end-border)] flex justify-between items-center relative overflow-hidden">
                 <div className="flex items-center gap-2 text-[var(--end-text-dim)] relative z-10">
                    <FontAwesomeIcon icon={faFingerprint} className="text-2xl opacity-50" />
                    <div className="flex flex-col text-[9px] font-mono leading-none">
                        <span>BIOMETRIC</span>
                        <span>VERIFIED</span>
                    </div>
                 </div>
                 
                 {/* TIDE GAME OA Branding */}
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-30">
                     <div className="text-[10px] font-bold tracking-[0.2em] text-[var(--end-yellow)] whitespace-nowrap animate-pulse">TIDE GAME OA</div>
                     <div className="text-[6px] tracking-[0.5em] text-[var(--end-text-sub)]">SYSTEM V1.0</div>
                 </div>

                 <div className="text-[var(--end-yellow)] font-mono text-xs font-bold animate-pulse relative z-10">
                    SYSTEM ONLINE
                 </div>
              </div>
              
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
