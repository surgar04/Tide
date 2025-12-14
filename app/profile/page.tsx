"use client";

"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { faUser, faIdCard, faLayerGroup, faClock, faCheckCircle, faTerminal, faShieldHalved, faUpload, faPen, faShareNodes, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/context";
import { calculateLevel, getLevelProgress } from "@/lib/levelUtils";
import { AchievementsSection } from "./components/AchievementsSection";
import { ShareCardModal } from "@/components/ui/ShareCardModal";
import { userClient, UserData, Activity } from "@/lib/data/userClient";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [uploadCount, setUploadCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Signature & Share
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [signatureInput, setSignatureInput] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Fetch User Data
    userClient.getUserData()
      .then(data => {
        setUserData(data);
        setSignatureInput(data.signature || "");
        setActivities(data.activities || []);
      })
      .catch(console.error);
    
    // ... stats fetching ...
    fetch("http://localhost:8000/api/github/resources?type=all")
      .then(res => res.json())
      .then(data => {
        if (data.resources) {
           setUploadCount(data.resources.length);
           fetch("http://localhost:8000/api/github/resources?type=projects")
             .then(res2 => res2.json())
             .then(data2 => {
                if (data2.projects) setProjectCount(data2.projects.length);
             })
             .catch(() => setProjectCount(0));
        }
      })
      .catch(console.error);
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        // Optimistic update for local state
        setUserData(prev => prev ? { ...prev, avatar: base64 } : null);
        
        // Update Auth Context (Session/LocalStorage)
        updateProfile({ avatar: base64 });
        
        // Update Server/Data
        userClient.updateAvatar(base64).catch(console.error);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string, includeYear = true) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return includeYear 
      ? `${year}-${month}-${day} ${hours}:${minutes}`
      : `${month}-${day} ${hours}:${minutes}`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const stats = [
    { label: "上传次数 | UPLOAD_COUNT", value: uploadCount.toString(), icon: faCheckCircle },
    { label: "项目管理 | PROJECTS_MANAGED", value: projectCount.toString(), icon: faLayerGroup },
    { label: "工时统计 | HOURS_LOGGED", value: userData ? formatTime(userData.totalTime) : "...", icon: faClock },
  ];

  const skills = [
    `LEVEL_${userData ? calculateLevel(userData.totalTime) : 1}_ACCESS`, 
    "SYSTEM_ADMIN", 
    "TACTICAL_COMMAND", 
    "RESOURCE_MGMT", 
    "ARCHIVE_EDITOR"
  ];

  if (!userData) return null; // Or loading spinner

  const currentLevel = calculateLevel(userData.totalTime);
  const progress = getLevelProgress(userData.totalTime);

  const handleUpdateSignature = (newSignature: string) => {
      setUserData(prev => prev ? { ...prev, signature: newSignature } : null);
      setSignatureInput(newSignature);
  };

  const saveSignature = async () => {
      try {
          await userClient.updateSignature(signatureInput);
          handleUpdateSignature(signatureInput);
          setIsEditingSignature(false);
      } catch (error) {
          console.error(error);
      }
  };

  return (
    <div className="space-y-8 pb-12">
      <ShareCardModal 
          isOpen={showShareModal} 
          onClose={() => setShowShareModal(false)} 
          userData={userData} 
          stats={{ uploads: uploadCount, projects: projectCount }}
          onUpdateSignature={handleUpdateSignature}
      />
      <PageHeader title="个人主页 | PROFILE" description="查看个人信息与成就" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="lg:col-span-1 space-y-6"
        >
          {/* ID Card */}
          <div className="bg-[var(--end-surface)] border border-[var(--end-border)] rounded-lg overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--end-yellow)]" />
              
              <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full border-2 border-[var(--end-yellow)] p-1 mb-4 relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                          {userData.avatar ? (
                             <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[var(--end-yellow)]">
                                {(userData.username?.[0] || "A").toUpperCase()}
                             </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-xs text-white">Change</span>
                          </div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--end-surface)] border border-[var(--end-yellow)] rounded-full flex items-center justify-center text-[var(--end-yellow)] text-xs">
                         {currentLevel}
                      </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />

                  <h2 className="text-2xl font-bold text-[var(--end-text-main)] mb-1">{userData.username}</h2>
                  <p className="text-sm text-[var(--end-text-dim)] font-mono mb-4">{userData.email}</p>
                  
                  <div className="flex items-center gap-2 text-[var(--end-yellow)] bg-[var(--end-yellow)]/10 px-3 py-1 rounded border border-[var(--end-yellow)]/20">
                      <FontAwesomeIcon icon={faShieldHalved} />
                      <span className="text-xs font-bold tracking-widest">LEVEL {currentLevel} OPERATOR</span>
                  </div>

                  {/* Signature Section */}
                  <div className="w-full mt-6 mb-2 px-4">
                      {isEditingSignature ? (
                          <div className="flex items-center gap-2">
                              <input 
                                  type="text" 
                                  value={signatureInput}
                                  onChange={(e) => setSignatureInput(e.target.value)}
                                  className="flex-1 bg-black/20 border-b border-[var(--end-yellow)] text-center text-sm font-mono text-[var(--end-text-main)] focus:outline-none py-1"
                                  autoFocus
                                  placeholder="Set signature..."
                                  maxLength={50}
                              />
                              <button 
                                  onClick={saveSignature}
                                  className="text-[var(--end-yellow)] hover:text-white transition-colors"
                              >
                                  <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                          </div>
                      ) : (
                          <div className="relative group min-h-[24px] flex items-center justify-center">
                              <p className="text-sm text-[var(--end-text-dim)] font-mono italic px-6 break-all">
                                  "{userData.signature || "No signature set"}"
                              </p>
                              <button 
                                  onClick={() => setIsEditingSignature(true)}
                                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--end-text-dim)] opacity-0 group-hover:opacity-100 hover:text-[var(--end-yellow)] transition-all"
                              >
                                  <FontAwesomeIcon icon={faPen} className="text-xs" />
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Share Button */}
                  <button 
                      onClick={() => setShowShareModal(true)}
                      className="mt-2 text-xs text-[var(--end-yellow)] hover:text-white border border-[var(--end-yellow)]/30 hover:border-[var(--end-yellow)] px-4 py-1.5 rounded-full transition-all flex items-center gap-2"
                  >
                      <FontAwesomeIcon icon={faShareNodes} />
                      分 享
                  </button>

                  {/* Level Progress */}
                  <div className="w-full mt-6 space-y-2">
                      <div className="flex justify-between text-[10px] text-[var(--end-text-dim)] font-mono uppercase">
                          <span>Progress to Level {currentLevel + 1}</span>
                          <span>{Math.floor(progress.percentage)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--end-surface-hover)] rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-[var(--end-yellow)] transition-all duration-1000"
                             style={{ width: `${progress.percentage}%` }} 
                          />
                      </div>
                      <div className="text-[10px] text-[var(--end-text-dim)] text-right font-mono">
                          {progress.remaining > 0 ? `${formatTime(progress.remaining)} remaining` : 'MAX LEVEL'}
                      </div>
                  </div>
              </div>
          </div>

          {/* Skills/Tags (Moved to Left Column) */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="bg-[var(--end-surface)] border border-[var(--end-border)] rounded-lg p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-20">
                <FontAwesomeIcon icon={faShieldHalved} className="text-4xl text-[var(--end-text-dim)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--end-text-sub)] uppercase tracking-wider mb-4 border-b border-[var(--end-border)] pb-2">
                访问权限 | ACCESS PRIVILEGES
            </h3>
            <div className="flex flex-wrap gap-2 relative z-10">
              {skills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-[var(--end-surface-hover)] border border-[var(--end-border)] text-[var(--end-text-sub)] text-xs font-mono hover:border-[var(--end-yellow)] hover:text-[var(--end-text-main)] cursor-default transition-colors">
                  #{skill}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Content */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[var(--end-surface)] border border-[var(--end-border)] p-4 relative group hover:border-[var(--end-yellow)] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[var(--end-text-dim)] text-xs font-mono">{stat.label}</span>
                  <FontAwesomeIcon icon={stat.icon} className="text-[var(--end-yellow)] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-2xl font-bold text-[var(--end-text-main)]">{stat.value}</div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--end-yellow)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </motion.div>
            ))}
          </div>

          {/* Achievements Section */}
          <AchievementsSection 
              userData={userData} 
              uploadCount={uploadCount} 
              projectCount={projectCount} 
          />

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="end-card p-6"
          >
             <div className="end-corner-tl" />
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
               <FontAwesomeIcon icon={faTerminal} className="text-[var(--end-yellow)]" />
               近期活动日志 | RECENT_ACTIVITY_LOG
             </h3>
             <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
               {activities.length === 0 ? (
                 <div className="text-[var(--end-text-dim)] text-sm italic">暂无活动记录 | No recent activities</div>
               ) : (
                 activities.map((activity, i) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-[var(--end-border)] last:border-0 last:pb-0 group">
                       <div className="text-[var(--end-text-dim)] font-mono text-xs w-24 pt-1 opacity-70 group-hover:text-[var(--end-yellow)] transition-colors">
                         {formatDate(activity.timestamp, false)}
                       </div>
                       <div>
                        <div className="text-[var(--end-text-main)] font-medium text-sm group-hover:text-[var(--end-yellow-dim)] transition-colors">
                          {activity.action}
                        </div>
                        <div className="text-[var(--end-text-sub)] text-xs">
                          {activity.target}
                        </div>
                      </div>
                   </div>
                 ))
               )}
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
