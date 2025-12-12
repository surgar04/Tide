"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_SEQUENCE = [
  "// TERMINAL_ACCESS_GRANTED",
  "Initializing advanced asset management protocols...",
  "Loading core modules... [OK]",
  "Verifying security clearance... [ADMIN]",
  "Optimizing workflow efficiency for game development operations...",
  "System State: ONLINE",
  "Connecting to Tide Game Network...",
  "Established secure connection [TLS_V1.3]"
];

const RANDOM_LOGS = [
  "Packet received from Sector 09",
  "Syncing telemetry data... [100%]",
  "Updating local cache...",
  "Resource integrity check: PASSED",
  "Detected minor fluctuation in Originium levels",
  "Background task: Rendering queue optimized",
  "User activity monitored: ID_9283",
  "Ping: 12ms to Server Alpha",
  "Memory usage: 34% [NOMINAL]",
  "Garbage collection started...",
  "Module [GEO_SYS] heartbeat signal received",
  "Analyzing spectral data...",
  "Encrypted transmission intercepted [IGNORING]",
  "Auto-saving workspace configuration...",
  "Refreshing operator status list",
  "Warning: High latency in sub-grid 4"
];

const MAX_LINES = 8;

export function SystemBootLog() {
  const [lines, setLines] = useState<string[]>([]);
  const bootIndexRef = useRef(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setLines(prev => {
        let newLine = "";
        
        // First play through the boot sequence
        if (bootIndexRef.current < BOOT_SEQUENCE.length) {
            newLine = BOOT_SEQUENCE[bootIndexRef.current];
            bootIndexRef.current++;
        } else {
            // Then loop random logs
            const randomIndex = Math.floor(Math.random() * RANDOM_LOGS.length);
            // Add timestamp
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            newLine = `[${time}] ${RANDOM_LOGS[randomIndex]}`;
        }

        const newLines = [...prev, newLine];
        if (newLines.length > MAX_LINES) {
            return newLines.slice(newLines.length - MAX_LINES);
        }
        return newLines;
      });
    }, 800); // Speed of log updates

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-xs md:text-sm text-[var(--end-text-sub)] w-full max-w-2xl border-l-2 border-[var(--end-yellow)] pl-4 py-2 bg-black/5 backdrop-blur-sm rounded-r-lg shadow-sm overflow-hidden h-[160px] relative">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
      
      <div className="flex flex-col justify-end h-full gap-1 pb-1">
          <AnimatePresence initial={false}>
            {lines.map((line, i) => (
                <motion.div 
                    key={`${i}-${line}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} // Optional: animate out if we were removing from top DOM nodes physically
                    className="break-words"
                >
                    <span className="text-[var(--end-yellow-dim)] mr-2">{">"}</span>
                    {line.startsWith("//") ? (
                        <span className="text-[var(--end-text-dim)] font-bold">{line}</span>
                    ) : (
                        <span>{line}</span>
                    )}
                </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Blinking Cursor at bottom */}
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-4 bg-[var(--end-yellow)] inline-block align-middle mt-1 ml-4"
          />
      </div>
    </div>
  );
}
