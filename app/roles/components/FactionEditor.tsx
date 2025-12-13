import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faPlus, faUpload, faUsers } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import { Faction } from '../types';

interface FactionEditorProps {
  onSave: (faction: Faction) => void;
  onClose: () => void;
}

export default function FactionEditor({ onSave, onClose }: FactionEditorProps) {
  const [formData, setFormData] = useState<Faction>({
    id: uuidv4(),
    name: '',
    description: '',
    logo: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local object URL for preview
    const url = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, logo: url }));
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--end-surface)]/95 border border-[var(--end-border)] shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-lg flex flex-col relative backdrop-blur-sm"
      >
        {/* Deco Corners */}
        <div className="absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-[var(--end-yellow)] z-10" />
        <div className="absolute -top-[1px] -right-[1px] w-6 h-6 border-t-2 border-r-2 border-[var(--end-yellow)] z-10" />
        <div className="absolute -bottom-[1px] -left-[1px] w-6 h-6 border-b-2 border-l-2 border-[var(--end-yellow)] z-10" />
        <div className="absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-[var(--end-yellow)] z-10" />

        {/* Header */}
        <div className="p-4 border-b border-[var(--end-border)] flex justify-between items-center bg-black/40 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--end-yellow)]/50 to-transparent" />
          
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 flex items-center justify-center bg-[var(--end-yellow)] text-black font-bold rounded-sm">
                 <FontAwesomeIcon icon={faUsers} />
             </div>
             <div>
                 <h2 className="text-lg font-bold text-[var(--end-text-main)] uppercase tracking-wider">
                    新建势力
                 </h2>
                 <p className="text-[10px] text-[var(--end-text-dim)] font-mono">NEW FACTION ENTRY</p>
             </div>
          </div>
          
          <button onClick={onClose} className="text-[var(--end-text-sub)] hover:text-black hover:bg-[var(--end-yellow)] w-8 h-8 flex items-center justify-center transition-all border border-transparent hover:border-[var(--end-yellow)]">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 bg-[var(--end-surface)] space-y-6">
            <div className="flex items-center gap-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-[var(--end-border)] hover:border-[var(--end-yellow)] hover:bg-[var(--end-yellow)]/5 flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden"
                >
                    {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faUpload} className="text-xl text-[var(--end-text-dim)] group-hover:text-[var(--end-yellow)] mb-2 transition-colors" />
                            <span className="text-[8px] font-bold text-[var(--end-text-sub)] uppercase tracking-widest text-center">上传<br/>图标</span>
                        </>
                    )}
                </div>
                
                <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">势力名称</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-2 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] transition-colors font-mono text-sm"
                            placeholder="输入势力名称..."
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">势力简介</label>
                <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] min-h-[120px] font-mono text-sm leading-relaxed"
                    placeholder="输入势力背景描述..."
                />
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--end-border)] bg-black/40 relative flex justify-end gap-4">
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-[var(--end-yellow)]/50 to-transparent" />
            <button 
                onClick={onClose}
                className="px-6 py-2 text-xs font-bold text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] uppercase tracking-widest transition-colors border border-transparent hover:border-[var(--end-text-dim)]"
            >
                取消
            </button>
            <button 
                onClick={handleSubmit}
                disabled={!formData.name}
                className={`px-8 py-2 bg-[var(--end-yellow)] text-black font-bold text-xs uppercase tracking-widest transition-colors shadow-lg shadow-[var(--end-yellow)]/20 ${!formData.name ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--end-yellow-dim)]'}`}
            >
                创建势力
            </button>
        </div>

        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept="image/*"
        />
      </motion.div>
    </div>
  );
}
