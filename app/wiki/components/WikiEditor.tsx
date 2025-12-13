import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faTag, faPlus } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import { WikiEntry } from '../types';

interface WikiEditorProps {
  onSave: (entry: WikiEntry) => void;
  onClose: () => void;
}

export default function WikiEditor({ onSave, onClose }: WikiEditorProps) {
  const [formData, setFormData] = useState<Partial<WikiEntry>>({
    title: '',
    category: '世界观',
    content: '',
    tags: []
  });

  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) return;

    const newEntry: WikiEntry = {
      id: `WIKI-${uuidv4().slice(0, 8).toUpperCase()}`,
      title: formData.title,
      category: formData.category || '世界观',
      content: formData.content,
      tags: formData.tags || [],
      date: new Date().toLocaleDateString().replace(/\//g, '.')
    };

    onSave(newEntry);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--end-surface)]/95 border border-[var(--end-border)] shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-4xl h-[85vh] flex flex-col relative backdrop-blur-sm"
      >
        {/* Deco Corners */}
        <div className="absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-[var(--end-yellow)] z-10" />
        <div className="absolute -top-[1px] -right-[1px] w-6 h-6 border-t-2 border-r-2 border-[var(--end-yellow)] z-10" />
        <div className="absolute -bottom-[1px] -left-[1px] w-6 h-6 border-b-2 border-l-2 border-[var(--end-yellow)] z-10" />
        <div className="absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-[var(--end-yellow)] z-10" />

        {/* Tech Decor */}
        <div className="absolute top-10 left-0 w-[1px] h-20 bg-gradient-to-b from-[var(--end-yellow)]/50 to-transparent" />
        <div className="absolute bottom-10 right-0 w-[1px] h-20 bg-gradient-to-t from-[var(--end-yellow)]/50 to-transparent" />

        {/* Header */}
        <div className="p-4 border-b border-[var(--end-border)] flex justify-between items-center bg-black/40 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--end-yellow)]/50 to-transparent" />
          
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 flex items-center justify-center bg-[var(--end-yellow)] text-black font-bold rounded-sm">
                 <FontAwesomeIcon icon={faPlus} />
             </div>
             <div>
                 <h2 className="text-lg font-bold text-[var(--end-text-main)] uppercase tracking-wider">
                    建设 Wiki 档案
                 </h2>
                 <p className="text-[10px] text-[var(--end-text-dim)] font-mono">NEW ENTRY CREATION</p>
             </div>
          </div>
          
          <button onClick={onClose} className="text-[var(--end-text-sub)] hover:text-black hover:bg-[var(--end-yellow)] w-8 h-8 flex items-center justify-center transition-all border border-transparent hover:border-[var(--end-yellow)]">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[var(--end-surface)]">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Title & Category */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">标题</label>
                        <input 
                            type="text" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-4 py-3 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] transition-colors font-mono text-lg"
                            placeholder="输入档案标题..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">分类</label>
                        <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full px-4 py-3.5 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] font-mono text-sm"
                        >
                            <option value="世界观">世界观</option>
                            <option value="势力档案">势力档案</option>
                            <option value="时间线">时间线</option>
                            <option value="术语表">术语表</option>
                            <option value="玩法指南">玩法指南</option>
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">正文内容</label>
                    <textarea 
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        className="w-full px-4 py-3 bg-black/30 border border-[var(--end-border)] text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] min-h-[400px] font-mono text-sm leading-relaxed"
                        placeholder="支持 Markdown 格式..."
                    />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest">标签</label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {formData.tags?.map(tag => (
                            <span key={tag} className="flex items-center gap-2 px-3 py-1 bg-[var(--end-yellow)]/10 border border-[var(--end-yellow)] text-xs text-[var(--end-yellow)]">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="hover:text-white"><FontAwesomeIcon icon={faTimes} /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            className="flex-1 px-3 py-2 bg-black/30 border border-[var(--end-border)] text-sm text-[var(--end-text-main)] font-mono focus:border-[var(--end-yellow)] focus:outline-none"
                            placeholder="添加标签..."
                        />
                        <button 
                            onClick={handleAddTag}
                            className="px-4 bg-[var(--end-surface-hover)] border border-[var(--end-border)] text-[var(--end-text-main)] text-xs hover:border-[var(--end-yellow)] hover:text-[var(--end-yellow)] transition-colors"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                </div>
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
                className="px-8 py-2 bg-[var(--end-yellow)] text-black font-bold text-xs uppercase tracking-widest hover:bg-[var(--end-yellow-dim)] transition-colors shadow-lg shadow-[var(--end-yellow)]/20"
            >
                发布档案
            </button>
        </div>

      </motion.div>
    </div>
  );
}
