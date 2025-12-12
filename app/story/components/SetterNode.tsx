import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

const SetterNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StoryNodeData;
  
  return (
    <div
      className={`
        px-3 py-2 shadow-sm rounded-md bg-white border-2 
        min-w-[150px]
        transition-all duration-200
        ${selected 
          ? 'border-[var(--end-yellow)] shadow-[0_0_10px_rgba(255,199,0,0.3)]' 
          : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--end-text-sub)] !w-3 !h-3" />
      
      <div className="flex items-center gap-2 justify-center">
         <FontAwesomeIcon icon={faPen} className="text-slate-400 text-[10px]" />
         <div className="font-mono text-xs text-slate-600">
           <span className="font-bold text-blue-600">{nodeData.variable || "?"}</span>
           <span className="mx-1 text-slate-400">=</span>
           <span className="text-green-600">{nodeData.value || "?"}</span>
         </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--end-yellow)] !w-3 !h-3" />
    </div>
  );
};

export default memo(SetterNode);
