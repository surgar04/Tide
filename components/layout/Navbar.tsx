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
  faTerminal,
  faSignOutAlt,
  faBook
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

const navItems = [
  { name: "首页", href: "/", icon: faHouse, label: "HOME" },
  { name: "资源库", href: "/resources", icon: faLayerGroup, label: "RESOURCES" },
  { name: "角色", href: "/roles", icon: faUserGroup, label: "OPERATORS" },
  { name: "地图", href: "/map", icon: faMap, label: "MAP" },
  { name: "剧情", href: "/story", icon: faBookOpen, label: "ARCHIVES" },
  { name: "百科", href: "/wiki", icon: faBook, label: "WIKI" },
];

const rightItems = [
  { name: "通知", href: "/notifications", icon: faBell, label: "NOTIFICATIONS" },
  { name: "个人", href: "/profile", icon: faUser, label: "PROFILE" },
  { name: "系统", href: "/settings", icon: faGear, label: "SYSTEM" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (pathname === '/login') return null;

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

        {/* Right Nav */}
        <div className="flex items-center border-l border-[var(--end-border)] bg-[var(--end-surface-hover)] px-2">
            {user && (
                <div className="flex items-center gap-3 px-4 border-r border-[var(--end-border)]/50 mr-2">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-[var(--end-text-main)]">{user.username}</span>
                        <span className="text-[10px] text-[var(--end-text-sub)] font-mono">LV.5 ADMIN</span>
                    </div>
                    <div className="w-8 h-8 rounded bg-slate-800 border border-[var(--end-yellow)] overflow-hidden">
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
            )}

            {rightItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="w-10 h-10 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-yellow)] hover:bg-black/5 transition-colors relative group"
                    title={item.name}
                >
                    <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                    <span className="absolute bottom-0 right-0 w-1 h-1 bg-[var(--end-yellow)] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
            ))}
            
            <button 
                onClick={logout}
                className="w-10 h-10 flex items-center justify-center text-[var(--end-text-sub)] hover:text-red-400 hover:bg-black/5 transition-colors relative group ml-1"
                title="退出登录"
            >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
            </button>
        </div>
      </motion.nav>
    </div>
  );
}
