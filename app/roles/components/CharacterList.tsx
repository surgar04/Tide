import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUser, faUserTag, faSearch, faCube, faImage } from '@fortawesome/free-solid-svg-icons';
import { GameCharacter } from '../types';

interface CharacterListProps {
  characters: GameCharacter[];
  onEdit: (character: GameCharacter) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function CharacterList({ characters, onEdit, onDelete, onAdd }: CharacterListProps) {
  const [filterType, setFilterType] = useState<'All' | 'Player' | 'NPC' | 'Monster'>('All');
  const [search, setSearch] = useState('');

  const filtered = characters.filter(c => {
    if (filterType !== 'All' && c.type !== filterType) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit">
          {['All', 'Player', 'NPC', 'Monster'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === type ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {type === 'All' ? '全部' : type === 'Player' ? '角色' : type === 'NPC' ? 'NPC' : '怪物'}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索角色..."
              className="pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--end-yellow)] w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={onAdd}
            className="px-4 py-2 bg-[var(--end-yellow)] hover:bg-[var(--end-yellow-hover)] text-black font-bold rounded-lg text-sm flex items-center gap-2 shadow-sm transition-transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faPlus} /> 创建角色
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors group">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-transform duration-300">
            <FontAwesomeIcon icon={faUserTag} className="text-4xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">暂无角色数据</h3>
          <p className="text-slate-500 text-sm mb-8 max-w-xs text-center leading-relaxed">
            还没有创建任何角色。开始设计你的第一个游戏角色吧！
          </p>
          <button 
            onClick={onAdd} 
            className="px-6 py-2.5 bg-[var(--end-yellow)] hover:bg-[var(--end-yellow-hover)] text-black font-bold rounded-full text-sm shadow-lg shadow-[var(--end-yellow)]/20 transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} /> 创建新角色
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(char => {
            const portrait = char.assets.find(a => a.type === 'portrait');
            
            return (
              <div key={char.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[var(--end-yellow)] transition-all duration-300 overflow-hidden flex flex-col h-full relative">
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3 z-10">
                    {char.type === 'NPC' && <span className="px-2.5 py-1 bg-purple-500/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">NPC</span>}
                    {char.type === 'Player' && <span className="px-2.5 py-1 bg-blue-500/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">Player</span>}
                    {char.type === 'Monster' && <span className="px-2.5 py-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">Enemy</span>}
                </div>

                {/* Image Area */}
                <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                  {portrait ? (
                    <>
                      <img src={portrait.url} alt={char.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                      <FontAwesomeIcon icon={faUser} className="text-5xl mb-3 opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50">No Portrait</span>
                    </div>
                  )}
                  
                  {/* Actions Overlay */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(char); }}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur hover:bg-[var(--end-yellow)] text-slate-600 hover:text-black shadow-lg flex items-center justify-center transition-colors"
                      title="编辑"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(char.id); }}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur hover:bg-red-500 text-slate-600 hover:text-white shadow-lg flex items-center justify-center transition-colors"
                      title="删除"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </div>

                  {/* Name & Region Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent">
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-sm truncate">{char.name}</h3>
                    <div className="flex items-center justify-between">
                        {char.region ? (
                            <p className="text-xs text-slate-300 flex items-center gap-1.5 truncate max-w-[70%]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--end-yellow)]"></span>
                            {char.region}
                            </p>
                        ) : (
                            <div />
                        )}
                        <div className="flex gap-2 text-white/60 text-[10px] font-mono">
                            {char.assets.length > 0 && (
                                <span className="flex items-center gap-1" title="Assets">
                                    <FontAwesomeIcon icon={faImage} /> {char.assets.length}
                                </span>
                            )}
                        </div>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="px-4 py-3 bg-white flex justify-between items-center border-t border-slate-100">
                  <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Stats: {Object.keys(char.initialStats).length}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">
                    ID: {char.id.split('-')[0]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
