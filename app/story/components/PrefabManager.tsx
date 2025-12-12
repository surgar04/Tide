import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash, faUserTag, faLink, faPalette } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import { Node } from '@xyflow/react';

interface PrefabBinding {
    id: string;
    npcName: string;
    targetNodeId: string;
    color: string;
    description?: string;
}

interface PrefabManagerProps {
    bindings: Record<string, any[]>; // name -> array of bindings? No, user said "bind name to ANY node, can bind multiple nodes"
    // Maybe structure: { "艾丝妲": [ {id: "uuid", targetNodeId: "...", color: "..."} ] }
    // Let's simplify: Array of bindings, each has a name.
    // Or map by Name.
    // Let's use the props structure passed from parent: Record<string, any[]>
    
    onUpdate: (bindings: Record<string, any[]>) => void;
    onClose: () => void;
    nodes: Node[];
}

const PRESET_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#06b6d4', // teal
    '#0ea5e9', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
];

export default function PrefabManager({ bindings, onUpdate, onClose, nodes }: PrefabManagerProps) {
    const [localBindings, setLocalBindings] = useState<Record<string, PrefabBinding[]>>({});
    const [newName, setNewName] = useState("");
    
    // Convert parent structure to local typed structure if needed, or just use it
    useEffect(() => {
        setLocalBindings(bindings || {});
    }, [bindings]);

    const handleAddBinding = (npcName: string) => {
        if (!npcName.trim()) return;
        
        const newBinding: PrefabBinding = {
            id: uuidv4().split('-')[0], // Short ID
            npcName: npcName.trim(),
            targetNodeId: '',
            color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
        };

        const currentList = localBindings[npcName] || [];
        const updatedBindings = {
            ...localBindings,
            [npcName]: [...currentList, newBinding]
        };
        
        setLocalBindings(updatedBindings);
        onUpdate(updatedBindings);
        setNewName("");
    };

    const handleRemoveBinding = (npcName: string, bindingId: string) => {
        const currentList = localBindings[npcName] || [];
        const newList = currentList.filter(b => b.id !== bindingId);
        
        let updatedBindings = { ...localBindings };
        if (newList.length === 0) {
            delete updatedBindings[npcName];
        } else {
            updatedBindings[npcName] = newList;
        }
        
        setLocalBindings(updatedBindings);
        onUpdate(updatedBindings);
    };

    const handleUpdateBinding = (npcName: string, bindingId: string, updates: Partial<PrefabBinding>) => {
        const currentList = localBindings[npcName] || [];
        
        // If updating targetNodeId, also update node type?
        // We handle this in the onChange handler below, passing both id and type if possible,
        // or we lookup here if updates contains targetNodeId.
        
        let extraUpdates = {};
        if (updates.targetNodeId) {
             const targetNode = nodes.find(n => n.id === updates.targetNodeId);
             if (targetNode) {
                 extraUpdates = { targetNodeType: targetNode.type };
             }
        }

        const newList = currentList.map(b => b.id === bindingId ? { ...b, ...updates, ...extraUpdates } : b);
        
        const updatedBindings = {
            ...localBindings,
            [npcName]: newList
        };
        
        setLocalBindings(updatedBindings);
        onUpdate(updatedBindings);
    };

    return (
        <div className="absolute top-16 right-4 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[80vh] z-50 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserTag} className="text-[var(--end-yellow)]" />
                    NPC 预制体绑定
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="输入 NPC 名字 (例如: 艾丝妲)..."
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--end-yellow)]"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddBinding(newName)}
                    />
                    <button 
                        onClick={() => handleAddBinding(newName)}
                        disabled={!newName.trim()}
                        className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {Object.entries(localBindings).length === 0 ? (
                    <div className="text-center text-slate-400 py-8 italic text-sm">
                        暂无绑定，请添加 NPC 名字开始
                    </div>
                ) : (
                    Object.entries(localBindings).map(([name, bindings]) => (
                        <div key={name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                    <span className="w-1 h-4 bg-[var(--end-yellow)] rounded-full"></span>
                                    {name}
                                </h4>
                                <button 
                                    onClick={() => handleAddBinding(name)}
                                    className="text-xs text-[var(--end-text-link)] hover:underline"
                                >
                                    + 添加绑定节点
                                </button>
                            </div>
                            
                            <div className="space-y-2 pl-3 border-l-2 border-slate-100">
                                {bindings.map(binding => (
                                    <div key={binding.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                                    [[{binding.id}]]
                                                </span>
                                                <div className="w-4 h-4 rounded-full border border-white shadow-sm cursor-pointer" 
                                                     style={{ backgroundColor: binding.color }}
                                                     title="点击切换颜色"
                                                     onClick={() => {
                                                         const nextColorIndex = (PRESET_COLORS.indexOf(binding.color) + 1) % PRESET_COLORS.length;
                                                         handleUpdateBinding(name, binding.id, { color: PRESET_COLORS[nextColorIndex] });
                                                     }}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveBinding(name, binding.id)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faLink} className="text-slate-400 w-3" />
                                            <select 
                                                value={binding.targetNodeId} 
                                                onChange={(e) => handleUpdateBinding(name, binding.id, { targetNodeId: e.target.value })}
                                                className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                                            >
                                                <option value="">-- 选择绑定的节点 --</option>
                                                {nodes.map(node => (
                                                    <option key={node.id} value={node.id}>
                                                        {(node.data as any).label || node.id} ({node.type})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}