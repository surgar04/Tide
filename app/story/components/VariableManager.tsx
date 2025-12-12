import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

interface VariableManagerProps {
  variables: Record<string, any>;
  onUpdate: (variables: Record<string, any>) => void;
  onClose: () => void;
}

export default function VariableManager({ variables, onUpdate, onClose }: VariableManagerProps) {
  const [localVars, setLocalVars] = useState<Record<string, any>>(variables || {});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<'string' | 'number' | 'boolean'>('string');

  const handleAdd = () => {
    if (!newKey.trim()) return;
    
    let val: any = newValue;
    if (newType === 'number') val = Number(newValue);
    if (newType === 'boolean') val = newValue === 'true';

    setLocalVars(prev => ({ ...prev, [newKey.trim()]: val }));
    setNewKey('');
    setNewValue('');
  };

  const handleDelete = (key: string) => {
    const next = { ...localVars };
    delete next[key];
    setLocalVars(next);
  };

  const handleSave = () => {
    onUpdate(localVars);
    onClose();
  };

  return (
    <div className="absolute right-4 top-20 bottom-4 w-80 bg-white/95 backdrop-blur shadow-xl border border-slate-200 rounded-xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
        <h3 className="font-bold text-[var(--end-text-main)] uppercase tracking-tight">全局变量</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Add New Variable */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="名称 (例如: health)" 
                    value={newKey}
                    onChange={e => setNewKey(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                />
                <select 
                    value={newType} 
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-20 px-1 py-1 text-xs border border-slate-200 rounded"
                >
                    <option value="string">文本</option>
                    <option value="number">数字</option>
                    <option value="boolean">布尔</option>
                </select>
            </div>
            <div className="flex gap-2">
                {newType === 'boolean' ? (
                     <select 
                        value={newValue} 
                        onChange={e => setNewValue(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                    >
                        <option value="">选择...</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                ) : (
                    <input 
                        type={newType === 'number' ? 'number' : 'text'} 
                        placeholder="值" 
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                    />
                )}
                <button 
                    onClick={handleAdd}
                    disabled={!newKey || !newValue}
                    className="px-3 py-1 bg-[var(--end-yellow)] text-black text-xs font-bold rounded disabled:opacity-50"
                >
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            </div>
        </div>

        {/* Variable List */}
        <div className="space-y-2">
            {Object.entries(localVars).length === 0 && (
                <div className="text-center text-xs text-slate-400 py-4 italic">
                    暂无变量。
                </div>
            )}
            {Object.entries(localVars).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-white border border-slate-100 rounded shadow-sm">
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-xs text-[var(--end-text-main)] truncate" title={key}>{key}</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate" title={String(val)}>
                            {typeof val === 'boolean' ? (val ? 'true' : 'false') : val}
                            <span className="ml-1 opacity-50">({typeof val})</span>
                        </span>
                    </div>
                    <button 
                        onClick={() => handleDelete(key)}
                        className="text-red-400 hover:text-red-600 p-1"
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                </div>
            ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
        <button 
          onClick={handleSave}
          className="w-full bg-[var(--end-yellow)] hover:bg-[var(--end-yellow-hover)] text-black font-bold py-2 px-4 rounded text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faSave} /> 保存变量
        </button>
      </div>
    </div>
  );
}
