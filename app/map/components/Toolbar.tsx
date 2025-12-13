"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMousePointer, 
  faArrowsUpDownLeftRight, 
  faRotate, 
  faExpand, 
  faMountain,
  faCube,
  faLightbulb
} from "@fortawesome/free-solid-svg-icons";
import { useEditor } from "@/lib/map/context";
import { cn } from "@/lib/utils";
import { EditorMode } from "@/lib/map/types";
import { generateTerrainMap } from "@/lib/map/wasm-bridge";
import { useState } from "react";

const tools: { id: EditorMode; icon: any; label: string }[] = [
  { id: 'select', icon: faMousePointer, label: '选择' },
  { id: 'translate', icon: faArrowsUpDownLeftRight, label: '移动' },
  { id: 'rotate', icon: faRotate, label: '旋转' },
  { id: 'scale', icon: faExpand, label: '缩放' },
  { id: 'terrain', icon: faMountain, label: '地形' },
];

export function Toolbar() {
  const { mode, setMode, addObject } = useEditor();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTerrain = async () => {
      setIsGenerating(true);
      try {
          const size = 128;
          const heightmap = await generateTerrainMap(12345, size);
          console.log("Terrain Generated via WASM:", heightmap);
          alert(`地形生成成功 (C# WASM)! \n尺寸: ${size}x${size}\n数据点: ${heightmap.length}`);
          
          // In a real implementation, we would create a Terrain object here
          addObject({
              name: 'Generated Terrain',
              type: 'mesh', // Placeholder
              scale: [10, 1, 10]
          });
      } catch (error) {
          console.error(error);
          alert("地形生成失败。请检查控制台的 WASM 错误。");
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="flex flex-col gap-4 bg-[var(--end-surface)] border border-[var(--end-border)] p-2 rounded-lg pointer-events-auto">
      <div className="flex flex-col gap-1 border-b border-[var(--end-border)] pb-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setMode(tool.id)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded transition-colors",
              mode === tool.id 
                ? "bg-[var(--end-yellow)] text-black" 
                : "text-[var(--end-text-sub)] hover:bg-white/10 hover:text-[var(--end-text-main)]"
            )}
            title={tool.label}
          >
            <FontAwesomeIcon icon={tool.icon} className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
          <button
            onClick={() => addObject({ type: 'mesh', name: 'Cube' })}
            className="w-10 h-10 flex items-center justify-center rounded text-[var(--end-text-sub)] hover:bg-white/10 hover:text-[var(--end-text-main)]"
            title="添加立方体"
          >
            <FontAwesomeIcon icon={faCube} className="w-4 h-4" />
          </button>
          <button
            onClick={() => addObject({ type: 'light', name: 'Light' })}
            className="w-10 h-10 flex items-center justify-center rounded text-[var(--end-text-sub)] hover:bg-white/10 hover:text-[var(--end-text-main)]"
            title="添加光源"
          >
            <FontAwesomeIcon icon={faLightbulb} className="w-4 h-4" />
          </button>
      </div>

      {mode === 'terrain' && (
          <div className="flex flex-col gap-1 border-t border-[var(--end-border)] pt-2 animate-in slide-in-from-top-2">
              <button
                onClick={handleGenerateTerrain}
                disabled={isGenerating}
                className="w-10 h-10 flex items-center justify-center rounded text-[var(--end-yellow)] hover:bg-white/10 border border-[var(--end-yellow)]/20 hover:border-[var(--end-yellow)] transition-colors disabled:opacity-50"
                title="生成地形 (WASM)"
              >
                 {isGenerating ? (
                     <FontAwesomeIcon icon={faRotate} className="w-4 h-4 animate-spin" />
                 ) : (
                     <FontAwesomeIcon icon={faMountain} className="w-4 h-4" />
                 )}
              </button>
          </div>
      )}
    </div>
  );
}
