"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { EndfieldLoading } from "@/components/ui/EndfieldLoading";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMagnifyingGlass, 
  faGrip, 
  faList, 
  faDownload, 
  faFileLines, 
  faImage, 
  faMusic, 
  faVideo, 
  faCube, 
  faUpload, 
  faXmark,
  faRotate,
  faCheckCircle,
  faExclamationCircle,
  faCode,
  faGamepad,
  faPen,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

// --- Types ---
interface Resource {
  id: string;
  displayId: string;
  title: string;
  type: string;
  category: string;
  project: string;
  url: string;
  size: string;
  date: string;
  author: string;
  rawPath: string;
}

interface ApiHealth {
  status: "ok" | "error" | "loading";
  limit?: number;
  remaining?: number;
  reset?: number;
}

// --- Constants ---
const UPLOADER_COOKIE_KEY = "GITHUB_UPLOADER";
const CATEGORIES = [
  "全部",
  "概念美术", "3D模型", "贴图材质", "音频音效", "游戏策划", 
  "动画资源", "特效Shader", "脚本代码", "预制体/关卡", "其他"
];

// Map extensions to categories and types
const EXT_MAP: Record<string, { cat: string; type: string }> = {
  // Images
  png: { cat: "概念美术", type: "image" },
  jpg: { cat: "概念美术", type: "image" },
  jpeg: { cat: "概念美术", type: "image" },
  psd: { cat: "概念美术", type: "image" },
  tga: { cat: "贴图材质", type: "image" },
  tiff: { cat: "贴图材质", type: "image" },
  
  // Models
  fbx: { cat: "3D模型", type: "model" },
  obj: { cat: "3D模型", type: "model" },
  blend: { cat: "3D模型", type: "model" },
  gltf: { cat: "3D模型", type: "model" },
  glb: { cat: "3D模型", type: "model" },
  
  // Audio
  mp3: { cat: "音频音效", type: "audio" },
  wav: { cat: "音频音效", type: "audio" },
  ogg: { cat: "音频音效", type: "audio" },
  
  // Video
  mp4: { cat: "动画资源", type: "video" },
  mov: { cat: "动画资源", type: "video" },
  avi: { cat: "动画资源", type: "video" },
  
  // Code
  cs: { cat: "脚本代码", type: "code" },
  cpp: { cat: "脚本代码", type: "code" },
  h: { cat: "脚本代码", type: "code" },
  ts: { cat: "脚本代码", type: "code" },
  js: { cat: "脚本代码", type: "code" },
  py: { cat: "脚本代码", type: "code" },
  lua: { cat: "脚本代码", type: "code" },
  
  // Docs
  pdf: { cat: "游戏策划", type: "document" },
  doc: { cat: "游戏策划", type: "document" },
  docx: { cat: "游戏策划", type: "document" },
  md: { cat: "游戏策划", type: "document" },
  txt: { cat: "游戏策划", type: "document" },
  xls: { cat: "游戏策划", type: "document" },
  xlsx: { cat: "游戏策划", type: "document" },
  
  // Engine specific
  unity: { cat: "预制体/关卡", type: "engine" },
  prefab: { cat: "预制体/关卡", type: "engine" },
  umap: { cat: "预制体/关卡", type: "engine" },
  uasset: { cat: "预制体/关卡", type: "engine" },
  shader: { cat: "特效Shader", type: "code" },
  hlsl: { cat: "特效Shader", type: "code" },
  glsl: { cat: "特效Shader", type: "code" },
  anim: { cat: "动画资源", type: "anim" },
  controller: { cat: "动画资源", type: "anim" },
};

// --- Constants for Testing ---
const TEST_RESOURCE_TITLES = ["学前篇！明年见", "蝴蝶", "001.png"];

// --- Components ---
const FileIcon = ({ type, className }: { type: string; className?: string }) => {
  switch (type) {
    case "image": return <FontAwesomeIcon icon={faImage} className={className} />;
    case "video": return <FontAwesomeIcon icon={faVideo} className={className} />;
    case "audio": return <FontAwesomeIcon icon={faMusic} className={className} />;
    case "document": return <FontAwesomeIcon icon={faFileLines} className={className} />;
    case "model": return <FontAwesomeIcon icon={faCube} className={className} />;
    case "code": return <FontAwesomeIcon icon={faCode} className={className} />;
    case "engine": return <FontAwesomeIcon icon={faGamepad} className={className} />;
    case "anim": return <FontAwesomeIcon icon={faVideo} className={className} />;
    default: return <FontAwesomeIcon icon={faFileLines} className={className} />;
  }
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function ResourcesPage() {
  const router = useRouter();
  
  // --- State ---
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [health, setHealth] = useState<ApiHealth>({ status: "loading" });
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("全部项目");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProject, setUploadProject] = useState("");
  const [uploadCategory, setUploadCategory] = useState(CATEGORIES[1]);
  const [uploaderName, setUploaderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectsRes = await fetch("/api/github/resources?type=projects");
      const projectsData = await projectsRes.json();
      if (projectsData.projects) {
        setProjects(projectsData.projects);
        if (projectsData.projects.length > 0 && !uploadProject) {
          setUploadProject(projectsData.projects[0]);
        }
      }

      const resourcesRes = await fetch("/api/github/resources");
      const resourcesData = await resourcesRes.json();
      
      if (resourcesData.resources) {
        const mappedResources: Resource[] = resourcesData.resources.map((item: any) => {
          // Parse SRID or numeric prefix
          const sridMatch = item.title.match(/^(SRID\.[a-zA-Z0-9]+)-(.+)/);
          const numMatch = item.title.match(/^(\d+)-(.+)/);
          
          let displayId = `ID-${item.id.substring(0, 4).toUpperCase()}`;
          let displayTitle = item.title;

          if (sridMatch) {
              displayId = sridMatch[1];
              displayTitle = sridMatch[2];
          } else if (numMatch) {
              displayTitle = numMatch[2];
          }

          const ext = item.title.split('.').pop()?.toLowerCase() || "";
          const meta = EXT_MAP[ext] || { cat: "其他", type: "document" };
          
          return {
            id: item.id,
            displayId,
            title: displayTitle,
            type: meta.type,
            category: meta.cat,
            project: item.project,
            url: item.url,
            size: formatSize(item.size),
            date: "未知",
            author: "未知",
            rawPath: item.path
          };
        });
        setResources(mappedResources);
      }

      const healthRes = await fetch("/api/github/health");
      const healthData = await healthRes.json();
      setHealth(healthData);

      setLastSync(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [uploadProject]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    const savedName = Cookies.get(UPLOADER_COOKIE_KEY);
    if (savedName) setUploaderName(savedName);

    return () => clearInterval(interval);
  }, [fetchData]);

  // --- Handlers ---
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploaderName || !uploadProject) return;

    setIsUploading(true);
    try {
      Cookies.set(UPLOADER_COOKIE_KEY, uploaderName, { expires: 365 });

      const reader = new FileReader();
      reader.readAsDataURL(uploadFile);
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(',')[1];
        
        // Remove numeric prefix (e.g. "123456-Name") and "SRID.xxx-" prefix if re-uploading
        let cleanName = uploadFile.name.replace(/^(\d+-|SRID\.[a-zA-Z0-9]+-)/, '');

        // Generate Unique ID
        let newId = "";
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 100) {
            const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
            newId = `SRID.${randomStr}`;
            // Check collision
            const collision = resources.some(r => r.title.startsWith(newId));
            if (!collision) isUnique = true;
            attempts++;
        }
        
        if (!isUnique) {
             alert("无法生成唯一ID，请重试");
             setIsUploading(false);
             return;
        }

        const newFileName = `${newId}-${cleanName}`;

        const ext = cleanName.split('.').pop()?.toLowerCase() || "";
        const type = EXT_MAP[ext]?.type || "file";
        const message = `${uploaderName} | ${uploadCategory}:${type} | ${newFileName} | ${new Date().toISOString()}`;
        
        const path = `${uploadProject}/${newFileName}`;

        const res = await fetch("/api/github/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path,
            content: base64Content,
            message
          })
        });

        if (res.ok) {
          setIsUploadModalOpen(false);
          setUploadFile(null);
          fetchData();
        } else {
          alert("上传失败 | Upload Failed");
        }
        setIsUploading(false);
      };
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
      alert("上传出错 | Upload Error");
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "全部" || res.category === selectedCategory;
    const matchesProject = selectedProjectFilter === "全部项目" || res.project === selectedProjectFilter;
    return matchesSearch && matchesCategory && matchesProject;
  });

  return (
    <div className="space-y-6 relative min-h-screen text-[var(--end-text-main)]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--end-border)] pb-6">
        <PageHeader title="资源数据库 | RESOURCE DATABASE" description="GitHub 集成资源管理系统" />
        
        <div className="flex items-center gap-3 mb-2">
            {/* Health Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--end-surface)] border border-[var(--end-border)] text-xs font-mono text-[var(--end-text-sub)] shadow-sm">
                {health.status === "loading" ? (
                    <FontAwesomeIcon icon={faRotate} className="animate-spin" />
                ) : health.status === "ok" ? (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" />
                ) : (
                    <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />
                )}
                <span className="tracking-wider">{health.remaining !== undefined ? `API限额: ${health.remaining}` : "API状态"}</span>
            </div>

            <button 
                onClick={() => fetchData()}
                className="p-2 bg-[var(--end-surface)] hover:bg-[var(--end-surface-hover)] border border-[var(--end-border)] text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] transition-all active:scale-95 shadow-sm"
                title={lastSync ? `上次同步: ${lastSync.toLocaleTimeString()}` : "同步中..."}
            >
                <FontAwesomeIcon icon={faRotate} className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>

            <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 bg-[var(--end-yellow)] hover:bg-[#e5b300] text-black px-4 py-2 font-bold transition-all active:scale-95 clip-path-button shadow-md"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)" }}
            >
            <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
            <span className="tracking-wider">上传资源 | UPLOAD</span>
            </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between bg-[var(--end-surface)] p-2 border border-[var(--end-border)] shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 p-2">
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-[var(--end-border)] flex-1 max-w-md focus-within:border-[var(--end-yellow)] transition-colors shadow-inner">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[var(--end-text-sub)] w-4 h-4" />
            <input 
                type="text" 
                placeholder="搜索资源..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[var(--end-text-main)] placeholder-[var(--end-text-dim)] w-full font-mono text-sm"
            />
            </div>
            
            <select 
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="bg-white px-3 py-2 border border-[var(--end-border)] text-[var(--end-text-main)] text-sm outline-none focus:border-[var(--end-yellow)] font-mono cursor-pointer shadow-sm"
            >
                <option value="全部项目">全部项目 | ALL PROJECTS</option>
                {projects.map(p => (
                    <option key={p} value={p}>{p}</option>
                ))}
            </select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar p-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap tracking-wider uppercase border",
                  selectedCategory === cat 
                    ? "bg-[var(--end-yellow)] text-black border-[var(--end-yellow)] shadow-sm" 
                    : "bg-transparent text-[var(--end-text-sub)] border-transparent hover:text-[var(--end-text-main)] hover:border-[var(--end-border)] hover:bg-black/5"
                )}
              >
                {cat}
              </button>
            ))}
        </div>
        
        <div className="flex items-center gap-1 p-2 border-l border-[var(--end-border)]">
             <button 
              onClick={() => setViewMode("grid")}
              className={cn("p-2 transition-colors", viewMode === "grid" ? "text-[var(--end-yellow-dim)]" : "text-[var(--end-text-sub)] hover:text-[var(--end-text-main)]")}
            >
              <FontAwesomeIcon icon={faGrip} className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-2 transition-colors", viewMode === "list" ? "text-[var(--end-yellow-dim)]" : "text-[var(--end-text-sub)] hover:text-[var(--end-text-main)]")}
            >
              <FontAwesomeIcon icon={faList} className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Resource Grid/List */}
      <div className={cn(
        "grid gap-4",
        viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
      )}>
        <AnimatePresence mode="popLayout">
          {filteredResources.map((res, index) => {
            const isTestResource = TEST_RESOURCE_TITLES.some(t => res.title.includes(t));
            return (
            <motion.div
              layout
              key={res.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "group relative transition-all cursor-pointer overflow-hidden bg-white border border-[var(--end-border)]",
                isTestResource 
                    ? "border-[var(--end-yellow)]" 
                    : "hover:border-[var(--end-yellow)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                viewMode === "list" && "flex items-center p-4 gap-4"
              )}
              style={{
                  clipPath: viewMode === 'grid' ? "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" : "none"
              }}
              onClick={() => router.push(`/resources/${res.displayId}?path=${encodeURIComponent(res.rawPath)}`)}
            >
              {/* Top Status Bar (Grid Only) */}
              {viewMode === "grid" && (
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--end-border)] bg-gray-50/30">
                      <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", isTestResource ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
                          <span className="text-[9px] font-mono text-[var(--end-text-dim)] tracking-widest">
                              {res.displayId}
                          </span>
                      </div>
                      <FontAwesomeIcon icon={faGrip} className="w-2 h-2 text-[var(--end-border)] group-hover:text-[var(--end-yellow)] transition-colors" />
                  </div>
              )}

              {/* Test Resource Hazard Strip */}
              {isTestResource && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--end-yellow)] z-20" 
                    style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 5px, #FFC700 5px, #FFC700 10px)" }}
                  />
              )}
              
              {/* Corner Accents (Decorations) */}
              {!isTestResource && viewMode === "grid" && (
                <>
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--end-yellow)] opacity-0 group-hover:opacity-100 transition-all duration-200 z-20" />
                    <div className="absolute bottom-[20px] right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--end-yellow)] opacity-0 group-hover:opacity-100 transition-all duration-200 z-20" />
                    
                    <div className="absolute top-[33px] left-0 w-0.5 h-3 bg-[var(--end-yellow)] opacity-0 group-hover:opacity-100 transition-all duration-200" />
                    <div className="absolute top-[33px] right-0 w-0.5 h-3 bg-[var(--end-yellow)] opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </>
              )}

              {/* Thumbnail / Icon */}
              <div className={cn(
                "flex items-center justify-center relative overflow-hidden bg-gray-100",
                viewMode === "grid" ? "aspect-[16/9] w-full border-b border-[var(--end-border)]" : "w-16 h-16 shrink-0 border border-[var(--end-border)]"
              )}>
                {/* Scanline Effect */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(255, 199, 0, 0.05) 50%)", backgroundSize: "100% 4px" }}
                />
                
                {/* Background Grid Pattern for Thumbnail */}
                <div className="absolute inset-0 opacity-[0.1]" 
                     style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }} 
                />

                {isTestResource && (
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: "repeating-linear-gradient(45deg, #FFC700 0, #FFC700 10px, transparent 10px, transparent 20px)"
                    }} />
                )}

                {res.type === 'image' ? (
                    <img 
                        src={`/api/github/file?path=${encodeURIComponent(res.rawPath)}`} 
                        alt={res.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale-[20%] group-hover:grayscale-0"
                        loading="lazy"
                    />
                ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                        <FileIcon 
                            type={res.type} 
                            className={cn(
                                "transition-all duration-300",
                                viewMode === "grid" ? "w-12 h-12" : "w-8 h-8",
                                isTestResource ? "text-[var(--end-yellow-dim)]" : "text-gray-400 group-hover:text-[var(--end-text-sub)]"
                            )} 
                        />
                    </div>
                )}
                
                {isTestResource && (
                    <div className="absolute top-2 right-2 z-20 px-2 py-0.5 bg-[var(--end-yellow)] text-black text-[9px] font-bold tracking-widest uppercase shadow-sm border border-black/10">
                        TEST_DATA
                    </div>
                )}
                
                {/* Type Badge (Bottom Left) */}
                {viewMode === "grid" && (
                    <div className="absolute bottom-0 left-0 px-2 py-1 bg-white/90 backdrop-blur border-t border-r border-[var(--end-border)] text-[9px] font-mono text-[var(--end-text-main)] font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[var(--end-yellow)] rounded-sm"></span>
                        {res.type}
                    </div>
                )}
              </div>

              {/* Info */}
              <div className={cn("flex-1 relative z-10 bg-white", viewMode === "grid" && "p-4")}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-full">
                    <h3 className={cn(
                        "font-bold text-sm line-clamp-1 tracking-tight transition-colors uppercase",
                        isTestResource ? "text-[var(--end-yellow-dim)]" : "text-[var(--end-text-main)] group-hover:text-[var(--end-yellow-dim)]"
                    )}>
                        {res.title}
                    </h3>
                    <p className="text-[10px] text-[var(--end-text-dim)] font-mono truncate mt-0.5">
                        //{res.rawPath.split('/').slice(-2, -1)[0] || '根目录 | ROOT'}
                    </p>
                  </div>
                </div>
                
                {viewMode === "grid" && (
                  <div className="space-y-3">
                      {/* Tech Specs Grid */}
                      <div className="grid grid-cols-2 gap-px bg-[var(--end-border)] border border-[var(--end-border)]">
                          <div className="bg-gray-50 p-1.5 flex flex-col gap-0.5">
                              <span className="text-[8px] text-[var(--end-text-dim)] uppercase tracking-wider font-mono">分类 | CATEGORY</span>
                              <span className="text-[10px] text-[var(--end-text-main)] font-medium truncate">{res.category}</span>
                          </div>
                          <div className="bg-gray-50 p-1.5 flex flex-col gap-0.5">
                              <span className="text-[8px] text-[var(--end-text-dim)] uppercase tracking-wider font-mono">大小 | SIZE</span>
                              <span className="text-[10px] text-[var(--end-text-main)] font-medium font-mono">{res.size}</span>
                          </div>
                      </div>

                      {/* Project Footer */}
                      <div className="flex items-center justify-between pt-2">
                         <div className="flex items-center gap-1.5">
                             <FontAwesomeIcon icon={faCode} className="w-2.5 h-2.5 text-[var(--end-text-dim)]" />
                             <span className="text-[10px] text-[var(--end-text-sub)] font-mono uppercase truncate max-w-[100px]">
                                {res.project}
                             </span>
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[var(--end-yellow-dim)]">
                             <span className="text-[9px] font-bold tracking-widest">ACCESS</span>
                             <FontAwesomeIcon icon={faTriangleExclamation} className="w-2.5 h-2.5 rotate-90" />
                         </div>
                      </div>
                  </div>
                )}
              </div>
            </motion.div>
          );})}
        </AnimatePresence>
      </div>

      {filteredResources.length === 0 && !isLoading && (
        <div className="text-center py-20 text-[var(--end-text-sub)] font-mono">
          <p>// 未找到资源 | NO RESOURCES FOUND //</p>
        </div>
      )}
      
      {isLoading && filteredResources.length === 0 && (
        <div className="flex justify-center py-20">
            <EndfieldLoading fullScreen={false} />
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !isUploading && setIsUploadModalOpen(false)}
                    className="absolute inset-0 bg-white/80 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-[var(--end-border)] w-full max-w-md relative z-10 shadow-2xl overflow-hidden"
                    style={{
                        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)"
                    }}
                >
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-6 text-[var(--end-text-main)] uppercase border-l-4 border-[var(--end-yellow)] pl-3">上传资源 | Upload Resource</h2>
                        <form onSubmit={handleUpload} className="space-y-5">
                            {/* Project Select */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-[var(--end-text-sub)] uppercase tracking-wider">所属项目 | Target Project</label>
                                <select 
                                    value={uploadProject}
                                    onChange={(e) => setUploadProject(e.target.value)}
                                    className="w-full bg-gray-50 border border-[var(--end-border)] px-3 py-2 text-sm text-[var(--end-text-main)] focus:border-[var(--end-yellow)] outline-none font-mono"
                                    required
                                >
                                    <option value="" disabled>选择项目 | SELECT PROJECT...</option>
                                    {projects.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Uploader Name */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-[var(--end-text-sub)] uppercase tracking-wider">操作员 | Operator Name</label>
                                <input 
                                    type="text"
                                    value={uploaderName}
                                    onChange={(e) => setUploaderName(e.target.value)}
                                    className="w-full bg-gray-50 border border-[var(--end-border)] px-3 py-2 text-sm text-[var(--end-text-main)] focus:border-[var(--end-yellow)] outline-none font-mono"
                                    placeholder="输入姓名 | ENTER NAME"
                                    required
                                />
                            </div>

                             {/* Category */}
                             <div className="space-y-1.5">
                                <label className="text-[10px] text-[var(--end-text-sub)] uppercase tracking-wider">分类 | Category</label>
                                <select 
                                    value={uploadCategory}
                                    onChange={(e) => setUploadCategory(e.target.value)}
                                    className="w-full bg-gray-50 border border-[var(--end-border)] px-3 py-2 text-sm text-[var(--end-text-main)] focus:border-[var(--end-yellow)] outline-none font-mono"
                                    required
                                >
                                    {CATEGORIES.filter(c => c !== "全部").map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* File Input */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-[var(--end-text-sub)] uppercase tracking-wider">文件资源 | File Asset</label>
                                <div className="border border-dashed border-[var(--end-border)] p-6 text-center hover:border-[var(--end-yellow)] transition-colors cursor-pointer relative bg-gray-50">
                                    <input 
                                        type="file" 
                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        required
                                    />
                                    {uploadFile ? (
                                        <div className="text-sm text-[var(--end-yellow-dim)] font-mono break-all">
                                            {uploadFile.name}
                                        </div>
                                    ) : (
                                        <div className="text-[var(--end-text-sub)] text-sm">
                                            <FontAwesomeIcon icon={faUpload} className="mb-2 text-lg" />
                                            <p className="font-mono text-xs">拖拽文件或点击 | DROP FILE OR CLICK</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-transparent border border-[var(--end-border)] hover:bg-black/5 text-xs font-bold text-[var(--end-text-sub)] transition-colors uppercase"
                                    disabled={isUploading}
                                >
                                    取消 | Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[var(--end-yellow)] hover:bg-[#e5b300] text-black text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
                                    disabled={isUploading}
                                >
                                    {isUploading && <FontAwesomeIcon icon={faRotate} className="animate-spin" />}
                                    {isUploading ? "上传中... | Uploading..." : "确认上传 | Confirm Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}