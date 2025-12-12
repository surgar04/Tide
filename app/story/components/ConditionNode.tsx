import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

const ConditionNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StoryNodeData;
  
  return (
    <div
      className={`
        px-0 py-0 shadow-md rounded-lg bg-white border-2
        min-w-[180px]
        transition-all duration-200
        ${selected 
          ? 'border-[var(--end-yellow)] shadow-[0_0_10px_rgba(255,199,0,0.3)]' 
          : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--end-text-sub)] !w-3 !h-3" />
      
      <div className="bg-orange-50 px-3 py-2 border-b border-orange-100 flex items-center gap-2 rounded-t-md">
         <FontAwesomeIcon icon={faCodeBranch} className="text-orange-500 text-xs" />
         <span className="font-bold text-xs text-orange-800">Condition</span>
      </div>

      <div className="p-3 bg-white">
         <code className="text-xs font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded block text-center">
            {nodeData.condition || "if..."}
         </code>
      </div>

      <div className="flex border-t border-slate-100 rounded-b-md">
         <div className="flex-1 relative p-2 text-center border-r border-slate-100 rounded-bl-md">
             <span className="text-[10px] font-bold text-green-600">TRUE</span>
             <Handle 
                type="source" 
                position={Position.Bottom} 
                id="true"
                className="!bg-green-500 !w-2.5 !h-2.5 !bottom-[-6px]"
             />
         </div>
         <div className="flex-1 relative p-2 text-center rounded-br-md">
             <span className="text-[10px] font-bold text-red-500">FALSE</span>
             <Handle 
                type="source" 
                position={Position.Bottom} 
                id="false"
                className="!bg-red-500 !w-2.5 !h-2.5 !bottom-[-6px]"
             />
         </div>
      </div>
    </div>
  );
};

export default memo(ConditionNode);
