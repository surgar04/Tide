import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLayerGroup, 
  faUserGroup, 
  faMap, 
  faBookOpen, 
  faBook, 
  faTimes, 
  faArrowRight,
  faDatabase
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULES = [
  {
    icon: faLayerGroup,
    title: "资源库 | RESOURCE DB",
    desc: "全方位的游戏资产管理系统。支持模型、纹理、音频等多类型文件的版本控制、预览与检索。集成 GitHub 仓库，实现云端同步。"
  },
  {
    icon: faUserGroup,
    title: "角色管理 | OPERATORS",
    desc: "角色档案与权限管理中心。记录干员详细数值、背景故事及关系图谱。支持势力划分与权限等级配置。"
  },
  {
    icon: faMap,
    title: "地理系统 | GEO SYSTEM",
    desc: "交互式游戏地图编辑器。支持 2D/3D 视图切换，兴趣点标记，区域划分及快速旅行节点管理。"
  },
  {
    icon: faBookOpen,
    title: "剧情档案 | ARCHIVES",
    desc: "非线性叙事流程编辑器。兼容 Twine 格式，可视化管理任务分支、对话树及剧情节点。"
  },
  {
    icon: faBook,
    title: "百科资料 | WIKI BASE",
    desc: "游戏世界观设定集。收录术语表、时间线及势力档案，构建完整的游戏知识体系。"
  },
  {
    icon: faDatabase,
    title: "数据中心 | DATA CENTER",
    desc: "核心数据分析模块。实时监控服务器状态，分析玩家行为数据，提供决策支持（建设中）。"
  }
];

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [activeStep, setActiveStep] = useState(0);

  // Reset step when opened
  useEffect(() => {
    if (isOpen) setActiveStep(0);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-[var(--end-surface)] border border-[var(--end-border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Decor Lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--end-yellow)]" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--end-yellow)]/5 rounded-tl-full pointer-events-none" />

            {/* Header */}
            <div className="p-8 pb-4 border-b border-[var(--end-border)] flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[var(--end-yellow)] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">
                        SYSTEM GUIDE
                    </span>
                    <span className="text-[var(--end-text-dim)] text-[10px] font-mono tracking-widest">
                        // V1.0.0
                    </span>
                </div>
                <h2 className="text-3xl font-bold text-[var(--end-text-main)] uppercase tracking-tight">
                  TIDE GAME OA 使用指南
                </h2>
                <p className="text-[var(--end-text-sub)] font-mono text-sm mt-1 tracking-wider">
                  INSTRUCTIONS FOR USE
                </p>
              </div>
              
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-black hover:bg-[var(--end-yellow)] transition-all border border-transparent hover:border-[var(--end-yellow)]"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-[var(--end-text-sub)] text-sm leading-relaxed border-l-2 border-[var(--end-yellow)] pl-4">
                  欢迎使用 <strong className="text-[var(--end-text-main)]">Tide Game OA</strong> —— 专为游戏开发团队打造的一站式协作管理平台。
                  本系统集成了资源管理、剧情编排、关卡设计与数据分析等核心功能，旨在提升团队协作效率，规范开发流程。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map((mod, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 border border-[var(--end-border)] bg-black/20 hover:bg-[var(--end-surface-hover)] hover:border-[var(--end-yellow)] transition-colors group relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-10 h-10 flex-shrink-0 bg-[var(--end-yellow)]/10 text-[var(--end-yellow)] flex items-center justify-center rounded border border-[var(--end-yellow)]/20 group-hover:bg-[var(--end-yellow)] group-hover:text-black transition-colors">
                        <FontAwesomeIcon icon={mod.icon} className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--end-text-main)] text-sm uppercase tracking-wide mb-1 group-hover:text-[var(--end-yellow)] transition-colors">
                          {mod.title}
                        </h3>
                        <p className="text-[var(--end-text-dim)] text-xs leading-relaxed">
                          {mod.desc}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                         <FontAwesomeIcon icon={mod.icon} className="text-6xl" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--end-border)] bg-black/40 flex justify-between items-center">
              <div className="text-[10px] text-[var(--end-text-dim)] font-mono">
                © 2025 TIDE GAME OA. AUTHORIZED ACCESS ONLY.
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2 bg-[var(--end-yellow)] hover:bg-[#e5b300] text-black font-bold text-sm uppercase tracking-wider transition-all active:scale-95 clip-path-button"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)" }}
              >
                开始使用
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
