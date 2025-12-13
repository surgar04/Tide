"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faLayerGroup, faImage } from "@fortawesome/free-solid-svg-icons";

export function TileBrowser() {
  const tiles = [
    { id: 1, name: "草地", color: "#4ade80" },
    { id: 2, name: "泥土", color: "#a16207" },
    { id: 3, name: "水面", color: "#3b82f6" },
    { id: 4, name: "石块", color: "#78716c" },
    { id: 5, name: "墙体", color: "#1c1917" },
    { id: 6, name: "地板", color: "#44403c" },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--end-surface)] border border-[var(--end-border)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-2 border-b border-[var(--end-border)] flex items-center justify-between bg-[var(--end-surface-hover)]">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--end-text-main)]">
          <FontAwesomeIcon icon={faLayerGroup} className="text-[var(--end-yellow)]" />
          <span>图块集</span>
        </div>
        <div className="relative w-32">
            <input 
                type="text" 
                placeholder="搜索..." 
                className="w-full bg-black/20 border border-[var(--end-border)] rounded px-2 py-0.5 text-[10px] text-[var(--end-text-main)] focus:border-[var(--end-yellow)] outline-none"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--end-text-dim)] text-[10px]" />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="grid grid-cols-4 gap-2">
            {tiles.map(tile => (
                <div key={tile.id} className="aspect-square bg-black/20 border border-[var(--end-border)] hover:border-[var(--end-yellow)] cursor-pointer group relative flex flex-col items-center justify-center gap-1 transition-all">
                    <div className="w-8 h-8 rounded-sm" style={{ backgroundColor: tile.color }} />
                    <span className="text-[10px] text-[var(--end-text-dim)] font-mono">{tile.name}</span>
                </div>
            ))}
            
            {/* Placeholders */}
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-black/20 border border-[var(--end-border)] opacity-30 flex items-center justify-center">
                    <FontAwesomeIcon icon={faImage} className="text-[var(--end-text-dim)]" />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
