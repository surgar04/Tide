import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

const TaskNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StoryNodeData;
  
  return (
    <div
      className={`
        px-0 py-0 shadow-lg rounded-lg bg-white border-2 overflow-hidden
        min-w-[200px]
        transition-all duration-200
        ${selected 
          ? 'border-[var(--end-yellow)] shadow-[0_0_10px_rgba(255,199,0,0.3)]' 
          : 'border-indigo-600 hover:border-indigo-500'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--end-text-sub)] !w-3 !h-3" />
      
      <div className="bg-indigo-600 px-3 py-2 flex items-center gap-2">
         <FontAwesomeIcon icon={faClipboardList} className="text-white text-xs" />
         <span className="font-bold text-xs text-white uppercase tracking-wider">Quest / Task</span>
      </div>

      <div className="p-3 bg-indigo-50/50">
         <div className="text-sm font-bold text-indigo-900 text-center mb-1">
            {nodeData.label || "New Task"}
         </div>
         {nodeData.content && (
             <div className="text-xs text-indigo-700 opacity-80 line-clamp-2 text-center mb-2">
                 {nodeData.content}
             </div>
         )}
         
         <div className="flex justify-between items-center border-t border-indigo-100 pt-2 mt-1">
             <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
             <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-100 text-indigo-600">
                {nodeData.taskStatus || 'Pending'}
             </span>
         </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3" />
    </div>
  );
};

export default memo(TaskNode);
