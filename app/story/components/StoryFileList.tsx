import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileAlt, faSpinner, faArrowLeft, faRotate, faProjectDiagram, faFileCode, faBookOpen, faCode } from '@fortawesome/free-solid-svg-icons';

interface StoryFileListProps {
  projectId: string;
  onSelectFile: (filePath: string) => void;
  onBack: () => void;
}

interface StoryFileGroup {
  name: string;
  hasPlot: boolean;
  hasJson: boolean;
  hasMd: boolean;
  plotPath?: string;
  jsonPath?: string;
  mdPath?: string;
  lastModified?: string; // Optional if available
}

export default function StoryFileList({ projectId, onSelectFile, onBack }: StoryFileListProps) {
  const [fileGroups, setFileGroups] = useState<StoryFileGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all resources and filter for this project
      const res = await fetch("/api/github/resources");
      if (!res.ok) throw new Error("Failed to fetch resources");
      const data = await res.json();
      
      const groups: Record<string, StoryFileGroup> = {};

      // Add Tutorial Project manually if not present
      groups["教学剧本 (Tutorial)"] = {
          name: "教学剧本 (Tutorial)",
          hasPlot: false,
          hasJson: true, // Treated as json/legacy
          hasMd: false,
          jsonPath: "public/tutorial_project.json"
      };

      // Add Tutorial Project 2 manually
      groups["教学剧本2 (Tutorial 2)"] = {
          name: "教学剧本2 (Tutorial 2)",
          hasPlot: true,
          hasJson: false,
          hasMd: false,
          plotPath: "public/tutorial_project_2.plot"
      };

      if (data.resources) {
        data.resources.forEach((item: any) => {
            if (item.project !== projectId) return;
            
            let baseName = "";
            let type = "";

            if (item.title.endsWith('.plot')) {
                baseName = item.title.replace('.plot', '');
                type = 'plot';
            } else if (item.title.endsWith('.story.json')) {
                baseName = item.title.replace('.story.json', '');
                type = 'json';
            } else if (item.title.endsWith('.md')) {
                baseName = item.title.replace('.md', '');
                type = 'md';
            } else {
                return;
            }

            if (!groups[baseName]) {
                groups[baseName] = {
                    name: baseName,
                    hasPlot: false,
                    hasJson: false,
                    hasMd: false
                };
            }

            if (type === 'plot') {
                groups[baseName].hasPlot = true;
                groups[baseName].plotPath = item.path;
            } else if (type === 'json') {
                groups[baseName].hasJson = true;
                groups[baseName].jsonPath = item.path;
            } else if (type === 'md') {
                groups[baseName].hasMd = true;
                groups[baseName].mdPath = item.path;
            }
        });
      }
      
      setFileGroups(Object.values(groups));
    } catch (err) {
      console.error(err);
      setError("无法加载文件列表");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const fileName = newFileName.trim();
    // Use .plot as the default format now
    const path = `${projectId}/${fileName}.plot`;
    onSelectFile(path);
  };

  const handleSelectGroup = (group: StoryFileGroup) => {
      // Priority: .plot -> .story.json -> .md (if editable?)
      if (group.hasPlot && group.plotPath) {
          onSelectFile(group.plotPath);
      } else if (group.hasJson && group.jsonPath) {
          onSelectFile(group.jsonPath);
      } else {
          alert("此文件仅包含Markdown文档，无法直接编辑剧情。");
      }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-[var(--end-text-main)] uppercase tracking-tight">{projectId}</h2>
                <p className="text-[var(--end-text-sub)] font-mono text-sm mt-1">// STORY_FILES</p>
            </div>
          </div>
          
          <button 
            onClick={fetchFiles}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded flex items-center gap-2 transition-colors shadow-sm"
            disabled={isLoading}
          >
             <FontAwesomeIcon icon={faRotate} className={isLoading ? "animate-spin" : ""} />
             刷新列表
          </button>
        </div>

        {/* Create New */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-end gap-4">
            <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">新建剧情文件 (New Story)</label>
                <input 
                    type="text" 
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--end-yellow)] transition-all font-mono"
                    placeholder="Enter file name (e.g. Chapter1_Intro)..."
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
                />
            </div>
            <button 
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
                <FontAwesomeIcon icon={faPlus} />
                创建 (CREATE)
            </button>
        </div>

        {/* File List */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Project Files ({fileGroups.length})</h3>
            
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl text-slate-300" />
                </div>
            ) : error ? (
                <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
                    {error}
                </div>
            ) : fileGroups.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                    No files found in this project. Create one above!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fileGroups.map((group) => (
                        <div 
                            key={group.name}
                            onClick={() => handleSelectGroup(group)}
                            className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-[var(--end-yellow)] hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-[var(--end-yellow)] transition-colors" />
                            
                            <div className="flex justify-between items-start mb-3 pl-2">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-[var(--end-yellow-dim)] group-hover:text-black transition-colors">
                                    <FontAwesomeIcon icon={group.hasPlot ? faProjectDiagram : faFileCode} className="text-xl" />
                                </div>
                                <div className="flex gap-1">
                                    {group.hasPlot && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded border border-green-200" title="Plot Source">PLOT</span>}
                                    {group.hasJson && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded border border-blue-200" title="JSON Data">JSON</span>}
                                    {group.hasMd && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded border border-slate-200" title="Markdown Doc">MD</span>}
                                </div>
                            </div>
                            
                            <div className="pl-2">
                                <h4 className="font-bold text-lg text-slate-800 group-hover:text-black mb-1 truncate" title={group.name}>
                                    {group.name}
                                </h4>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span>
                                        {group.hasPlot ? '可视化剧情' : '旧版数据'}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold text-[var(--end-yellow-dark)] flex items-center gap-1">
                                    EDIT <FontAwesomeIcon icon={faArrowLeft} className="rotate-180" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
