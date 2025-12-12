import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTag, faLink } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

import DialogueNode from './DialogueNode';
import ChoiceNode from './ChoiceNode';
import ConditionNode from './ConditionNode';
import SceneNode from './SceneNode';
import NarrationNode from './NarrationNode';
import BranchNode from './BranchNode';
import TaskNode from './TaskNode';
import SetterNode from './SetterNode';
import RewardNode from './RewardNode';
import PunishmentNode from './PunishmentNode';

export default function PrefabNode(props: NodeProps) {
  const data = props.data as StoryNodeData;
  
  // Map types to components
  const ComponentMap: Record<string, any> = {
    dialogue: DialogueNode,
    choice: ChoiceNode,
    condition: ConditionNode,
    scene: SceneNode,
    narration: NarrationNode,
    branch: BranchNode,
    task: TaskNode,
    setter: SetterNode,
    reward: RewardNode,
    punishment: PunishmentNode,
  };

  const BoundComponent = data.targetNodeType ? ComponentMap[data.targetNodeType] : null;

  if (BoundComponent) {
      return (
          <div className="relative group">
              <div className="absolute -top-3 -right-3 z-10 bg-slate-800 text-[var(--end-yellow)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--end-yellow)] shadow-sm flex items-center gap-1">
                  <FontAwesomeIcon icon={faUserTag} className="w-2.5 h-2.5" />
                  {data.targetNodeName}
              </div>
              <BoundComponent {...props} />
          </div>
      );
  }

  // Default rendering if no bound type or type unknown
  return (
    <div className="min-w-[200px] bg-white border-2 border-slate-800 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-slate-800 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <FontAwesomeIcon icon={faUserTag} className="w-3 h-3 text-[var(--end-yellow)]" />
          <span className="text-xs font-bold uppercase tracking-wider">NPC PREFAB</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 rounded">
            {data.prefabId ? `[[${data.prefabId}]]` : 'NO_ID'}
        </span>
      </div>
      
      <div className="p-3 bg-slate-50 space-y-2">
        <div className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1">
            {data.label}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
            <FontAwesomeIcon icon={faLink} className="text-blue-400" />
            <span className="truncate flex-1">
                Bound to: <span className="font-mono font-bold">{data.targetNodeName || 'Unknown Node'}</span>
            </span>
        </div>

        {data.content && (
            <div className="text-xs text-slate-500 italic border-l-2 border-slate-300 pl-2">
                "{data.content}"
            </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-800 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-800 border-2 border-white" />
    </div>
  );
}