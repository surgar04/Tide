import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileAlt, faSpinner, faArrowLeft, faRotate } from '@fortawesome/free-solid-svg-icons';

interface StoryFileListProps {
  projectId: string;
  onSelectFile: (filePath: string) => void;
  onBack: () => void;
}

interface StoryFile {
  name: string;
  path: string;
  sha: string;
  size: number;
}

export default function StoryFileList({ projectId, onSelectFile, onBack }: StoryFileListProps) {
  const [files, setFiles] = useState<StoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all resources and filter for this project and .story.json extension
      const res = await fetch("/api/github/resources");
      if (!res.ok) throw new Error("Failed to fetch resources");
      const data = await res.json();
      
      const storyFiles: StoryFile[] = [];

      // Add Tutorial Project manually if not present
      storyFiles.push({
          name: "教学剧本 (Tutorial)",
          path: "public/tutorial_project.json",
          sha: "tutorial",
          size: 0
      });

      if (data.resources) {
        const remoteFiles = data.resources.filter((item: any) => 
          item.project === projectId && 
          item.title.endsWith('.story.json')
        ).map((item: any) => ({
          name: item.title.replace('.story.json', ''),
          path: item.path,
          sha: item.id,
          size: item.size
        }));
        storyFiles.push(...remoteFiles);
      }
      setFiles(storyFiles);
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
    // Path: Project-Name/FileName.story.json
    // We pass a virtual path, the Editor will handle the actual creation on first save
    // Or we can just enter the editor with a new path
    const path = `${projectId}/${fileName}.story.json`;
    onSelectFile(path);
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
            刷新
          </button>
        </div>

        {/* Create New File Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
                <input 
                    type="text" 
                    placeholder="输入新剧情名称 (无需后缀)..." 
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--end-yellow)]"
                />
            </div>
            <button 
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="w-full sm:w-auto px-6 py-2 bg-[var(--end-yellow)] hover:bg-[var(--end-yellow-hover)] text-black font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <FontAwesomeIcon icon={faPlus} />
                新建剧情
            </button>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="py-20 text-center">
             <FontAwesomeIcon icon={faSpinner} className="text-4xl text-[var(--end-yellow)] animate-spin mb-4" />
             <p className="text-slate-500 font-mono">正在加载文件...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="py-10 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
             {error}
          </div>
        )}

        {/* File Grid */}
        {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-400 italic">
                        该项目下暂无剧情文件
                    </div>
                ) : (
                    files.map(file => (
                        <div 
                            key={file.path}
                            onClick={() => onSelectFile(file.path)}
                            className="group bg-white border border-slate-200 hover:border-[var(--end-yellow)] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[var(--end-text-main)] transition-colors">
                                <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--end-text-main)] truncate">{file.name}</h3>
                                <p className="text-xs text-slate-400 font-mono mt-1">{file.path}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

      </div>
    </div>
  );
}
