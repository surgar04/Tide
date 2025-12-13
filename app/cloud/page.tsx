"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud, faServer, faDatabase, faNetworkWired } from "@fortawesome/free-solid-svg-icons";

export default function CloudPage() {
  return (
    <div className="min-h-screen pt-24 px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between border-b border-[var(--end-border)] pb-6"
          >
            <div>
              <h1 className="text-4xl font-bold text-[var(--end-text-main)] mb-2 tracking-tight">
                云控中心
              </h1>
              <p className="text-[var(--end-text-sub)] font-mono text-sm tracking-widest">
                分布式计算与资源调度 // CLOUD CONTROL
              </p>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[var(--end-surface)] border border-[var(--end-border)] p-12 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden group"
                >
                    {/* Decor */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--end-yellow)]/50 to-transparent" />
                    <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[var(--end-yellow)]/50 to-transparent" />
                    <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 pointer-events-none">
                        <FontAwesomeIcon icon={faCloud} className="text-9xl" />
                    </div>

                    <div className="w-24 h-24 rounded-full bg-[var(--end-yellow)]/10 border border-[var(--end-yellow)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,200,0,0.1)]">
                        <FontAwesomeIcon icon={faServer} className="text-4xl text-[var(--end-yellow)]" />
                    </div>

                    <h2 className="text-2xl font-bold text-[var(--end-text-main)] mb-2 uppercase tracking-wide">
                        系统连接中...
                    </h2>
                    <p className="text-[var(--end-text-sub)] font-mono text-sm mb-8">
                        ESTABLISHING CONNECTION TO CLOUD SERVERS...
                    </p>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center p-4 bg-black/20 border border-[var(--end-border)] rounded w-32">
                            <FontAwesomeIcon icon={faDatabase} className="text-[var(--end-text-dim)] mb-2" />
                            <span className="text-xs font-bold text-[var(--end-text-sub)]">NODES</span>
                            <span className="text-lg font-mono text-[var(--end-yellow)]">0/0</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-black/20 border border-[var(--end-border)] rounded w-32">
                            <FontAwesomeIcon icon={faNetworkWired} className="text-[var(--end-text-dim)] mb-2" />
                            <span className="text-xs font-bold text-[var(--end-text-sub)]">LATENCY</span>
                            <span className="text-lg font-mono text-[var(--end-yellow)]">-- ms</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
}
