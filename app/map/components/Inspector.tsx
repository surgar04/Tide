"use client";

import { useEditor } from "@/lib/map/context";
import { Vector3 } from "@/lib/map/types";

export function Inspector() {
  const { objects, selectedIds, updateObjectTransform } = useEditor();

  if (selectedIds.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--end-surface)] border-l border-[var(--end-border)] p-4 text-[var(--end-text-dim)] text-xs font-mono">
        NO SELECTION
      </div>
    );
  }

  // Simplified: only show first selected object
  const selectedId = selectedIds[0];
  const obj = objects[selectedId];

  if (!obj) return null;

  const handleTransformChange = (axis: number, value: string, type: 'pos' | 'rot' | 'scale') => {
      const val = parseFloat(value) || 0;
      if (type === 'pos') {
          const newPos: Vector3 = [...obj.position];
          newPos[axis] = val;
          updateObjectTransform(selectedId, newPos, undefined, undefined);
      } else if (type === 'rot') {
          const newRot: Vector3 = [...obj.rotation];
          newRot[axis] = val;
          updateObjectTransform(selectedId, undefined, newRot, undefined);
      } else if (type === 'scale') {
          const newScale: Vector3 = [...obj.scale];
          newScale[axis] = val;
          updateObjectTransform(selectedId, undefined, undefined, newScale);
      }
  };

  const VectorInput = ({ label, value, onChange }: { label: string, value: Vector3, onChange: (axis: number, val: string) => void }) => (
      <div className="mb-4">
          <div className="text-[10px] text-[var(--end-text-dim)] uppercase tracking-widest mb-2">{label}</div>
          <div className="grid grid-cols-3 gap-2">
              {['X', 'Y', 'Z'].map((axis, i) => (
                  <div key={axis} className="flex items-center bg-black/20 border border-[var(--end-border)] rounded overflow-hidden group focus-within:border-[var(--end-yellow)] transition-colors">
                      <div className="px-2 py-1 text-[10px] text-[var(--end-text-dim)] font-mono border-r border-[var(--end-border)] bg-white/5">{axis}</div>
                      <input 
                        type="number" 
                        value={value[i]} 
                        step={0.1}
                        onChange={(e) => onChange(i, e.target.value)}
                        className="w-full bg-transparent text-xs text-[var(--end-text-main)] px-2 py-1 focus:outline-none font-mono"
                      />
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col bg-[var(--end-surface)] border-l border-[var(--end-border)] w-64">
      <div className="p-3 border-b border-[var(--end-border)]">
        <h3 className="text-xs font-bold text-[var(--end-text-dim)] tracking-widest uppercase">Properties</h3>
      </div>
      
      <div className="p-4 overflow-y-auto">
          <div className="mb-6">
              <label className="text-[10px] text-[var(--end-text-dim)] uppercase tracking-widest mb-1 block">Name</label>
              <input 
                type="text" 
                value={obj.name} 
                readOnly 
                className="w-full bg-black/20 border border-[var(--end-border)] text-[var(--end-text-main)] px-2 py-1 text-sm font-mono rounded focus:outline-none focus:border-[var(--end-yellow)]"
              />
          </div>

          <div className="h-[1px] bg-[var(--end-border)] mb-6"></div>

          <VectorInput label="Position" value={obj.position} onChange={(axis, val) => handleTransformChange(axis, val, 'pos')} />
          <VectorInput label="Rotation" value={obj.rotation} onChange={(axis, val) => handleTransformChange(axis, val, 'rot')} />
          <VectorInput label="Scale" value={obj.scale} onChange={(axis, val) => handleTransformChange(axis, val, 'scale')} />

          <div className="h-[1px] bg-[var(--end-border)] mb-6"></div>
          
          <div className="bg-[var(--end-yellow)]/10 border border-[var(--end-yellow)] p-3 rounded text-[var(--end-yellow)] text-xs font-mono">
              ID: {obj.id.slice(0, 8)}...
          </div>
      </div>
    </div>
  );
}
