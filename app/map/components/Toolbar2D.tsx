"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMousePointer, 
  faPaintBrush, 
  faEraser, 
  faFillDrip, 
  faSquare,
  faUpload
} from "@fortawesome/free-solid-svg-icons";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

type Tool2D = 'select' | 'brush' | 'eraser' | 'fill' | 'rect';

const tools: { id: Tool2D; icon: any; label: string }[] = [
  { id: 'select', icon: faMousePointer, label: '选择' },
  { id: 'brush', icon: faPaintBrush, label: '画笔' },
  { id: 'eraser', icon: faEraser, label: '橡皮擦' },
  { id: 'fill', icon: faFillDrip, label: '油漆桶' },
  { id: 'rect', icon: faSquare, label: '矩形工具' },
];

export function Toolbar2D({ onUploadMap }: { onUploadMap?: (file: File) => void }) {
  const [activeTool, setActiveTool] = useState<Tool2D>('select');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadMap) {
      onUploadMap(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-4 bg-[var(--end-surface)] border border-[var(--end-border)] p-2 rounded-lg pointer-events-auto">
      <div className="flex flex-col gap-1 border-b border-[var(--end-border)] pb-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded transition-colors",
              activeTool === tool.id 
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
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center rounded text-[var(--end-text-sub)] hover:bg-white/10 hover:text-[var(--end-text-main)]"
            title="上传地图"
        >
            <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        accept=".json,.png,.jpg,.jpeg"
      />
    </div>
  );
}
