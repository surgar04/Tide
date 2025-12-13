"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor } from "@/lib/map/context";

export function Viewport2D({ mapImage }: { mapImage?: string | null }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Grid settings
  const gridSize = 40; // px
  const gridColor = "rgba(255, 255, 255, 0.1)";

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      // Zoom
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(s => Math.min(Math.max(s * delta, 0.1), 5));
    } else {
      // Pan
      setOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) { // Middle or Right click to pan
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Prevent context menu on right click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-[#111] relative overflow-hidden rounded-lg border border-[var(--end-border)] cursor-crosshair"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Map Image Layer */}
      {mapImage && (
        <div 
            className="absolute origin-top-left pointer-events-none"
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                left: '50%',
                top: '50%',
            }}
        >
            <img 
                src={mapImage} 
                alt="Map Background" 
                className="transform -translate-x-1/2 -translate-y-1/2 max-w-none opacity-80" 
                style={{ imageRendering: 'pixelated' }}
            />
        </div>
      )}

      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
          backgroundPosition: `${offset.x}px ${offset.y}px`,
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `
        }}
      />

      {/* Origin Marker */}
      <div 
        className="absolute w-2 h-2 bg-[var(--end-yellow)] rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: `calc(50% + ${offset.x}px)`,
          top: `calc(50% + ${offset.y}px)`
        }}
      />

      {/* Axis Lines */}
      <div 
        className="absolute bg-red-500/50 pointer-events-none"
        style={{
          left: 0,
          right: 0,
          top: `calc(50% + ${offset.y}px)`,
          height: '1px'
        }}
      />
      <div 
        className="absolute bg-green-500/50 pointer-events-none"
        style={{
          top: 0,
          bottom: 0,
          left: `calc(50% + ${offset.x}px)`,
          width: '1px'
        }}
      />

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-white/50 font-mono border border-white/10">
              2D 视口 [正交投影] | 缩放: {(scale * 100).toFixed(0)}%
          </div>
      </div>
    </div>
  );
}
