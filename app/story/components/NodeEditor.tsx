import { useState, useEffect } from 'react';
import { StoryNodeData, ChoiceOption } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faTrash, faPenToSquare, faPlus, faMinus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';

interface NodeEditorProps {
  data: StoryNodeData;
  nodeId: string;
  onUpdate: (id: string, data: StoryNodeData) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onOpenRichEditor: () => void;
}

export default function NodeEditor({ data, nodeId, onUpdate, onClose, onDelete, onOpenRichEditor }: NodeEditorProps) {
  const [label, setLabel] = useState(data.label);
  const [tags, setTags] = useState(data.tags?.join(', ') || '');
  
  // Specific fields
  const [speaker, setSpeaker] = useState(data.speaker || '');
  const [condition, setCondition] = useState(data.condition || '');
  const [variable, setVariable] = useState(data.variable || '');
  const [value, setValue] = useState(data.value || '');
  
  // Task/Reward/Punishment fields
  const [taskStatus, setTaskStatus] = useState<'pending' | 'completed' | 'failed'>(data.taskStatus || 'pending');
  const [rewardType, setRewardType] = useState(data.rewardType || '');
  const [punishmentType, setPunishmentType] = useState(data.punishmentType || '');
  const [amount, setAmount] = useState<string | number>(data.amount || '');

  const [choices, setChoices] = useState<ChoiceOption[]>(data.choices || []);

  const nodeType = data.type || 'dialogue';

  const [content, setContent] = useState(data.content || '');

  // Update local state when selection changes
  useEffect(() => {
    setLabel(data.label);
    setTags(data.tags?.join(', ') || '');
    setSpeaker(data.speaker || '');
    setCondition(data.condition || '');
    setVariable(data.variable || '');
    setValue(data.value || '');
    setTaskStatus(data.taskStatus || 'pending');
    setRewardType(data.rewardType || '');
    setPunishmentType(data.punishmentType || '');
    setAmount(data.amount || '');
    setChoices(data.choices || []);
    setContent(data.content || '');
  }, [data, nodeId]);

  const handleSave = () => {
    onUpdate(nodeId, {
      ...data,
      label,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      speaker,
      condition,
      variable,
      value,
      taskStatus,
      rewardType,
      punishmentType,
      amount,
      choices,
      content
    });
  };

  const handleAddChoice = () => {
    setChoices([...choices, { id: uuidv4(), label: 'New Option', action: '' }]);
  };

  const handleRemoveChoice = (index: number) => {
    const newChoices = [...choices];
    newChoices.splice(index, 1);
    setChoices(newChoices);
  };

  const handleChoiceChange = (index: number, field: keyof ChoiceOption, val: string) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], [field]: val };
    setChoices(newChoices);
  };

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur shadow-xl border border-slate-200 rounded-xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
        <h3 className="font-bold text-[var(--end-text-main)] uppercase tracking-tight">
          编辑 {nodeType === 'storyNode' ? '节点' : nodeType}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">标题</label>
          <input 
            type="text" 
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-[var(--end-yellow)] font-bold"
          />
        </div>

        {/* Dialogue Specific */}
        {(nodeType === 'dialogue' || nodeType === 'storyNode') && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">说话人 (Speaker)</label>
            <input 
              type="text" 
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-[var(--end-yellow)]"
              placeholder="e.g. 艾丝妲"
            />
          </div>
        )}

        {/* Condition Specific */}
        {nodeType === 'condition' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">条件表达式 (Condition)</label>
            <input 
              type="text" 
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 bg-orange-50 border border-orange-200 rounded text-sm font-mono focus:outline-none focus:border-orange-400 text-orange-800"
              placeholder="e.g. choice == 1"
            />
          </div>
        )}

        {/* Setter Specific */}
        {nodeType === 'setter' && (
          <div className="space-y-3">
             <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">变量名 (Variable)</label>
                <input 
                  type="text" 
                  value={variable}
                  onChange={(e) => setVariable(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-[var(--end-yellow)]"
                  placeholder="e.g. mentioned_credit"
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">值 (Value)</label>
                <input 
                  type="text" 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-[var(--end-yellow)]"
                  placeholder="e.g. true"
                />
             </div>
          </div>
        )}

        {/* Task Specific */}
        {nodeType === 'task' && (
          <div className="space-y-3">
             <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">任务状态 (Status)</label>
                <div className="flex gap-2">
                   {['pending', 'completed', 'failed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setTaskStatus(status as any)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded border capitalize ${
                           taskStatus === status 
                             ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                             : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'
                        }`}
                      >
                         {status}
                      </button>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Reward/Punishment Specific */}
        {(nodeType === 'reward' || nodeType === 'punishment') && (
          <div className="space-y-3">
             <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">类型 (Type)</label>
                <input 
                  type="text" 
                  value={nodeType === 'reward' ? rewardType : punishmentType}
                  onChange={(e) => nodeType === 'reward' ? setRewardType(e.target.value) : setPunishmentType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-[var(--end-yellow)]"
                  placeholder="e.g. Gold, HP, Item"
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">数量 (Amount)</label>
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-[var(--end-yellow)]"
                  placeholder="e.g. 100"
                />
             </div>
          </div>
        )}

        {/* Choice Specific */}
        {nodeType === 'choice' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">选项列表</label>
               <button 
                  onClick={handleAddChoice}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-bold text-slate-600 transition-colors"
               >
                 <FontAwesomeIcon icon={faPlus} /> Add
               </button>
            </div>
            
            <div className="space-y-2">
              {choices.map((choice, idx) => (
                <div key={choice.id || idx} className="bg-slate-50 p-2 rounded border border-slate-200 space-y-2">
                   <div className="flex gap-1">
                      <input 
                        type="text" 
                        value={choice.label}
                        onChange={(e) => handleChoiceChange(idx, 'label', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                        placeholder="Option Text"
                      />
                      <button onClick={() => handleRemoveChoice(idx)} className="text-slate-400 hover:text-red-500 px-1">
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                   </div>
                   <input 
                      type="text" 
                      value={choice.action || ''}
                      onChange={(e) => handleChoiceChange(idx, 'action', e.target.value)}
                      className="w-full px-2 py-1 text-[10px] font-mono border border-slate-200 rounded text-purple-600 bg-white"
                      placeholder="Action (e.g. choice=1)"
                    />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">标签 (Tags)</label>
          <input 
            type="text" 
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-[var(--end-yellow)]"
            placeholder="start, quest..."
          />
        </div>

        {/* Content Editor (Only for Dialogue/StoryNode/Scene/Narration/Branch/Task) */}
        {(nodeType === 'dialogue' || nodeType === 'storyNode' || nodeType === 'scene' || nodeType === 'narration' || nodeType === 'branch' || nodeType === 'task') && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--end-text-sub)] uppercase">
              {nodeType === 'scene' ? '场景描述' : nodeType === 'branch' ? '支线描述' : nodeType === 'task' ? '任务详情' : '内容编辑'}
            </label>
            
            {nodeType === 'scene' || nodeType === 'task' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-[var(--end-yellow)] min-h-[100px]"
                placeholder={nodeType === 'task' ? "任务详情..." : "在此输入场景描述..."}
              />
            ) : (
              <>
                <button 
                  onClick={onOpenRichEditor}
                  className="w-full py-4 bg-white border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-[var(--end-yellow)] hover:text-[var(--end-text-main)] transition-all flex flex-col items-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-[var(--end-yellow)]/20 flex items-center justify-center transition-colors">
                      <FontAwesomeIcon icon={faPenToSquare} className="text-lg" />
                  </div>
                  <span className="font-bold text-sm">打开富文本编辑器</span>
                </button>
                
                <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-bold">预览:</span> 
                  <div className="line-clamp-3 mt-1 opacity-70" dangerouslySetInnerHTML={{ __html: data.content || "暂无内容..." }} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex gap-2">
        <button 
          onClick={handleSave}
          className="flex-1 bg-[var(--end-yellow)] hover:bg-[var(--end-yellow-hover)] text-black font-bold py-2 px-4 rounded text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faSave} /> 保存修改
        </button>
        <button 
          onClick={() => onDelete(nodeId)}
          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded text-sm transition-colors"
          title="删除节点"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
}
