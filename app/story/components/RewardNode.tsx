import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

const RewardNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StoryNodeData;
  
  return (
    <div
      className={`
        px-3 py-2 shadow-md rounded-lg bg-white border-2 
        min-w-[160px]
        transition-all duration-200
        ${selected 
          ? 'border-[var(--end-yellow)] shadow-[0_0_10px_rgba(255,199,0,0.3)]' 
          : 'border-yellow-400 hover:border-yellow-500'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--end-text-sub)] !w-3 !h-3" />
      
      <div className="flex items-center gap-3">
         <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 border border-yellow-200">
            <FontAwesomeIcon icon={faGift} className="text-sm" />
         </div>
         <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">REWARD</span>
            <div className="font-bold text-slate-700 text-xs">
                <span className="text-yellow-600 mr-1">{nodeData.amount || '100'}</span>
                <span>{nodeData.rewardType || 'Gold'}</span>
            </div>
         </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-yellow-400 !w-3 !h-3" />
    </div>
  );
};

export default memo(RewardNode);
