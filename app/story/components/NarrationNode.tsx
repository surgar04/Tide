import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

const NarrationNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StoryNodeData;
  
  return (
    <div
      className={`
        px-4 py-3 shadow-md rounded-lg bg-white border-2 
        min-w-[200px] max-w-[300px]
        transition-all duration-200
        ${selected 
          ? 'border-[var(--end-yellow)] shadow-[0_0_10px_rgba(255,199,0,0.3)]' 
          : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--end-text-sub)] !w-3 !h-3" />
      
      <div className="flex items-center gap-2 mb-2 justify-center border-b border-slate-100 pb-2">
        <FontAwesomeIcon icon={faBookOpen} className="text-slate-400 text-xs" />
        <div className="font-bold text-xs text-slate-500 uppercase tracking-wider">
          Narration
        </div>
      </div>

      <div className="text-sm text-[var(--end-text-main)] leading-relaxed italic text-center font-serif">
        {nodeData.content || <span className="text-slate-300">...</span>}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--end-yellow)] !w-3 !h-3" />
    </div>
  );
};

export default memo(NarrationNode);
