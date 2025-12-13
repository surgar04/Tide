import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUser, faUserTag, faSearch, faCube, faImage, faDna, faShieldHalved, faUsers } from '@fortawesome/free-solid-svg-icons';
import { GameCharacter, Faction } from '../types';
import { motion } from 'framer-motion';

interface CharacterListProps {
  characters: GameCharacter[];
  factions: Faction[];
  onEdit: (character: GameCharacter) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onAddFaction: () => void;
}

export default function CharacterList({ characters, factions, onEdit, onDelete, onAdd, onAddFaction }: CharacterListProps) {
  const [filterType, setFilterType] = useState<'All' | 'Player' | 'NPC' | 'Monster'>('All');
  const [filterFaction, setFilterFaction] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = characters.filter(c => {
    if (filterType !== 'All' && c.type !== filterType) return false;
    if (filterFaction !== 'All' && c.faction !== filterFaction) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-[var(--end-surface)] p-4 rounded-xl border border-[var(--end-border)]">
        <div className="flex flex-col gap-2 w-full md:w-auto">
            {/* Type Filter */}
            <div className="flex items-center gap-2 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
            {['All', 'Player', 'NPC', 'Monster'].map(type => (
                <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-6 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider ${
                    filterType === type 
                    ? 'bg-[var(--end-yellow)] text-black shadow-[0_0_15px_rgba(255,200,0,0.3)]' 
                    : 'text-[var(--end-text-sub)] hover:bg-white/5 hover:text-[var(--end-text-main)]'
                }`}
                >
                {type === 'All' ? '全部' : type === 'Player' ? '角色' : type === 'NPC' ? 'NPC' : '敌对'}
                </button>
            ))}
            </div>
            
            {/* Faction Filter */}
            {factions.length > 0 && (
                <div className="flex items-center gap-2 p-1 border-t border-[var(--end-border)] pt-2 mt-1 overflow-x-auto">
                    <span className="text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-widest mr-2">势力筛选:</span>
                    <button
                        onClick={() => setFilterFaction('All')}
                        className={`px-3 py-1 text-[10px] font-bold transition-all uppercase tracking-wider border border-transparent ${
                            filterFaction === 'All'
                            ? 'text-[var(--end-yellow)] border-[var(--end-yellow)]'
                            : 'text-[var(--end-text-sub)] hover:text-[var(--end-text-main)]'
                        }`}
                    >
                        全部
                    </button>
                    {factions.map(faction => (
                        <button
                            key={faction.id}
                            onClick={() => setFilterFaction(faction.name)}
                            className={`px-3 py-1 text-[10px] font-bold transition-all uppercase tracking-wider border border-transparent ${
                                filterFaction === faction.name
                                ? 'text-[var(--end-yellow)] border-[var(--end-yellow)]'
                                : 'text-[var(--end-text-sub)] hover:text-[var(--end-text-main)]'
                            }`}
                        >
                            {faction.name}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--end-text-dim)] text-xs" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索数据库..."
              className="w-full pl-9 pr-4 py-2 bg-black/20 border border-[var(--end-border)] rounded-lg text-sm text-[var(--end-text-main)] focus:outline-none focus:border-[var(--end-yellow)] transition-colors font-mono placeholder:text-[var(--end-text-dim)]"
            />
          </div>
          <button 
            onClick={onAddFaction}
            className="px-6 py-2 bg-[var(--end-surface-hover)] hover:bg-[var(--end-yellow)]/10 text-[var(--end-text-main)] hover:text-[var(--end-yellow)] font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 border border-[var(--end-border)] hover:border-[var(--end-yellow)] transition-all"
          >
            <FontAwesomeIcon icon={faUsers} /> 新建势力
          </button>
          <button 
            onClick={onAdd}
            className="px-6 py-2 bg-[var(--end-yellow)] hover:bg-[var(--end-yellow-dim)] text-black font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[var(--end-yellow)]/20 transition-all hover:scale-105"
          >
            <FontAwesomeIcon icon={faPlus} /> 新建档案
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-[var(--end-surface)] rounded-2xl border border-dashed border-[var(--end-border)] group">
          <div className="w-24 h-24 bg-[var(--end-surface-hover)] rounded-full flex items-center justify-center text-[var(--end-text-dim)] mb-6 group-hover:scale-110 group-hover:text-[var(--end-yellow)] transition-all duration-300 border border-[var(--end-border)] group-hover:border-[var(--end-yellow)]">
            <FontAwesomeIcon icon={faUserTag} className="text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-[var(--end-text-main)] mb-2 tracking-widest uppercase">未找到数据</h3>
          <p className="text-[var(--end-text-sub)] text-sm mb-8 max-w-xs text-center font-mono">
            数据库查询返回 0 个结果。请初始化新的人员条目。
          </p>
          <button 
            onClick={onAdd} 
            className="px-8 py-3 bg-transparent border border-[var(--end-yellow)] text-[var(--end-yellow)] hover:bg-[var(--end-yellow)] hover:text-black font-bold rounded-none text-xs uppercase tracking-widest transition-all flex items-center gap-3"
          >
            <FontAwesomeIcon icon={faPlus} /> 初始化
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((char, index) => {
            const portrait = char.assets.find(a => a.type === 'portrait');
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={char.id} 
                className="group bg-[var(--end-surface)] rounded-none border border-[var(--end-border)] hover:border-[var(--end-yellow)] transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                style={{
                    clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)"
                }}
              >
                {/* Tech Deco Lines */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--end-border)] to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[15px] h-[15px] bg-[var(--end-border)] group-hover:bg-[var(--end-yellow)] transition-colors" />

                {/* Type Badge */}
                <div className="absolute top-0 left-0 z-20">
                    <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-2
                        ${char.type === 'NPC' ? 'bg-purple-900/80 text-purple-200' : 
                          char.type === 'Player' ? 'bg-[var(--end-yellow)] text-black' : 
                          'bg-red-900/80 text-red-200'}
                    `}>
                        {char.type === 'NPC' ? <FontAwesomeIcon icon={faUser} /> : 
                         char.type === 'Player' ? <FontAwesomeIcon icon={faShieldHalved} /> : 
                         <FontAwesomeIcon icon={faDna} />}
                        {char.type === 'Player' ? '角色' : char.type === 'NPC' ? 'NPC' : '敌对单位'}
                    </div>
                </div>

                {/* Image Area */}
                <div className="aspect-[3/4] bg-black/40 relative overflow-hidden group-hover:bg-black/20 transition-colors">
                  {portrait ? (
                    <>
                      <img src={portrait.url} alt={char.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--end-surface)] via-transparent to-transparent opacity-90" />
                      
                      {/* Glitch Overlay Effect on Hover */}
                      <div className="absolute inset-0 bg-[var(--end-yellow)] mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity" />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--end-text-dim)] relative">
                      {/* Grid Background */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                      <FontAwesomeIcon icon={faUser} className="text-5xl mb-3 opacity-20" />
                      <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">暂无视觉数据</span>
                    </div>
                  )}
                  
                  {/* Actions Overlay */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4 group-hover:translate-x-0 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(char); }}
                      className="w-8 h-8 bg-black/80 border border-[var(--end-yellow)] text-[var(--end-yellow)] hover:bg-[var(--end-yellow)] hover:text-black flex items-center justify-center transition-colors"
                      title="编辑"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(char.id); }}
                      className="w-8 h-8 bg-black/80 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black flex items-center justify-center transition-colors"
                      title="删除"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-2xl font-bold text-[var(--end-text-main)] mb-1 uppercase tracking-tighter leading-none group-hover:text-[var(--end-yellow)] transition-colors">{char.name}</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                        {char.faction && (
                             <p className="text-[10px] text-[var(--end-text-sub)] font-mono uppercase tracking-widest flex items-center gap-2 border border-[var(--end-text-dim)] px-1">
                                <span className="w-1 h-1 bg-[var(--end-text-dim)]"></span>
                                {char.faction}
                            </p>
                        )}
                        {char.region && (
                            <p className="text-[10px] text-[var(--end-text-sub)] font-mono uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1 h-1 bg-[var(--end-yellow)]"></span>
                                {char.region}
                            </p>
                        )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 border-t border-[var(--end-border)] pt-3">
                        <div className="bg-black/30 p-1.5 border-l-2 border-[var(--end-yellow)]">
                            <span className="text-[8px] text-[var(--end-text-dim)] block uppercase tracking-widest mb-0.5">资源</span>
                            <span className="text-xs font-mono text-[var(--end-text-main)]">{char.assets.length} 个文件</span>
                        </div>
                        <div className="bg-black/30 p-1.5 border-l-2 border-[var(--end-text-dim)]">
                            <span className="text-[8px] text-[var(--end-text-dim)] block uppercase tracking-widest mb-0.5">ID</span>
                            <span className="text-xs font-mono text-[var(--end-text-main)]">#{char.id.slice(0,4)}</span>
                        </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
