import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData } from '../types';

const ChoiceNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StoryNodeData;
  const choices = nodeData.choices || [];
  
  return (
    <div
      className={`
        px-0 py-0 shadow-md rounded-lg bg-white border-2
        min-w-[200px]
        transition-all duration-200
        ${selected 
          ? 'border-[var(--end-yellow)] shadow-[0_0_10px_rgba(255,199,0,0.3)]' 
          : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--end-text-sub)] !w-3 !h-3" />
      
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 rounded-t-md">
         <FontAwesomeIcon icon={faListUl} className="text-purple-500 text-xs" />
         <span className="font-bold text-xs text-slate-600">Player Choice</span>
      </div>

      <div className="flex flex-col rounded-b-md bg-white">
        {choices.length === 0 && (
           <div className="p-4 text-xs text-slate-400 italic text-center">No options defined</div>
        )}
        
        {choices.map((choice, index) => (
          <div key={choice.id || index} className="relative border-b border-slate-100 last:border-0 last:rounded-b-md">
             <div className="px-4 py-2 pr-8 text-xs font-medium hover:bg-slate-50 transition-colors last:rounded-b-md">
               {choice.label}
               {choice.action && <div className="text-[10px] text-purple-400 font-mono mt-0.5">{choice.action}</div>}
             </div>
             <Handle 
                type="source" 
                position={Position.Right} 
                id={choice.id || `choice-${index}`}
                className="!bg-purple-500 !w-3 !h-3 !-right-1.5"
                style={{ top: '50%' }}
             />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(ChoiceNode);
