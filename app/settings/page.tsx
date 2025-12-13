"use client";

"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { faGear, faDesktop, faUserShield, faCircleInfo, faCheck, faChevronRight, faGlobe, faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const { t } = useI18n();

  const SECTIONS = [
    { id: "general", label: t("settings.general"), icon: faGear, description: "语言与区域设置" },
    { id: "display", label: t("settings.display"), icon: faDesktop, description: "主题与界面显示" },
    { id: "account", label: t("settings.account"), icon: faUserShield, description: "用户账户安全" },
    { id: "about", label: t("settings.about"), icon: faCircleInfo, description: "系统版本信息" },
  ];

  return (
    <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-2">
           {SECTIONS.map((section) => (
             <button
               key={section.id}
               onClick={() => setActiveSection(section.id)}
               className={cn(
                 "w-full text-left p-4 flex items-center gap-4 border transition-all duration-300 group relative overflow-hidden",
                 activeSection === section.id 
                   ? "bg-[var(--end-surface-hover)] border-[var(--end-yellow)] text-[var(--end-text-main)] shadow-[inset_4px_0_0_var(--end-yellow)]" 
                   : "bg-[var(--end-surface)] border-[var(--end-border)] text-[var(--end-text-dim)] hover:border-[var(--end-text-dim)] hover:text-[var(--end-text-sub)]"
               )}
             >
               <div className={cn(
                 "w-8 h-8 flex items-center justify-center rounded transition-colors",
                 activeSection === section.id ? "bg-[var(--end-yellow)] text-black" : "bg-[var(--end-bg)]"
               )}>
                 <FontAwesomeIcon icon={section.icon} />
               </div>
               <div>
                 <div className="font-bold tracking-wider text-sm">{section.label}</div>
                 <div className="text-[10px] font-mono opacity-70 hidden md:block">{section.description}</div>
               </div>
               
               {/* Active Indicator Arrow */}
               {activeSection === section.id && (
                 <motion.div 
                   layoutId="activeArrow"
                   className="absolute right-4 text-[var(--end-yellow)]"
                 >
                   <FontAwesomeIcon icon={faChevronRight} />
                 </motion.div>
               )}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 end-card p-0 overflow-hidden flex flex-col">
          <div className="end-corner-tl" />
          <div className="end-corner-br" />
          
          <div className="p-6 border-b border-[var(--end-border)] bg-[var(--end-surface-hover)] flex justify-between items-center">
             <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
               <FontAwesomeIcon icon={SECTIONS.find(s => s.id === activeSection)?.icon || faGear} className="text-[var(--end-yellow)]" />
               {SECTIONS.find(s => s.id === activeSection)?.label}_SETTINGS
             </h2>
             <div className="text-xs font-mono text-[var(--end-text-dim)] animate-pulse">
               {t("settings.status")}
             </div>
          </div>

          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {activeSection === "general" && <GeneralSettings />}
                {activeSection === "display" && <DisplaySettings />}
                {activeSection === "account" && <AccountSettings />}
                {activeSection === "about" && <AboutSettings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for each section
function GeneralSettings() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div className="space-y-6">
      <SettingGroup title={t("settings.general")}>
        <SettingItem label={t("settings.language")} description="选择系统界面的首选语言。">
           <select 
             value={locale}
             onChange={(e) => setLocale(e.target.value as any)}
             className="bg-[var(--end-bg)] border border-[var(--end-border)] p-2 rounded w-48 text-sm focus:border-[var(--end-yellow)] outline-none"
           >
             <option value="en-US">English (US)</option>
             <option value="zh-CN">简体中文</option>
           </select>
        </SettingItem>
        <SettingItem label={t("settings.dateFormat")} description="选择日期的显示格式。">
           <div className="flex gap-2">
             <div className="px-3 py-1 bg-[var(--end-yellow)] text-black text-xs font-bold rounded cursor-pointer">YYYY-MM-DD</div>
             <div className="px-3 py-1 bg-[var(--end-bg)] border border-[var(--end-border)] text-xs rounded cursor-pointer hover:border-[var(--end-text-dim)]">DD/MM/YYYY</div>
           </div>
        </SettingItem>
      </SettingGroup>

      <SettingGroup title="系统偏好">
        <SettingItem label={t("settings.debugMode")} description="启用详细日志记录和开发者工具。" isToggle />
        <SettingItem label={t("settings.autoSave")} description="在编辑器中自动保存更改。" isToggle defaultChecked />
      </SettingGroup>
    </div>
  );
}

function DisplaySettings() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
       <SettingGroup title={t("settings.display")}>
         <SettingItem label={t("settings.uiDensity")} description="调整界面元素的间距密度。">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
               <div className="border border-[var(--end-yellow)] bg-[var(--end-surface)] p-3 rounded cursor-pointer flex items-center justify-between">
                  <span className="text-sm font-bold">{t("settings.comfortable")}</span>
                  <FontAwesomeIcon icon={faCheck} className="text-[var(--end-yellow)]" />
               </div>
               <div className="border border-[var(--end-border)] bg-[var(--end-bg)] p-3 rounded cursor-pointer opacity-70 hover:opacity-100">
                  <span className="text-sm font-bold">{t("settings.compact")}</span>
               </div>
            </div>
         </SettingItem>
         <SettingItem label={t("settings.reduceMotion")} description="减少界面动画效果。" isToggle />
       </SettingGroup>
       
       <SettingGroup title={t("settings.theme")}>
          <div className="grid grid-cols-3 gap-4">
             {['Dark', 'Light', 'System'].map(theme => (
               <div key={theme} className="h-24 border border-[var(--end-border)] bg-[var(--end-bg)] rounded flex items-center justify-center cursor-pointer hover:border-[var(--end-yellow)] transition-colors relative group">
                  <span className="text-sm font-mono">{theme}</span>
                  {theme === 'Dark' && <div className="absolute top-2 right-2 text-[var(--end-yellow)]"><FontAwesomeIcon icon={faCheck} /></div>}
               </div>
             ))}
          </div>
       </SettingGroup>
    </div>
  );
}

function AccountSettings() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="bg-[var(--end-surface-hover)] border border-[var(--end-border)] p-4 rounded-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-[var(--end-yellow)] rounded-full flex items-center justify-center font-bold text-xl text-black">
          A
        </div>
        <div>
          <div className="font-bold">Administrator</div>
          <div className="text-sm text-[var(--end-text-dim)]">admin@tideoa.com</div>
        </div>
        <div className="ml-auto">
          <button className="text-xs border border-[var(--end-border)] px-3 py-1 rounded hover:bg-[var(--end-text-main)] hover:text-white transition-colors">
            Manage
          </button>
        </div>
      </div>

      <SettingGroup title={t("settings.security")}>
        <SettingItem label={t("settings.2fa")} description="使用两步验证保护您的账户安全。" isToggle defaultChecked />
        <SettingItem label={t("settings.sessionTimeout")} description="闲置一段时间后自动登出。">
           <select className="bg-[var(--end-bg)] border border-[var(--end-border)] p-2 rounded text-sm outline-none">
             <option>15 分钟</option>
             <option>30 分钟</option>
             <option>1 小时</option>
           </select>
        </SettingItem>
      </SettingGroup>

      <div className="pt-8 border-t border-[var(--end-border)]">
        <button className="text-red-500 text-sm font-bold hover:underline flex items-center gap-2">
           {t("settings.logoutAll")}
        </button>
      </div>
    </div>
  );
}

function AboutSettings() {
  const { t } = useI18n();
  const [systemInfo, setSystemInfo] = useState({ version: "...", nextVersion: "..." });

  useEffect(() => {
    fetch("/api/system/version")
      .then(res => res.json())
      .then(data => setSystemInfo(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8 text-center py-12">
      <div className="w-24 h-24 bg-[var(--end-text-main)] mx-auto rounded-full flex items-center justify-center">
         <FontAwesomeIcon icon={faGlobe} className="text-4xl text-[var(--end-yellow)] animate-[spin_20s_linear_infinite]" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold tracking-tight">TIDE GAME OA</h3>
        <p className="text-[var(--end-text-dim)] font-mono text-sm mt-2">Version {systemInfo.version} (Beta)</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
        <div className="p-4 border border-[var(--end-border)] bg-[var(--end-surface)] rounded">
          <div className="text-xs text-[var(--end-text-dim)] uppercase">{t("settings.build")}</div>
          <div className="font-mono">{systemInfo.version}</div>
        </div>
        <div className="p-4 border border-[var(--end-border)] bg-[var(--end-surface)] rounded">
          <div className="text-xs text-[var(--end-text-dim)] uppercase">{t("settings.engine")}</div>
          <div className="font-mono">Next.js {systemInfo.nextVersion}</div>
        </div>
      </div>

      <p className="text-xs text-[var(--end-text-dim)] max-w-lg mx-auto leading-relaxed">
        {t("settings.copyright")}
      </p>
    </div>
  );
}

// Helper Components
function SettingGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[var(--end-text-sub)] uppercase tracking-wider border-b border-[var(--end-border)] pb-2">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function SettingItem({ label, description, children, isToggle, defaultChecked }: { 
  label: string, 
  description?: string, 
  children?: React.ReactNode,
  isToggle?: boolean,
  defaultChecked?: boolean
}) {
  const [enabled, setEnabled] = useState(defaultChecked || false);

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="font-medium text-[var(--end-text-main)] text-sm">{label}</div>
        {description && <div className="text-xs text-[var(--end-text-dim)] mt-0.5">{description}</div>}
      </div>
      <div>
        {isToggle ? (
          <button 
            onClick={() => setEnabled(!enabled)}
            className={cn(
              "w-10 h-5 rounded-full relative transition-colors duration-300",
              enabled ? "bg-[var(--end-yellow)]" : "bg-[var(--end-border)]"
            )}
          >
            <div className={cn(
              "absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300",
              enabled ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        ) : children}
      </div>
    </div>
  );
}
