import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

const DialogueNode = ({ data, selected }: NodeProps) => {
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
      
      <div className="flex items-center gap-2 mb-2">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-xs
          ${selected ? 'bg-[var(--end-yellow)] text-black' : 'bg-blue-50 text-blue-500'}
        `}>
           <FontAwesomeIcon icon={faCommentDots} />
        </div>
        <div className="font-bold text-sm text-[var(--end-text-main)]">
          {nodeData.speaker || 'Narrator'}
        </div>
      </div>

      <div className="text-xs text-[var(--end-text-main)] leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
        {nodeData.content || <span className="italic text-slate-400">...</span>}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--end-yellow)] !w-3 !h-3" />
    </div>
  );
};

export default memo(DialogueNode);
