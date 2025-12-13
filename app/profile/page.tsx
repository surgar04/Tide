"use client";

"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { faUser, faIdCard, faLayerGroup, faClock, faCheckCircle, faTerminal, faShieldHalved, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Activity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}

interface UserData {
  joinDate: string | null;
  totalTime: number;
  avatar: string | null;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [uploadCount, setUploadCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch User Data
    fetch("/api/user")
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(console.error);

    // Fetch Activities
    fetch("/api/activity")
      .then(res => res.json())
      .then(data => setActivities(data.activities))
      .catch(console.error);

    // Fetch GitHub Resources for stats
    fetch("/api/github/resources?type=all")
      .then(res => res.json())
      .then(data => {
         if (data.resources) {
            setUploadCount(data.resources.length);
            // Count unique projects based on path logic or just use separate call
            // For now, let's call projects type
            fetch("/api/github/resources?type=projects")
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
        // Optimistic update
        setUserData(prev => prev ? { ...prev, avatar: base64 } : null);
        
        fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "update_avatar", avatar: base64 }),
        });
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
    "LEVEL_5_ACCESS", "SYSTEM_ADMIN", "TACTICAL_COMMAND", "RESOURCE_MGMT", "ARCHIVE_EDITOR"
  ];

  if (!userData) return null; // Or loading spinner

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="个人主页 | PROFILE" description="查看个人信息与成就" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="col-span-1"
        >
          <div className="end-card p-6 h-full flex flex-col items-center text-center space-y-6">
            <div className="end-corner-tl" />
            <div className="end-corner-br" />
            
            <div className="relative w-32 h-32 mt-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <div className="absolute inset-0 border-2 border-[var(--end-yellow)] rounded-full animate-[spin_10s_linear_infinite] opacity-50 border-dashed pointer-events-none" />
              <div className="absolute inset-2 bg-[var(--end-surface-hover)] rounded-full flex items-center justify-center border border-[var(--end-border)] overflow-hidden">
                 {userData.avatar ? (
                   <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <FontAwesomeIcon icon={faUser} className="text-5xl text-[var(--end-text-dim)]" />
                 )}
              </div>
              
              {/* Overlay for upload hint */}
              <div className="absolute inset-2 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FontAwesomeIcon icon={faUpload} className="text-[var(--end-yellow)]" />
              </div>

              <div className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--end-yellow)] rounded-full flex items-center justify-center border-2 border-[var(--end-surface)] z-10 pointer-events-none">
                 <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--end-text-main)]">管理员 | ADMINISTRATOR</h2>
              <p className="text-[var(--end-text-sub)] font-mono text-sm">ID: END-001</p>
              <div className="inline-flex items-center px-3 py-1 bg-[var(--end-yellow)]/10 text-[var(--end-yellow)] border border-[var(--end-yellow)]/30 rounded text-xs font-bold tracking-wider">
                <FontAwesomeIcon icon={faShieldHalved} className="mr-2" />
                权限等级 5
              </div>
            </div>

            <div className="w-full h-px bg-[var(--end-border)]" />

            <div className="w-full space-y-4 text-left">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--end-text-dim)]">所属部门 | Department</span>
                <span className="font-medium text-[var(--end-text-main)]">开发部 | Development</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--end-text-dim)]">入职日期 | Join Date</span>
                <span className="font-medium text-[var(--end-text-main)]">
                  {userData.joinDate ? formatDate(userData.joinDate) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--end-text-dim)]">所属区域 | Region</span>
                <span className="font-medium text-[var(--end-text-main)]">潮汐中枢 | Tide Hub</span>
              </div>
            </div>
            
            <div className="flex-1" />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-[var(--end-text-main)] text-[var(--end-surface)] font-bold text-sm tracking-widest hover:bg-[var(--end-yellow)] hover:text-black transition-colors clip-path-button"
            >
              更换头像 | CHANGE AVATAR
            </button>
          </div>
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

          {/* Skills/Tags */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="space-y-3"
          >
            <h3 className="text-sm font-bold text-[var(--end-text-sub)] uppercase tracking-wider">访问权限 | ACCESS PRIVILEGES</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-[var(--end-surface-hover)] border border-[var(--end-border)] text-[var(--end-text-sub)] text-xs font-mono hover:border-[var(--end-yellow)] hover:text-[var(--end-text-main)] cursor-default transition-colors">
                  #{skill}
                </span>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
