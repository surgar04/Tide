"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faSave, faCog, faUndo, faRedo } from "@fortawesome/free-solid-svg-icons";
import { Viewport2D } from "./Viewport2D";
import { Toolbar2D } from "./Toolbar2D";
import { TileBrowser } from "./TileBrowser";
import { LayerManager } from "./LayerManager";
import { ProjectManager } from "./ProjectManager";
import { useState } from "react";

export function MapEditor2D() {
  const [mapImage, setMapImage] = useState<string | null>(null);

  const handleUploadMap = (file: File) => {
    const url = URL.createObjectURL(file);
    setMapImage(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-[var(--end-surface)] border border-[var(--end-border)] p-3 rounded-lg">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 flex items-center justify-center bg-[var(--end-yellow)]/10 text-[var(--end-yellow)] border border-[var(--end-yellow)] rounded">
                <FontAwesomeIcon icon={faMap} />
             </div>
             <div>
                 <h1 className="text-lg font-bold text-[var(--end-text-main)] leading-none">2D 地图编辑器</h1>
                 <span className="text-[10px] text-[var(--end-text-sub)] font-mono tracking-widest">TILEMAP EDITOR V1.0</span>
             </div>
          </div>
          
          {/* Central Tools (Undo/Redo) */}
          <div className="flex items-center gap-2">
              <button 
                className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/10 rounded transition-colors"
                title="撤销 (Ctrl+Z)"
              >
                  <FontAwesomeIcon icon={faUndo} />
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/10 rounded transition-colors"
                title="重做 (Ctrl+Y)"
              >
                  <FontAwesomeIcon icon={faRedo} />
              </button>
          </div>
          
          <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--end-yellow)] text-black text-xs font-bold rounded hover:bg-[var(--end-yellow-dim)] transition-colors">
                  <FontAwesomeIcon icon={faSave} />
                  保存工程
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/10 rounded transition-colors">
                  <FontAwesomeIcon icon={faCog} />
              </button>
          </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex gap-4 min-h-0">
         {/* Left Sidebar (Project + Layers) */}
         <div className="flex gap-0 h-full">
            <ProjectManager />
            <div className="w-64 flex flex-col gap-4 border-l border-[var(--end-border)] bg-[var(--end-surface)]">
                <LayerManager />
            </div>
         </div>

         {/* Center (Viewport + Toolbar) */}
         <div className="flex-1 relative flex flex-col min-h-0">
             <Viewport2D mapImage={mapImage} />
             
             {/* Floating Toolbar */}
             <div className="absolute top-4 left-4 z-10">
                <Toolbar2D onUploadMap={handleUploadMap} />
             </div>
         </div>

         {/* Right Sidebar (Tile Browser) */}
         <div className="w-64 flex flex-col gap-4">
            <TileBrowser />
         </div>
      </div>
      
      {/* Footer / Status Bar */}
      <div className="h-6 bg-[var(--end-surface)] border border-[var(--end-border)] rounded flex items-center px-4 text-[10px] text-[var(--end-text-dim)] font-mono justify-between">
          <span>就绪</span>
          <span>网格: 40px | 缩放: 100%</span>
      </div>
    </div>
  );
}
