"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faSearch, faHashtag, faGlobe, faUsers, faClock } from "@fortawesome/free-solid-svg-icons";

export default function WikiPage() {
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
                WIKI DATABASE
              </h1>
              <p className="text-[var(--end-text-sub)] font-mono text-sm tracking-widest">
                游戏百科资料库 // KNOWLEDGE BASE
              </p>
            </div>
            
            {/* Search Bar Placeholder */}
            <div className="relative group w-64">
              <input 
                type="text" 
                placeholder="SEARCH..." 
                className="w-full bg-black/20 border border-[var(--end-border)] text-[var(--end-text-main)] px-4 py-2 text-sm font-mono focus:outline-none focus:border-[var(--end-yellow)] transition-colors"
                disabled
              />
              <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--end-text-dim)]" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--end-surface)] border border-[var(--end-border)] p-4 rounded-lg sticky top-32"
            >
              <h3 className="text-[var(--end-yellow)] font-bold text-xs tracking-widest mb-4 border-b border-[var(--end-border)] pb-2">
                CATEGORIES
              </h3>
              
              <ul className="space-y-1">
                {[
                  { name: "世界观", icon: faGlobe, active: true },
                  { name: "势力档案", icon: faUsers },
                  { name: "时间线", icon: faClock },
                  { name: "术语表", icon: faHashtag },
                  { name: "玩法指南", icon: faBook },
                ].map((item, index) => (
                  <li key={index}>
                    <button 
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                        item.active 
                          ? "text-[var(--end-text-main)] bg-[var(--end-yellow)]/10 border-l-2 border-[var(--end-yellow)]" 
                          : "text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/5 border-l-2 border-transparent"
                      }`}
                    >
                      <FontAwesomeIcon icon={item.icon} className={`w-4 ${item.active ? "text-[var(--end-yellow)]" : "text-[var(--end-text-dim)]"}`} />
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[var(--end-yellow)]/20 to-transparent border-l-4 border-[var(--end-yellow)] p-8 mb-8">
                <h2 className="text-2xl font-bold text-[var(--end-text-main)] mb-2">欢迎来到 Wiki 资料库</h2>
                <p className="text-[var(--end-text-sub)] leading-relaxed max-w-2xl">
                  这里收录了游戏所有的设定资料、背景故事以及详细的数值档案。当前板块正在建设中，更多内容将陆续开放。
                </p>
              </div>

              {/* Recent Updates */}
              <h3 className="flex items-center gap-2 text-[var(--end-text-main)] font-bold mb-6">
                <span className="w-1 h-6 bg-[var(--end-yellow)]"></span>
                最近更新 / RECENT UPDATES
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="group bg-[var(--end-surface)] border border-[var(--end-border)] hover:border-[var(--end-yellow)] transition-colors p-4 cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-mono text-[var(--end-yellow)] border border-[var(--end-yellow)] px-1">NEW</span>
                      <span className="text-[10px] text-[var(--end-text-dim)] font-mono">2024.12.12</span>
                    </div>
                    <h4 className="text-[var(--end-text-main)] font-bold mb-2 group-hover:text-[var(--end-yellow)] transition-colors">
                      {['泰拉大陆编年史 V1.0', '新势力：罗德岛工程部', '源石病病理研究报告', '移动城市结构图解'][i-1]}
                    </h4>
                    <p className="text-xs text-[var(--end-text-sub)] line-clamp-2">
                      更新了关于该条目的详细描述，修正了部分历史数据的错误...
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
