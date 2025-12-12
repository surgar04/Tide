import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeBranch, faMapSigns } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

const BranchNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StoryNodeData;
  
  return (
    <div
      className={`
        px-0 py-0 shadow-lg rounded-lg bg-white border-2 overflow-hidden
        min-w-[180px]
        transition-all duration-200
        ${selected 
          ? 'border-[var(--end-yellow)] shadow-[0_0_10px_rgba(255,199,0,0.3)]' 
          : 'border-teal-600 hover:border-teal-500'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--end-text-sub)] !w-3 !h-3" />
      
      <div className="bg-teal-600 px-3 py-2 flex items-center gap-2">
         <FontAwesomeIcon icon={faMapSigns} className="text-white text-xs" />
         <span className="font-bold text-xs text-white uppercase tracking-wider">Subplot / Branch</span>
      </div>

      <div className="p-3 bg-teal-50">
         <div className="text-sm font-bold text-teal-900 text-center">
            {nodeData.label || "Branch Name"}
         </div>
         {nodeData.content && (
             <div className="mt-2 text-xs text-teal-700 text-center opacity-80 line-clamp-2">
                 {nodeData.content}
             </div>
         )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !w-3 !h-3" />
    </div>
  );
};

export default memo(BranchNode);
