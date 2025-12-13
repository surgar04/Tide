"use client";

import { useState } from 'react';
import { PageHeader } from "@/components/ui/PageHeader";
import { ReactFlowProvider } from '@xyflow/react';
import StoryEditor from "./components/StoryEditor";
import ProjectList from "./components/ProjectList";
import StoryFileList from "./components/StoryFileList";

type ViewState = 'projects' | 'files' | 'editor';

export default function StoryPage() {
  const [view, setView] = useState<ViewState>('projects');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setView('files');
  };

  const handleSelectFile = (filePath: string) => {
    setCurrentFilePath(filePath);
    setView('editor');
  };

  const handleBackToProjects = () => {
    setCurrentProjectId(null);
    setView('projects');
  };

  const handleBackToFiles = () => {
    setCurrentFilePath(null);
    setView('files');
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex-none">
        <PageHeader 
          title="剧情模式" 
          description="非线性叙事编辑器 [兼容 TWINE]" 
        />
      </div>
      
      <div className="flex-1 min-h-0">
        {view === 'projects' && (
          <ProjectList onSelectProject={handleSelectProject} />
        )}

        {view === 'files' && currentProjectId && (
          <StoryFileList 
            projectId={currentProjectId} 
            onSelectFile={handleSelectFile}
            onBack={handleBackToProjects}
          />
        )}

        {view === 'editor' && currentProjectId && currentFilePath && (
          <ReactFlowProvider>
            <StoryEditor 
              projectId={currentProjectId} 
              filePath={currentFilePath}
              onBack={handleBackToFiles} 
            />
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
}
