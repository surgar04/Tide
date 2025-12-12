"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChartPie, 
  faLayerGroup, 
  faUserGroup, 
  faMap, 
  faBookOpen, 
  faBell, 
  faUser, 
  faGear, 
  faBars, 
  faXmark 
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { name: "仪表盘", href: "/", icon: faChartPie },
  { name: "资源库", href: "/resources", icon: faLayerGroup },
  { name: "角色管理", href: "/roles", icon: faUserGroup },
  { name: "世界地图", href: "/map", icon: faMap },
  { name: "剧情模式", href: "/story", icon: faBookOpen },
];

const bottomItems = [
  { name: "通知中心", href: "/notifications", icon: faBell },
  { name: "个人主页", href: "/profile", icon: faUser },
  { name: "系统设置", href: "/settings", icon: faGear },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white/10 backdrop-blur-md border border-white/20 md:hidden text-foreground"
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="w-6 h-6" />
      </button>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col py-6 px-4 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-2 mb-10 mt-12 md:mt-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center shadow-lg shadow-blue-500/30">
             <span className="text-slate-900 font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            TideOA
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group font-medium",
                  isActive 
                    ? "text-white shadow-md shadow-blue-900/20" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 mt-6 border-t border-slate-800 space-y-2">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-slate-400 hover:text-white hover:bg-slate-800",
                  isActive && "bg-slate-800 text-white"
                )}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
