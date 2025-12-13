"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faSearch, faHashtag, faGlobe, faUsers, faClock, faPlus } from "@fortawesome/free-solid-svg-icons";
import { PageHeader } from "@/components/ui/PageHeader";
import WikiDetail from "./components/WikiDetail";
import WikiEditor from "./components/WikiEditor";
import { WikiEntry } from "./types";

const PRESET_ENTRIES: WikiEntry[] = [
    {
        id: "WIKI-000",
        title: "现代纪元的灵气复苏",
        category: "世界观",
        date: "2025-12-13",
        content: `起源：洪荒的遗产 
混沌初开，洪荒时代奠定了仙界的根基，衍生出凡人界、仙界、魔界等诸多界域。洪荒时代结束后，宇宙进入了一段漫长的沉寂。直到“现代纪元”的到来——一场突如其来的灵气复苏与科技爆发的交织，彻底改变了世界的面貌。 

凡人界：隐匿于都市的修仙者 
凡人界如同一颗蔚蓝的科技星球，摩天大楼林立，互联网覆盖全球，高铁与飞行器穿梭不息。然而，在这看似寻常的现代社会之下，隐藏着一个正在觉醒的修仙体系。 
2020年代，一场全球性的“灵气风暴”激活了深埋地下的洪荒遗迹，导致部分人类灵根觉醒，成为了“觉醒者”。他们可能是程序员、学生、医生，也可能是街头巷尾的普通人。 
宗门伪装成科技公司，如“灵气科技集团”；半妖、半魔等混血种族隐匿于人群中；政府设立了“超自然管理局”以维持秩序。灵石通过矿机开采，灵草依靠基因工程培育，妖兽材料在生物实验室中提取——科技与灵气，正在这里悄然融合。 

仙界与魔界：传统与现代的碰撞 
仙界，洪荒时代的遗存，如今也迎来了现代的影响。仙庭之中，高科技宫殿与云海圣殿并存；仙人通过“仙网”交流，虚拟现实洞天成为新的修炼圣地。 
魔界则更为诡谲，九层深渊化作“数字地狱”，魔修利用黑客技术入侵凡人界的网络，发动“魔网病毒”等全球性危机。魔气与数据流交织，构成了一片混沌而危险的领域。 

此外，妖界、鬼界、冥界等界域也在科技的影响下演变：妖界融合基因科技，鬼界如同网络幽灵世界，冥界则建立起基于大数据的轮回管理系统。 
而连接所有界域的，是一个由科技创造的虚拟界——这里是虚拟修炼、跨界交易与信息交汇的数字空间。 

修炼之路：科技辅助下的问道之旅 
觉醒者从现代都市起步，修炼方式也极具时代特色： 
使用VR头盔模拟天劫，在虚拟洞天中加速修炼； 
通过手机APP监控灵气，实现自动打坐； 
基因编辑技术可提升灵根天赋，但失败可能导致变异； 
炼制“灵科技”装备，如量子飞剑、灵能手机，让修仙融入日常生活。 

然而，过度依赖科技会引发“科技劫”——AI反噬、电磁风暴、灵力干扰等风险随之而来。修仙者必须在古法修炼与现代便利之间找到平衡，方能稳步提升，最终渡劫飞升。 

社会网络：宗门、银行、商会与血脉 
在觉醒者的社会中，宗门常以公司形式存在，弟子晋升如职场晋升；银行提供灵石存储与跨界转账，甚至发放“修仙贷”；商会则组织贸易、拍卖，黑市之中暗流涌动。 
血脉成为重要的身份标志：人类、半妖、半魔、半龙……种族影响修炼方式、阵营亲和与社会关系。通过“血脉提纯”任务，混血者有望觉醒远古力量，但这条路同样布满风险。 

秩序与冲突：业力、阵营与天劫 
宇宙的核心法则之一是业力系统，由受损的“天道符盘”自动记录每个行为对世界平衡的影响。业力值决定修仙者是偏向仙道、魔道还是中立，影响天劫强度、资源获取乃至社会信任。 
阵营之间冲突不断：科技公司与传统宗门的理念之争、魔界网络入侵的全球危机、血脉种族之间的明争暗斗……每一次选择，都可能改变世界的走向。 

未来：平衡与飞升 
这个世界既充满机遇，也布满陷阱。科技提供捷径，但也带来反噬；血脉赋予力量，却也伴随诅咒；业力记录功过，天道自有平衡。 
修仙者最终的目标仍是飞升——渡过天劫，进入仙界，甚至探索更遥远的界域。而他们的旅程，将从眼前这座充满灵气与代码的现代都市开始。`,
        tags: ["修仙", "赛博", "世界观", "灵气复苏"]
    }
];

export default function WikiPage() {
  const [entries, setEntries] = useState<WikiEntry[]>(PRESET_ENTRIES);
  const [selectedEntry, setSelectedEntry] = useState<WikiEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveEntry = (newEntry: WikiEntry) => {
    setEntries(prev => [newEntry, ...prev]);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pt-24 px-8 pb-12">
      <AnimatePresence>
        {selectedEntry && (
          <WikiDetail 
            entry={selectedEntry} 
            onClose={() => setSelectedEntry(null)} 
          />
        )}
        {isEditing && (
            <WikiEditor 
                onSave={handleSaveEntry}
                onClose={() => setIsEditing(false)}
            />
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader 
          title="百科资料库" 
          description="游戏百科资料库 [KNOWLEDGE BASE]"
        >
            <div className="flex gap-4">
                <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--end-yellow)] text-black font-bold text-sm uppercase tracking-wider hover:bg-[var(--end-yellow-dim)] transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    建设 Wiki
                </button>
                <div className="relative group w-64">
                    <input 
                        type="text" 
                        placeholder="搜索..." 
                        className="w-full bg-black/20 border border-[var(--end-border)] text-[var(--end-text-main)] px-4 py-2 text-sm font-mono focus:outline-none focus:border-[var(--end-yellow)] transition-colors"
                        disabled
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--end-text-dim)]" />
                </div>
            </div>
        </PageHeader>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--end-surface)] border border-[var(--end-border)] p-4 rounded-lg sticky top-32"
            >
              <h3 className="text-[var(--end-yellow)] font-bold text-xs tracking-widest mb-4 border-b border-[var(--end-border)] pb-2">
                分类目录
              </h3>
              
              <ul className="space-y-1">
                {[
                  { name: "世界观", icon: faGlobe, active: true },
                  { name: "势力档案", icon: faUsers },
                  { name: "时间线", icon: faClock },
                  { name: "术语表", icon: faHashtag },
                  { name: "玩法指南", icon: faBook },
                ].map((item, index) => (
                  <li key={index}>
                    <button 
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                        item.active 
                          ? "text-[var(--end-text-main)] bg-[var(--end-yellow)]/10 border-l-2 border-[var(--end-yellow)]" 
                          : "text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/5 border-l-2 border-transparent"
                      }`}
                    >
                      <FontAwesomeIcon icon={item.icon} className={`w-4 ${item.active ? "text-[var(--end-yellow)]" : "text-[var(--end-text-dim)]"}`} />
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Welcome Banner */}
              <div className="relative overflow-hidden bg-[var(--end-surface)] border border-[var(--end-border)] p-8 mb-8 group">
                {/* Background Decor */}
                <div className="absolute -right-8 -bottom-8 opacity-5 rotate-12 pointer-events-none">
                    <FontAwesomeIcon icon={faGlobe} className="text-9xl" />
                </div>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--end-yellow)]/50 to-transparent" />
                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[var(--end-yellow)]/50 to-transparent" />
                <div className="absolute left-0 top-8 w-[2px] h-12 bg-[var(--end-yellow)]" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-2 py-0.5 bg-[var(--end-yellow)]/10 text-[var(--end-yellow)] border border-[var(--end-yellow)] text-[10px] font-bold font-mono tracking-widest uppercase">
                            System Message
                        </span>
                        <span className="text-[10px] text-[var(--end-text-dim)] font-mono tracking-widest">
                            // WELCOME_PACKET_V1.0
                        </span>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-[var(--end-text-main)] mb-4 tracking-tight uppercase italic">
                        Wiki 资料库
                    </h2>
                    
                    <p className="text-[var(--end-text-sub)] leading-relaxed max-w-2xl text-sm border-l border-[var(--end-border)] pl-4">
                        这里收录了游戏所有的设定资料、背景故事以及详细的数值档案。<br/>
                        当前板块正在建设中，更多内容将陆续开放。请查阅 <span className="text-[var(--end-yellow)]">最新更新</span> 获取更多信息。
                    </p>
                </div>
              </div>

              {/* Recent Updates */}
              <h3 className="flex items-center gap-2 text-[var(--end-text-main)] font-bold mb-6">
                <span className="w-1 h-6 bg-[var(--end-yellow)]"></span>
                最近更新 / RECENT UPDATES
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {entries.length === 0 ? (
                    <div className="col-span-2 text-center py-12 border border-dashed border-[var(--end-border)] text-[var(--end-text-sub)]">
                        <p className="font-mono text-sm">DATABASE EMPTY // NO ENTRIES FOUND</p>
                        <p className="text-xs mt-2 opacity-60">请点击上方 "建设 WIKI" 按钮添加新档案</p>
                    </div>
                ) : (
                    entries.map((entry) => (
                    <div 
                        key={entry.id} 
                        onClick={() => setSelectedEntry(entry)}
                        className="group bg-[var(--end-surface)] border border-[var(--end-border)] hover:border-[var(--end-yellow)] transition-colors p-4 cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-mono text-[var(--end-yellow)] border border-[var(--end-yellow)] px-1">NEW</span>
                        <span className="text-[10px] text-[var(--end-text-dim)] font-mono">{entry.date}</span>
                        </div>
                        <h4 className="text-[var(--end-text-main)] font-bold mb-2 group-hover:text-[var(--end-yellow)] transition-colors">
                        {entry.title}
                        </h4>
                        <p className="text-xs text-[var(--end-text-sub)] line-clamp-2">
                        {entry.content}
                        </p>
                    </div>
                    ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
