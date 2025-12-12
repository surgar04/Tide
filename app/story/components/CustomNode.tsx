import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines } from '@fortawesome/free-solid-svg-icons';

const CustomNode = ({ data, selected }: NodeProps) => {
  const tags = data.tags as string[] | undefined;
  
  return (
    <div
      className={`
        px-4 py-2 shadow-md rounded-md bg-white border-2 
        min-w-[150px]
        transition-all duration-200
        ${selected 
          ? 'border-[var(--end-yellow)] shadow-[0_0_10px_rgba(255,199,0,0.3)]' 
          : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--end-text-sub)] !w-3 !h-3" />
      
      <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
        <div className={`
          w-6 h-6 rounded flex items-center justify-center text-[10px]
          ${selected ? 'bg-[var(--end-yellow)] text-black' : 'bg-slate-100 text-slate-500'}
        `}>
           <FontAwesomeIcon icon={faFileLines} />
        </div>
        <div className="font-bold text-sm text-[var(--end-text-main)] truncate max-w-[120px]">
          {data.label as string}
        </div>
      </div>

      <div className="text-[10px] text-[var(--end-text-sub)] font-mono line-clamp-2 leading-relaxed">
        {data.content ? (data.content as string) : <span className="italic text-slate-300">Empty...</span>}
      </div>

      {tags && Array.isArray(tags) && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <span key={i} className="text-[8px] px-1 py-0.5 bg-slate-100 text-slate-500 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--end-yellow)] !w-3 !h-3" />
    </div>
  );
};

export default memo(CustomNode);
