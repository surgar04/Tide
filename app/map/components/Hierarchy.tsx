"use client";

import { useEditor } from "@/lib/map/context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faLightbulb, faVideo, faFolder } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

export function Hierarchy() {
  const { objects, rootIds, selectedIds, selectObject } = useEditor();

  const getIcon = (type: string) => {
    switch (type) {
      case 'light': return faLightbulb;
      case 'camera': return faVideo;
      case 'empty': return faFolder;
      default: return faCube;
    }
  };

  const renderNode = (id: string, depth = 0) => {
    const obj = objects[id];
    if (!obj) return null;

    const isSelected = selectedIds.includes(id);

    return (
      <div key={id}>
        <div 
          className={cn(
            "flex items-center gap-2 px-2 py-1 cursor-pointer text-xs font-mono transition-colors border-l-2 border-transparent",
            isSelected 
                ? "bg-[var(--end-yellow)]/20 text-[var(--end-yellow)] border-[var(--end-yellow)]" 
                : "text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/5"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={(e) => {
              e.stopPropagation();
              selectObject(id, e.ctrlKey);
          }}
        >
          <FontAwesomeIcon icon={getIcon(obj.type)} className="w-3 h-3 opacity-70" />
          <span>{obj.name}</span>
        </div>
        {obj.children?.map(childId => renderNode(childId, depth + 1))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[var(--end-surface)] border-r border-[var(--end-border)]">
      <div className="p-3 border-b border-[var(--end-border)]">
        <h3 className="text-xs font-bold text-[var(--end-text-dim)] tracking-widest uppercase">Scene Graph</h3>
      </div>
      <div className="flex-1 overflow-y-auto py-2" onClick={() => selectObject(null)}>
        {rootIds.map(id => renderNode(id))}
      </div>
    </div>
  );
}
