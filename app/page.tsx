"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLayerGroup, 
  faUserGroup, 
  faMap, 
  faBookOpen, 
  faArrowRight,
  faTerminal,
  faDatabase,
  faNetworkWired,
  faGlobe,
  faFileContract
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "01",
    title: "RESOURCE_DB",
    label: "资源管理数据库",
    description: "Asset management system with version control and real-time preview.",
    icon: faDatabase,
    href: "/resources",
  },
  {
    id: "02",
    title: "PERSONNEL",
    label: "人员档案与权限",
    description: "Operator profiles, clearance levels, and relationship mapping.",
    icon: faUserGroup,
    href: "/roles",
  },
  {
    id: "03",
    title: "GEO_SYSTEM",
    label: "地理信息系统",
    description: "Tactical map editing with POI markers and fast-travel nodes.",
    icon: faGlobe,
    href: "/map",
  },
  {
    id: "04",
    title: "ARCHIVES",
    label: "剧情与任务档案",
    description: "Non-linear narrative flowcharts and mission objective tracking.",
    icon: faFileContract,
    href: "/story",
  }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-[80vh] justify-center relative">
      
      {/* Decorative Background Elements for Home */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[-1]">
         <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] border border-[var(--end-border)] opacity-20 rounded-full animate-[spin_60s_linear_infinite]" />
         <div className="absolute top-[20%] right-[10%] w-[280px] h-[280px] border border-[var(--end-yellow)] opacity-10 rounded-full animate-[spin_40s_linear_infinite_reverse]" style={{ borderStyle: 'dashed' }} />
      </div>

      {/* Hero Section */}
      <section className="w-full pt-16 pb-20 flex flex-col items-center text-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="mb-8 relative"
        >
           <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3 mb-4">
                    <span className="h-[1px] w-12 bg-[var(--end-yellow)]"></span>
                    <span className="text-[var(--end-yellow)] font-mono text-xs tracking-[0.3em] uppercase">System Online</span>
                    <span className="h-[1px] w-12 bg-[var(--end-yellow)]"></span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--end-text-main)] mb-2 uppercase">
                    TIDE<br/>
                    <span className="text-[var(--end-text-sub)] text-4xl md:text-6xl">GAME OA</span>
                </h1>
           </div>
        </motion.div>
        
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-[1400px] px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link key={feature.id} href={feature.href} className="block h-full group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--end-surface)] h-full p-6 border border-[var(--end-border)] relative overflow-hidden transition-all duration-300 group-hover:border-[var(--end-yellow)] group-hover:-translate-y-1"
                style={{
                    clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)"
                }}
              >
                {/* Hover Background Effect */}
                <div className="absolute inset-0 bg-[var(--end-yellow)] opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                
                {/* Corner Decoration */}
                <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity z-20">
                    <span className="font-mono text-4xl font-bold text-[var(--end-border)] group-hover:text-[var(--end-yellow)] transition-colors">
                        {feature.id}
                    </span>
                </div>

                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--end-yellow)] opacity-0 group-hover:opacity-100 transition-all duration-200 z-20" />
                <div className="absolute bottom-[20px] right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--end-yellow)] opacity-0 group-hover:opacity-100 transition-all duration-200 z-20" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 flex items-center justify-center mb-6 text-[var(--end-text-sub)] group-hover:text-[var(--end-yellow)] transition-colors">
                    <FontAwesomeIcon icon={feature.icon} className="text-3xl" />
                  </div>
                  
                  <div className="mb-4">
                      <h3 className="text-xl font-bold text-[var(--end-text-main)] mb-1 uppercase tracking-wide group-hover:text-[var(--end-yellow)] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-[var(--end-text-sub)] font-mono uppercase tracking-wider">
                        {feature.label}
                      </p>
                  </div>
                  
                  <p className="text-[var(--end-text-sub)] text-sm leading-relaxed mb-8 flex-grow font-mono opacity-80">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-xs font-bold text-[var(--end-text-sub)] group-hover:text-[var(--end-text-main)] transition-colors gap-2 uppercase tracking-widest mt-auto">
                    <span>Access Module</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 transform group-hover:translate-x-1 transition-transform text-[var(--end-yellow)]" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center border-t border-[var(--end-border)] mt-auto">
        <div className="flex flex-col items-center gap-2">
            <FontAwesomeIcon icon={faTerminal} className="text-[var(--end-text-dim)] w-4 h-4 mb-2" />
            <p className="text-[var(--end-text-dim)] text-[10px] font-mono tracking-widest uppercase">
                © 2025 TIDE GAME OA. All protocols secured.
            </p>
            <p className="text-[var(--end-text-dim)] text-[10px] font-mono">
                SYSTEM_VERSION: 2.0.4-ALPHA
            </p>
        </div>
      </footer>
    </div>
  );
}
