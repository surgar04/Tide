import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faPlus, faTrash, faUpload, faImage, faCube, faUser, faChartBar, faDna, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { GameCharacter, CharacterType, CharacterAsset, Faction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

interface CharacterEditorProps {
  character?: GameCharacter;
  factions: Faction[];
  onSave: (character: GameCharacter) => void;
  onClose: () => void;
  onAddFaction: () => void;
}

export default function CharacterEditor({ character, factions, onSave, onClose, onAddFaction }: CharacterEditorProps) {
  const [formData, setFormData] = useState<GameCharacter>({
    id: character?.id || uuidv4(),
    name: character?.name || '',
    type: character?.type || 'Player',
    faction: character?.faction || '',
    region: character?.region || '',
    description: character?.description || '',
    initialStats: character?.initialStats || {
        "HP": "100",
        "ATK": "10",
        "DEF": "5",
        "SPD": "100"
    },
    assets: character?.assets || [],
    createdAt: character?.createdAt || Date.now(),
    updatedAt: Date.now()
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'stats' | 'assets'>('basic');
  
  // Stats State
  const [newStatKey, setNewStatKey] = useState('');
  const [newStatValue, setNewStatValue] = useState('');

  // Asset State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<CharacterAsset['type']>('portrait');

  const handleInputChange = (field: keyof GameCharacter, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStat = () => {
    if (!newStatKey.trim()) return;
    setFormData(prev => ({
      ...prev,
      initialStats: {
        ...prev.initialStats,
        [newStatKey.trim()]: newStatValue
      }
    }));
    setNewStatKey('');
    setNewStatValue('');
  };

  const removeStat = (key: string) => {
    const newStats = { ...formData.initialStats };
    delete newStats[key];
    setFormData(prev => ({ ...prev, initialStats: newStats }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, we would upload to server here.
    // For now, create a local object URL for preview.
    const url = URL.createObjectURL(file);
    
    const newAsset: CharacterAsset = {
      id: uuidv4(),
      type: uploadType,
      url: url,
      name: file.name,
      file: file
    };

    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, newAsset]
    }));

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAsset = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter(a => a.id !== assetId)
    }));
  };

  const triggerUpload = (type: CharacterAsset['type']) => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--end-surface)] border border-[var(--end-border)] rounded-lg shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative"
      >
        {/* Deco Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--end-yellow)]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--end-yellow)]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--end-yellow)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--end-yellow)]" />

        {/* Header */}
        <div className="p-4 border-b border-[var(--end-border)] flex justify-between items-center bg-[var(--end-surface-hover)]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 flex items-center justify-center bg-[var(--end-yellow)] text-black font-bold rounded-sm">
                 <FontAwesomeIcon icon={character ? faUser : faPlus} />
             </div>
             <div>
                 <h2 className="text-lg font-bold text-[var(--end-text-main)] uppercase tracking-wider">
                    {character ? '编辑人员档案' : '新建人员档案'}
                 </h2>
                 <p className="text-[10px] text-[var(--end-text-dim)] font-mono">ID: {formData.id}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/10 w-8 h-8 flex items-center justify-center transition-colors">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-48 bg-black/20 border-r border-[var(--end-border)] flex flex-col p-2 gap-1">
                {[
                    { id: 'basic', label: '基础信息', icon: faDna },
                    { id: 'stats', label: '属性参数', icon: faChartBar },
                    { id: 'assets', label: '视觉资源', icon: faImage },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-left flex items-center gap-3 transition-all border-l-2
                            ${activeTab === tab.id 
                            ? 'bg-[var(--end-yellow)]/10 text-[var(--end-yellow)] border-[var(--end-yellow)]' 
                            : 'border-transparent text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/5'}
                        `}
                    >
                        <FontAwesomeIcon icon={tab.icon} className="w-3" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-[var(--end-surface)]">
            
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
                <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">代号 / 姓名</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-4 py-3 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] transition-colors font-mono text-lg"
                                placeholder="输入姓名..."
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">分类</label>
                                <select 
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className="w-full px-4 py-2 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] font-mono text-sm"
                                >
                                    <option value="Player">角色 (CHARACTER)</option>
                                    <option value="NPC">NPC (NPC)</option>
                                    <option value="Monster">敌对单位 (HOSTILE)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">所属势力</label>
                                {factions.length > 0 ? (
                                    <div className="flex gap-2">
                                        <select 
                                            value={formData.faction}
                                            onChange={(e) => handleInputChange('faction', e.target.value)}
                                            className="w-full px-4 py-2 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] font-mono text-sm"
                                        >
                                            <option value="">-- 选择势力 --</option>
                                            {factions.map(f => (
                                                <option key={f.id} value={f.name}>{f.name}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={onAddFaction}
                                            className="px-3 bg-[var(--end-surface-hover)] border border-[var(--end-border)] text-[var(--end-text-main)] hover:border-[var(--end-yellow)] hover:text-[var(--end-yellow)] transition-colors"
                                            title="新建势力"
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 p-3 bg-black/30 border border-[var(--end-border)] border-dashed">
                                        <span className="text-xs text-[var(--end-text-sub)]">暂无可用势力</span>
                                        <button 
                                            onClick={onAddFaction}
                                            className="text-xs font-bold text-[var(--end-yellow)] hover:underline uppercase tracking-wider"
                                        >
                                            立即新建势力
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">区域 / 阵营</label>
                                <input 
                                    type="text" 
                                    value={formData.region}
                                    onChange={(e) => handleInputChange('region', e.target.value)}
                                    className="w-full px-4 py-2 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] font-mono text-sm"
                                    placeholder="所属区域..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">描述与设定</label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-4 py-3 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] min-h-[200px] font-mono text-sm leading-relaxed"
                                placeholder="输入生平数据..."
                            />
                        </div>
                    </div>
                    
                    <div className="col-span-4">
                        <div className="bg-black/20 border border-[var(--end-border)] p-4 h-full flex flex-col items-center justify-center gap-4 text-center">
                            <div className="w-32 h-32 rounded-full bg-[var(--end-surface-hover)] flex items-center justify-center border-2 border-[var(--end-border)] overflow-hidden">
                                {formData.assets.find(a => a.type === 'portrait') ? (
                                    <img src={formData.assets.find(a => a.type === 'portrait')?.url} className="w-full h-full object-cover" />
                                ) : (
                                    <FontAwesomeIcon icon={faUser} className="text-4xl text-[var(--end-text-dim)]" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[var(--end-text-main)] uppercase">{formData.name || '未知'}</h3>
                                <p className="text-[10px] text-[var(--end-text-dim)] font-mono">{formData.type}</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            )}
            
            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-black/20 p-6 border border-[var(--end-border)]">
                        <h3 className="text-xs font-bold text-[var(--end-text-main)] uppercase tracking-widest mb-4 border-b border-[var(--end-border)] pb-2">基础属性</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                             {/* Preset Common Stats */}
                             {['HP', 'ATK', 'DEF', 'SPD'].map(stat => (
                                 <div key={stat} className="flex items-center gap-2">
                                     <span className="w-12 text-[10px] font-bold text-[var(--end-text-dim)] font-mono">{stat}</span>
                                     <input 
                                         type="text"
                                         value={formData.initialStats[stat] || ''}
                                         onChange={(e) => setFormData(prev => ({
                                             ...prev,
                                             initialStats: { ...prev.initialStats, [stat]: e.target.value }
                                         }))}
                                         className="flex-1 bg-black/40 border border-[var(--end-border)] px-2 py-1 text-sm text-[var(--end-text-main)] font-mono focus:border-[var(--end-yellow)] focus:outline-none"
                                     />
                                 </div>
                             ))}
                        </div>

                        <h3 className="text-xs font-bold text-[var(--end-text-main)] uppercase tracking-widest mb-4 border-b border-[var(--end-border)] pb-2 pt-4">自定义参数</h3>
                        
                        <div className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                value={newStatKey}
                                onChange={(e) => setNewStatKey(e.target.value)}
                                className="flex-1 px-3 py-2 bg-black/40 border border-[var(--end-border)] text-sm text-[var(--end-text-main)] font-mono focus:border-[var(--end-yellow)] focus:outline-none"
                                placeholder="参数名"
                            />
                            <input 
                                type="text" 
                                value={newStatValue}
                                onChange={(e) => setNewStatValue(e.target.value)}
                                className="flex-1 px-3 py-2 bg-black/40 border border-[var(--end-border)] text-sm text-[var(--end-text-main)] font-mono focus:border-[var(--end-yellow)] focus:outline-none"
                                placeholder="数值"
                            />
                            <button 
                                onClick={handleAddStat}
                                className="px-4 bg-[var(--end-yellow)] text-black font-bold text-xs uppercase tracking-wider hover:bg-[var(--end-yellow-dim)] transition-colors"
                            >
                                添加
                            </button>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(formData.initialStats).filter(([k]) => !['HP', 'ATK', 'DEF', 'SPD'].includes(k)).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between bg-black/30 p-2 border-l-2 border-[var(--end-yellow)]">
                                    <div className="flex gap-4">
                                        <span className="text-xs font-bold text-[var(--end-text-sub)] font-mono uppercase w-24">{key}</span>
                                        <span className="text-xs text-[var(--end-text-main)] font-mono">{value}</span>
                                    </div>
                                    <button onClick={() => removeStat(key)} className="text-[var(--end-text-dim)] hover:text-red-500 transition-colors">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Assets Tab */}
            {activeTab === 'assets' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="grid grid-cols-3 gap-6">
                         {/* Upload Areas */}
                         <div 
                            onClick={() => triggerUpload('portrait')}
                            className="aspect-[3/4] border-2 border-dashed border-[var(--end-border)] hover:border-[var(--end-yellow)] hover:bg-[var(--end-yellow)]/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                         >
                             <FontAwesomeIcon icon={faUser} className="text-4xl text-[var(--end-text-dim)] group-hover:text-[var(--end-yellow)] mb-4 transition-colors" />
                             <span className="text-xs font-bold text-[var(--end-text-sub)] uppercase tracking-widest">上传头像</span>
                         </div>
                         
                         <div 
                            onClick={() => triggerUpload('model')}
                            className="aspect-[3/4] border-2 border-dashed border-[var(--end-border)] hover:border-[var(--end-yellow)] hover:bg-[var(--end-yellow)]/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                         >
                             <FontAwesomeIcon icon={faCube} className="text-4xl text-[var(--end-text-dim)] group-hover:text-[var(--end-yellow)] mb-4 transition-colors" />
                             <span className="text-xs font-bold text-[var(--end-text-sub)] uppercase tracking-widest">上传 3D 模型</span>
                         </div>

                         <div 
                            onClick={() => triggerUpload('texture')}
                            className="aspect-[3/4] border-2 border-dashed border-[var(--end-border)] hover:border-[var(--end-yellow)] hover:bg-[var(--end-yellow)]/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                         >
                             <FontAwesomeIcon icon={faImage} className="text-4xl text-[var(--end-text-dim)] group-hover:text-[var(--end-yellow)] mb-4 transition-colors" />
                             <span className="text-xs font-bold text-[var(--end-text-sub)] uppercase tracking-widest">上传贴图</span>
                         </div>
                     </div>

                     <div className="bg-black/20 border border-[var(--end-border)] p-4 mt-8">
                        <h3 className="text-xs font-bold text-[var(--end-text-main)] uppercase tracking-widest mb-4 border-b border-[var(--end-border)] pb-2">资源列表</h3>
                        <div className="space-y-2">
                            {formData.assets.length === 0 && (
                                <p className="text-xs text-[var(--end-text-dim)] font-mono text-center py-4">暂无资源链接</p>
                            )}
                            {formData.assets.map(asset => (
                                <div key={asset.id} className="flex items-center justify-between bg-black/40 p-3 border border-[var(--end-border)]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-black/50 border border-[var(--end-border)] flex items-center justify-center">
                                            {asset.type === 'portrait' || asset.type === 'texture' ? (
                                                <img src={asset.url} className="w-full h-full object-cover" />
                                            ) : (
                                                <FontAwesomeIcon icon={faCube} className="text-[var(--end-text-dim)]" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--end-text-main)] uppercase">{asset.name}</p>
                                            <p className="text-[10px] text-[var(--end-text-dim)] font-mono uppercase tracking-widest">{asset.type}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeAsset(asset.id)} className="text-[var(--end-text-dim)] hover:text-red-500 transition-colors px-2">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            )}

            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--end-border)] bg-[var(--end-surface-hover)] flex justify-end gap-4">
            <button 
                onClick={onClose}
                className="px-6 py-2 text-xs font-bold text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] uppercase tracking-widest transition-colors"
            >
                取消
            </button>
            <button 
                onClick={() => onSave(formData)}
                className="px-8 py-2 bg-[var(--end-yellow)] text-black font-bold text-xs uppercase tracking-widest hover:bg-[var(--end-yellow-dim)] transition-colors shadow-lg shadow-[var(--end-yellow)]/20"
            >
                保存数据
            </button>
        </div>

        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept={uploadType === 'model' ? '.glb,.gltf,.fbx,.obj' : 'image/*'}
        />
      </motion.div>
    </div>
  );
}