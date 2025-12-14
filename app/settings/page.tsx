"use client";

"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { faGear, faDesktop, faUserShield, faCircleInfo, faCheck, faChevronRight, faGlobe, faMicrochip, faDownload, faSpinner, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/context";

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
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-[var(--end-surface-hover)] border border-[var(--end-border)] p-4 rounded-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-[var(--end-yellow)] rounded-full flex items-center justify-center font-bold text-xl text-black overflow-hidden">
          {user?.avatar ? (
             <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
             (user?.username?.[0] || "A").toUpperCase()
          )}
        </div>
        <div>
          <div className="font-bold">{user?.username || "Administrator"}</div>
          <div className="text-sm text-[var(--end-text-dim)]">{user?.email || "admin@tideoa.com"}</div>
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
  const [systemInfo, setSystemInfo] = useState({ version: "Loading...", nextVersion: "..." });
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'updating' | 'success' | 'error'>('idle');
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    // Initial version fetch
    // Use userClient or conditional logic if this API is critical.
    // For system updates, we wrap in try-catch to avoid breaking the page if API fails.
    const checkVersion = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/system/update/check");
            if (res.ok) {
                const data = await res.json();
                setSystemInfo({ version: data.currentVersion, nextVersion: "16.0.8" });
            } else {
                setSystemInfo({ version: "1.0.0", nextVersion: "16.0.8" });
            }
        } catch (err) {
            console.warn("System version check failed", err);
            setSystemInfo({ version: "1.0.0", nextVersion: "16.0.8" });
        }
    };
    checkVersion();
  }, []);

  const checkForUpdates = async () => {
    setUpdateStatus('checking');
    try {
      // Check if API is available.
      const res = await fetch("http://localhost:8000/api/system/update/check");
      if (!res.ok) throw new Error("API unavailable");
      const data = await res.json();
      
      if (data.hasUpdate) {
        setLatestVersion(data.latestVersion);
        setUpdateStatus('available');
        setUpdateMessage(`New version ${data.latestVersion} available!`);
      } else {
        setUpdateStatus('idle');
        setUpdateMessage("System is up to date.");
        setTimeout(() => setUpdateMessage(""), 3000);
      }
    } catch (error) {
      setUpdateStatus('idle'); // Just reset to idle instead of error
      setUpdateMessage("Update check unavailable.");
      setTimeout(() => setUpdateMessage(""), 3000);
    }
  };

  const performUpdate = async () => {
    setUpdateStatus('updating');
    try {
      const res = await fetch("http://localhost:8000/api/system/update/perform", { method: 'POST' });
      if (!res.ok) throw new Error("API unavailable");
      const data = await res.json();
      
      if (data.success) {
        setUpdateStatus('success');
        setUpdateMessage(data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setUpdateStatus('error');
      setUpdateMessage(error.message || "Update failed.");
    }
  };

  return (
    <div className="space-y-8 text-center py-12">
      <div className="w-24 h-24 bg-[var(--end-text-main)] mx-auto rounded-full flex items-center justify-center relative overflow-hidden">
         <img 
            src="/1.webp" 
            alt="System Logo" 
            className="w-full h-full object-cover animate-[spin_20s_linear_infinite]" 
         />
         {updateStatus === 'available' && (
           <span className="absolute top-0 right-0 w-4 h-4 bg-[var(--end-yellow)] rounded-full animate-ping z-10"></span>
         )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold tracking-tight">TIDE GAME OA</h3>
        <p className="text-[var(--end-text-dim)] font-mono text-sm mt-2">
            Version {systemInfo.version} (Beta)
            {latestVersion && updateStatus === 'available' && <span className="text-[var(--end-yellow)] ml-2">→ {latestVersion}</span>}
        </p>
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

      {/* Update Controls */}
      <div className="max-w-md mx-auto p-4 border border-[var(--end-border)] bg-[var(--end-surface)] rounded-lg">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold uppercase text-[var(--end-text-sub)]">System Update</span>
            {updateStatus === 'checking' && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[var(--end-yellow)]" />}
        </div>
        
        <div className="text-sm mb-4 min-h-[20px] text-[var(--end-text-dim)]">
            {updateMessage || "Check for the latest system updates."}
        </div>

        {updateStatus === 'available' ? (
            <button 
                onClick={performUpdate}
                className="w-full bg-[var(--end-yellow)] text-black font-bold py-2 rounded hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
                <FontAwesomeIcon icon={faDownload} />
                INSTALL UPDATE
            </button>
        ) : updateStatus === 'updating' ? (
             <div className="w-full bg-white/10 text-white font-bold py-2 rounded flex items-center justify-center gap-2 cursor-wait">
                <FontAwesomeIcon icon={faRotate} className="animate-spin" />
                UPDATING...
            </div>
        ) : updateStatus === 'success' ? (
            <div className="w-full bg-green-500/20 text-green-400 font-bold py-2 rounded border border-green-500/50">
                UPDATE COMPLETE
            </div>
        ) : (
            <button 
                onClick={checkForUpdates}
                disabled={updateStatus === 'checking'}
                className="w-full border border-[var(--end-border)] hover:bg-white/5 text-[var(--end-text-main)] font-bold py-2 rounded transition-all disabled:opacity-50"
            >
                CHECK FOR UPDATES
            </button>
        )}
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
