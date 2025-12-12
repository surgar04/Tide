import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faRotate, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
}

export default function ProjectList({ onSelectProject }: ProjectListProps) {
  const [projects, setProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github/resources?type=projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
      setError("无法加载项目列表，请检查网络或 API 配置。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--end-text-main)] uppercase tracking-tight">项目总览</h2>
            <p className="text-[var(--end-text-sub)] font-mono text-sm mt-1">// PROJECT_OVERVIEW_REMOTE</p>
          </div>
          <button 
            onClick={fetchProjects}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded flex items-center gap-2 transition-colors shadow-sm"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faRotate} className={isLoading ? "animate-spin" : ""} />
            刷新
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-20 text-center">
             <FontAwesomeIcon icon={faSpinner} className="text-4xl text-[var(--end-yellow)] animate-spin mb-4" />
             <p className="text-slate-500 font-mono">正在同步远程仓库...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="py-20 text-center border-2 border-dashed border-red-200 rounded-xl bg-red-50">
             <p className="text-red-500 font-bold mb-2">Error</p>
             <p className="text-slate-600">{error}</p>
             <button onClick={fetchProjects} className="mt-4 text-sm text-red-600 underline">重试</button>
          </div>
        )}

        {/* Project Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <FontAwesomeIcon icon={faFolderOpen} className="text-4xl text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">暂无项目</p>
                <p className="text-slate-400 text-sm mt-1">请在资源库或 GitHub 仓库中创建以 "项目-" 开头的文件夹</p>
              </div>
            ) : (
              projects.map(project => (
                <div 
                  key={project}
                  onClick={() => onSelectProject(project)}
                  className="group relative bg-white border border-slate-200 hover:border-[var(--end-yellow)] rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--end-yellow)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[var(--end-text-main)] transition-colors">
                      <FontAwesomeIcon icon={faFolderOpen} className="text-lg" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--end-text-main)] mb-2 truncate pr-4">{project}</h3>
                  <p className="text-slate-400 text-xs font-mono">
                    REMOTE REPOSITORY
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
