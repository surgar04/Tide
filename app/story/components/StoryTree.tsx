import { useMemo, useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCodeBranch, 
  faCommentDots, 
  faImage, 
  faListUl, 
  faPlay, 
  faProjectDiagram, 
  faTimes, 
  faChevronRight, 
  faChevronDown,
  faPen,
  faLink,
  faBookOpen,
  faMapSigns,
  faClipboardList,
  faGift,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData, NodeType } from '../types';

interface StoryTreeProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (nodeId: string) => void;
  onClose: () => void;
  className?: string;
}

interface TreeNodeProps {
  nodeId: string;
  nodes: Node[];
  edges: Edge[];
  depth: number;
  visited: Set<string>;
  onNodeClick: (nodeId: string) => void;
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'scene': return faImage;
    case 'dialogue': return faCommentDots;
    case 'choice': return faListUl;
    case 'condition': return faCodeBranch;
    case 'setter': return faPen;
    case 'narration': return faBookOpen;
    case 'branch': return faMapSigns;
    case 'task': return faClipboardList;
    case 'reward': return faGift;
    case 'punishment': return faExclamationTriangle;
    default: return faPlay;
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case 'scene': return 'text-slate-800';
    case 'dialogue': return 'text-blue-500';
    case 'choice': return 'text-purple-500';
    case 'condition': return 'text-orange-500';
    case 'setter': return 'text-green-500';
    case 'narration': return 'text-slate-400';
    case 'branch': return 'text-teal-500';
    case 'task': return 'text-indigo-500';
    case 'reward': return 'text-yellow-500';
    case 'punishment': return 'text-red-500';
    default: return 'text-slate-500';
  }
};

const TreeNode = ({ nodeId, nodes, edges, depth, visited, onNodeClick }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;

  const data = node.data as unknown as StoryNodeData;
  const type = node.type || 'dialogue';

  // Find children
  const childEdges = edges.filter(e => e.source === nodeId);
  // Sort children by vertical position of target nodes to match visual flow roughly
  const sortedChildEdges = [...childEdges].sort((a, b) => {
      const nodeA = nodes.find(n => n.id === a.target);
      const nodeB = nodes.find(n => n.id === b.target);
      return (nodeA?.position.y || 0) - (nodeB?.position.y || 0);
  });

  const hasChildren = sortedChildEdges.length > 0;
  const isLoop = visited.has(nodeId);

  // If it's a loop, we stop recursion but show the node
  if (isLoop) {
      return (
        <div className="pl-4 py-1 relative">
            <div className="flex items-center gap-2 text-slate-400 select-none">
                <FontAwesomeIcon icon={faLink} className="text-[10px]" />
                <span className="text-xs italic">To: {data.label}</span>
            </div>
        </div>
      );
  }

  const newVisited = new Set(visited);
  newVisited.add(nodeId);

  return (
    <div className="relative">
      {/* Connector lines for hierarchy */}
      {depth > 0 && (
         <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 -ml-2" />
      )}
      
      <div 
        className={`
            group flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors
            hover:bg-slate-100 mb-0.5
        `}
        onClick={(e) => {
            e.stopPropagation();
            onNodeClick(nodeId);
        }}
      >
        <div 
            className={`w-4 h-4 flex items-center justify-center text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ${!hasChildren ? 'opacity-0' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
            }}
        >
            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
        </div>

        <FontAwesomeIcon icon={getNodeIcon(type)} className={`text-xs ${getNodeColor(type)} w-4`} />
        
        <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-700 truncate">{data.label}</div>
            <div className="text-[10px] text-slate-400 truncate opacity-0 group-hover:opacity-100 transition-opacity h-3">
                {type === 'condition' ? data.condition : 
                 type === 'setter' ? `${data.variable} = ${data.value}` : 
                 type === 'choice' ? `${(data.choices || []).length} options` :
                 data.content}
            </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="pl-4 border-l border-slate-100 ml-2">
            {sortedChildEdges.map((edge) => (
                <div key={edge.id} className="relative">
                     {/* Edge Label if any (e.g. choice branches or condition branches) */}
                     {(edge.label || edge.sourceHandle) && (
                         <div className="px-2 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-50 inline-block rounded border border-slate-100 mb-1 mt-1">
                             {edge.label || (edge.sourceHandle === 'true' ? 'True' : edge.sourceHandle === 'false' ? 'False' : edge.sourceHandle)}
                         </div>
                     )}
                     <TreeNode 
                        nodeId={edge.target} 
                        nodes={nodes} 
                        edges={edges} 
                        depth={depth + 1} 
                        visited={newVisited}
                        onNodeClick={onNodeClick}
                     />
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default function StoryTree({ nodes, edges, onNodeClick, onClose, className = '' }: StoryTreeProps) {
  
  // Identify root nodes: nodes with no incoming edges
  const rootNodes = useMemo(() => {
    const targetIds = new Set(edges.map(e => e.target));
    const roots = nodes.filter(n => !targetIds.has(n.id));
    
    // If no roots (circular), or just to be safe, look for 'start' tag
    const startTagged = nodes.filter(n => (n.data.tags as string[])?.includes('start'));
    
    if (startTagged.length > 0) return startTagged;
    if (roots.length > 0) return roots;
    return nodes.length > 0 ? [nodes[0]] : [];
  }, [nodes, edges]);

  return (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 shadow-xl z-30 ${className}`}>
      <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-700">
            <FontAwesomeIcon icon={faProjectDiagram} />
            <span className="font-bold text-sm">剧情大纲</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 transition-colors">
            <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
         {rootNodes.length === 0 && (
             <div className="text-center text-slate-400 text-xs mt-10">No nodes found</div>
         )}
         
         {rootNodes.map(node => (
             <div key={node.id} className="mb-4">
                 <TreeNode 
                    nodeId={node.id} 
                    nodes={nodes} 
                    edges={edges} 
                    depth={0} 
                    visited={new Set()}
                    onNodeClick={onNodeClick}
                 />
             </div>
         ))}
      </div>
    </div>
  );
}
