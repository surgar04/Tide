"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHouse,
  faLayerGroup, 
  faUserGroup, 
  faMap, 
  faBookOpen, 
  faBell, 
  faUser, 
  faGear,
  faTerminal
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "首页", href: "/", icon: faHouse, label: "HOME" },
  { name: "资源库", href: "/resources", icon: faLayerGroup, label: "RESOURCES" },
  { name: "角色", href: "/roles", icon: faUserGroup, label: "OPERATORS" },
  { name: "地图", href: "/map", icon: faMap, label: "MAP" },
  { name: "剧情", href: "/story", icon: faBookOpen, label: "ARCHIVES" },
];

const rightItems = [
  { name: "通知", href: "/notifications", icon: faBell, label: "NOTIFICATIONS" },
  { name: "个人", href: "/profile", icon: faUser, label: "PROFILE" },
  { name: "系统", href: "/settings", icon: faGear, label: "SYSTEM" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6 pointer-events-none">
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="pointer-events-auto flex items-stretch bg-[var(--end-surface)]/90 backdrop-blur-md border border-[var(--end-border)] clip-path-navbar"
        style={{
            clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)"
        }}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-3 border-r border-[var(--end-border)] bg-[var(--end-surface-hover)]">
          <div className="w-8 h-8 flex items-center justify-center text-[var(--end-yellow)] border border-[var(--end-yellow)]">
            <FontAwesomeIcon icon={faTerminal} className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[var(--end-text-main)] text-lg leading-none tracking-tighter">TIDE</span>
            <span className="text-[10px] text-[var(--end-text-sub)] tracking-[0.2em] font-mono">GAME OA</span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex items-center px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col justify-center px-6 h-full transition-all duration-300 group border-b-2 border-transparent hover:bg-black/5",
                  isActive 
                    ? "border-[var(--end-yellow)]" 
                    : "hover:border-[var(--end-text-sub)]"
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn(
                        "text-xs font-bold font-mono tracking-widest transition-colors",
                        isActive ? "text-[var(--end-yellow-dim)]" : "text-[var(--end-text-sub)] group-hover:text-[var(--end-text-main)]"
                    )}>
                        {item.name}
                    </span>
                </div>
                <span className={cn(
                    "text-[10px] text-[var(--end-text-dim)] font-medium transition-colors",
                    isActive && "text-[var(--end-text-main)]"
                )}>
                    // {item.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                    <motion.div 
                        layoutId="navbar-glow"
                        className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-[var(--end-yellow)]/20 to-transparent pointer-events-none"
                    />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 px-6 border-l border-[var(--end-border)] bg-[var(--end-surface-hover)]">
          {rightItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-8 h-8 flex items-center justify-center border transition-all duration-200",
                  isActive 
                    ? "border-[var(--end-yellow)] text-[var(--end-yellow)] bg-[var(--end-yellow)]/10" 
                    : "border-[var(--end-border)] text-[var(--end-text-sub)] hover:border-[var(--end-text-main)] hover:text-[var(--end-text-main)]"
                )}
                title={`${item.name} | ${item.label}`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-3.5 h-3.5" />
              </Link>
            );
          })}
          
          {/* Status Indicator */}
          <div className="flex flex-col items-end gap-0.5 ml-2">
            <div className="flex gap-1">
                <span className="w-1 h-1 bg-[var(--end-yellow)] rounded-full animate-[blink_2s_infinite]" />
                <span className="w-1 h-1 bg-[var(--end-yellow)] rounded-full animate-[blink_2s_infinite_0.2s]" />
                <span className="w-1 h-1 bg-[var(--end-yellow)] rounded-full animate-[blink_2s_infinite_0.4s]" />
            </div>
            <span className="text-[8px] font-mono text-[var(--end-yellow)]">在线 | ONLINE</span>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
