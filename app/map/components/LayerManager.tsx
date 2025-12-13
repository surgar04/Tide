"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faEye, faEyeSlash, faLock, faLockOpen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export function LayerManager() {
  const [layers, setLayers] = useState([
    { id: 1, name: "前景层", visible: true, locked: false },
    { id: 2, name: "角色层", visible: true, locked: false },
    { id: 3, name: "背景层", visible: true, locked: true },
  ]);

  const [activeLayer, setActiveLayer] = useState(1);

  return (
    <div className="h-full flex flex-col bg-[var(--end-surface)] border-l border-[var(--end-border)]">
      <div className="p-2 border-b border-[var(--end-border)] flex items-center justify-between bg-[var(--end-surface-hover)]">
        <span className="text-xs font-bold text-[var(--end-text-main)]">图层管理</span>
        <button className="text-[var(--end-text-sub)] hover:text-[var(--end-yellow)] transition-colors">
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {layers.map(layer => (
            <div 
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-2 p-2 border-b border-[var(--end-border)] cursor-pointer transition-colors ${
                    activeLayer === layer.id ? 'bg-[var(--end-yellow)]/10 border-l-2 border-l-[var(--end-yellow)]' : 'hover:bg-white/5 border-l-2 border-l-transparent'
                }`}
            >
                <button className="w-4 text-[var(--end-text-dim)] hover:text-[var(--end-text-main)]">
                    <FontAwesomeIcon icon={layer.visible ? faEye : faEyeSlash} className="text-[10px]" />
                </button>
                <button className="w-4 text-[var(--end-text-dim)] hover:text-[var(--end-text-main)]">
                    <FontAwesomeIcon icon={layer.locked ? faLock : faLockOpen} className="text-[10px]" />
                </button>
                <span className={`text-xs font-mono flex-1 ${activeLayer === layer.id ? 'text-[var(--end-yellow)] font-bold' : 'text-[var(--end-text-sub)]'}`}>
                    {layer.name}
                </span>
                <button className="text-[var(--end-text-dim)] hover:text-red-500 opacity-0 group-hover:opacity-100">
                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}
