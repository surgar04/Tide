import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faPlus, faTrash, faUpload, faImage, faCube, faUser } from '@fortawesome/free-solid-svg-icons';
import { GameCharacter, CharacterType, CharacterAsset } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface CharacterEditorProps {
  character?: GameCharacter;
  onSave: (character: GameCharacter) => void;
  onClose: () => void;
}

export default function CharacterEditor({ character, onSave, onClose }: CharacterEditorProps) {
  const [formData, setFormData] = useState<GameCharacter>({
    id: character?.id || uuidv4(),
    name: character?.name || '',
    type: character?.type || 'Player',
    region: character?.region || '',
    description: character?.description || '',
    initialStats: character?.initialStats || {},
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FontAwesomeIcon icon={character ? faUser : faPlus} className="text-[var(--end-yellow)]" />
            {character ? '编辑角色' : '创建新角色'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'basic' ? 'border-[var(--end-yellow)] text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            基础信息
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'stats' ? 'border-[var(--end-yellow)] text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            属性设定
          </button>
          <button 
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'assets' ? 'border-[var(--end-yellow)] text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            美术资源
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">角色名称</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--end-yellow)]"
                    placeholder="输入名称..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">类型</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--end-yellow)]"
                  >
                    <option value="Player">玩家角色 (Player)</option>
                    <option value="NPC">NPC</option>
                    <option value="Monster">怪物 (Monster)</option>
                  </select>
                </div>
              </div>

              {formData.type === 'NPC' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">所属区域</label>
                  <input 
                    type="text" 
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--end-yellow)]"
                    placeholder="例如: 主控舱段, 贝洛伯格..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">角色描述 / 背景故事</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--end-yellow)] min-h-[150px]"
                  placeholder="输入详细描述..."
                />
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4">添加初始属性</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newStatKey}
                    onChange={(e) => setNewStatKey(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="属性名 (如: HP, ATK)"
                  />
                  <input 
                    type="text" 
                    value={newStatValue}
                    onChange={(e) => setNewStatValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="初始值"
                  />
                  <button 
                    onClick={handleAddStat}
                    disabled={!newStatKey}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(formData.initialStats).length === 0 ? (
                  <div className="text-center text-slate-400 py-8 italic">暂无属性配置</div>
                ) : (
                  Object.entries(formData.initialStats).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">{key}</span>
                        <span className="text-slate-600 font-mono">{val}</span>
                      </div>
                      <button onClick={() => removeStat(key)} className="text-red-400 hover:text-red-600 p-2">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,.glb,.gltf" 
                onChange={handleFileUpload}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Portrait Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-blue-500" /> 立绘 (Portrait)
                    </h3>
                    <button onClick={() => triggerUpload('portrait')} className="text-xs text-blue-500 font-bold hover:underline">
                      <FontAwesomeIcon icon={faUpload} /> 上传
                    </button>
                  </div>
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4 min-h-[200px] flex flex-col gap-2">
                    {formData.assets.filter(a => a.type === 'portrait').map(asset => (
                      <div key={asset.id} className="relative group rounded-lg overflow-hidden border border-slate-100">
                        <img src={asset.url} alt="Portrait" className="w-full h-auto object-cover" />
                        <button 
                          onClick={() => removeAsset(asset.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      </div>
                    ))}
                    {formData.assets.filter(a => a.type === 'portrait').length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <FontAwesomeIcon icon={faImage} className="text-3xl mb-2" />
                        <span className="text-xs">暂无立绘</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* View3 Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <FontAwesomeIcon icon={faImage} className="text-purple-500" /> 三视图 (Reference)
                    </h3>
                    <button onClick={() => triggerUpload('view3')} className="text-xs text-purple-500 font-bold hover:underline">
                      <FontAwesomeIcon icon={faUpload} /> 上传
                    </button>
                  </div>
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4 min-h-[200px] flex flex-col gap-2">
                    {formData.assets.filter(a => a.type === 'view3').map(asset => (
                      <div key={asset.id} className="relative group rounded-lg overflow-hidden border border-slate-100">
                        <img src={asset.url} alt="Reference" className="w-full h-auto object-cover" />
                        <button 
                          onClick={() => removeAsset(asset.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      </div>
                    ))}
                    {formData.assets.filter(a => a.type === 'view3').length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <FontAwesomeIcon icon={faImage} className="text-3xl mb-2" />
                        <span className="text-xs">暂无三视图</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Model Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCube} className="text-orange-500" /> 3D模型 (Model)
                    </h3>
                    <button onClick={() => triggerUpload('model')} className="text-xs text-orange-500 font-bold hover:underline">
                      <FontAwesomeIcon icon={faUpload} /> 上传
                    </button>
                  </div>
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4 min-h-[200px] flex flex-col gap-2">
                    {formData.assets.filter(a => a.type === 'model').map(asset => (
                      <div key={asset.id} className="relative group rounded-lg overflow-hidden border border-slate-100 bg-slate-50 p-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCube} className="text-slate-400" />
                        <span className="text-xs truncate flex-1">{asset.name}</span>
                        <button 
                          onClick={() => removeAsset(asset.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      </div>
                    ))}
                    {formData.assets.filter(a => a.type === 'model').length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <FontAwesomeIcon icon={faCube} className="text-3xl mb-2" />
                        <span className="text-xs">暂无模型文件</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-sm"
          >
            取消
          </button>
          <button 
            onClick={() => onSave(formData)}
            disabled={!formData.name}
            className="px-6 py-2 bg-[var(--end-yellow)] hover:bg-[var(--end-yellow-hover)] text-black rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faSave} /> 保存角色
          </button>
        </div>
      </div>
    </div>
  );
}
