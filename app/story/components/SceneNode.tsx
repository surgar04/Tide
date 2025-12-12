import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

const SceneNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StoryNodeData;
  
  return (
    <div
      className={`
        px-0 py-0 shadow-lg rounded-lg bg-white border-2 overflow-hidden
        min-w-[220px]
        transition-all duration-200
        ${selected 
          ? 'border-[var(--end-yellow)] shadow-[0_0_15px_rgba(255,199,0,0.4)]' 
          : 'border-slate-800 hover:border-slate-600'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--end-text-sub)] !w-3 !h-3" />
      
      <div className="bg-slate-800 px-4 py-3 flex items-center gap-3">
         <div className="w-8 h-8 rounded-full bg-[var(--end-yellow)] flex items-center justify-center text-slate-900">
            <FontAwesomeIcon icon={faImage} className="text-sm" />
         </div>
         <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SCENE</span>
            <span className="font-bold text-white text-sm">{nodeData.label || 'Unknown Scene'}</span>
         </div>
      </div>

      {nodeData.content && (
        <div className="p-3 bg-slate-50 border-t border-slate-200">
           <div className="text-xs text-slate-600 italic line-clamp-3">
              {nodeData.content}
           </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--end-yellow)] !w-3 !h-3" />
    </div>
  );
};

export default memo(SceneNode);
