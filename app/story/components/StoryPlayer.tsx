import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faRedo, faHistory, faImage, faCommentDots, faBookOpen, faMapSigns, faClipboardList, faGift, faExclamationTriangle, faCheck } from '@fortawesome/free-solid-svg-icons';
import { StoryNodeData, ChoiceOption, NodeType } from '../types';
import { Edge, Node } from '@xyflow/react';

interface StoryPlayerProps {
  nodes: Node[];
  edges: Edge[];
  initialVariables: Record<string, any>;
  onClose: () => void;
}

export default function StoryPlayer({ nodes, edges, initialVariables, onClose }: StoryPlayerProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [variables, setVariables] = useState<Record<string, any>>({ ...initialVariables });
  
  // Track last processed logic node to prevent infinite loops
  const processingNodeId = useRef<string | null>(null);

  // Find start node
  useEffect(() => {
    const startNode = nodes.find(n => 
      (n.data.tags as string[])?.includes('start') || 
      (n.data.label as string).toLowerCase() === 'start' ||
      n.type === 'scene' // Default to first scene if no explicit start tag
    );
    if (startNode) {
      setCurrentNodeId(startNode.id);
    } else if (nodes.length > 0) {
      setCurrentNodeId(nodes[0].id);
    }
  }, [nodes]);

  const currentNode = useMemo(() => 
    nodes.find(n => n.id === currentNodeId), 
    [nodes, currentNodeId]
  );

  const currentEdges = useMemo(() => 
    edges.filter(e => e.source === currentNodeId),
    [edges, currentNodeId]
  );

  const handleNextNode = useCallback((targetId: string) => {
    setHistory(prev => [...prev, currentNodeId!]);
    setCurrentNodeId(targetId);
  }, [currentNodeId]);

  // Auto-progression for logic nodes
  useEffect(() => {
    if (!currentNode) return;
    
    const type = currentNode.type as NodeType;
    
    const isLogicNode = ['condition', 'setter', 'reward', 'punishment'].includes(type);
    
    // If not a logic node, clear the processing lock so we can re-enter logic nodes later
    if (!isLogicNode) {
        processingNodeId.current = null;
        return;
    }

    // Prevent re-processing the same logic node if it causes state updates
    if (processingNodeId.current === currentNode.id) return;

    // Mark as processed immediately
    processingNodeId.current = currentNode.id;
    
    const data = currentNode.data as unknown as StoryNodeData;

    if (type === 'condition') {
      // Evaluate condition
      let result = false;
      try {
        // Safe evaluation context
        const condition = data.condition || 'false';
        // Replace variable names with values in the condition string is tricky without eval
        // A simple approach for "var == val"
        // For now, let's try a very basic parser or just default to true if complex
        // Ideally we need a proper expression parser. 
        // Let's implement a simple "key == value" checker for now.
        
        const parts = condition.split('==').map(s => s.trim());
        if (parts.length === 2) {
            const [key, val] = parts;
            // Clean value (remove quotes)
            const cleanVal = val.replace(/^['"]|['"]$/g, '');
            // Check if val is 'true'/'false'
            const isTrue = cleanVal === 'true';
            const isFalse = cleanVal === 'false';
            
            const currentVal = variables[key];
            
            if (isTrue || isFalse) {
                result = currentVal === (isTrue);
            } else {
                // String comparison
                result = String(currentVal) === cleanVal;
            }
        } else {
            console.warn("Complex conditions not fully supported in player yet, defaulting to false");
        }
      } catch (e) {
        console.error("Condition eval failed", e);
      }

      const targetEdge = currentEdges.find(e => e.sourceHandle === (result ? 'true' : 'false'));
      if (targetEdge) {
        const timer = setTimeout(() => handleNextNode(targetEdge.target), 50); // Small delay for visual flow
        return () => clearTimeout(timer);
      }
    } else if (type === 'setter') {
        // Apply variable change
        const { variable, value } = data;
        if (variable) {
            let val: any = value;
            if (value === 'true') val = true;
            else if (value === 'false') val = false;
            else if (!isNaN(Number(value))) val = Number(value);
            
            setVariables(prev => ({ ...prev, [variable]: val }));
        }
        
        // Move to next
        if (currentEdges.length > 0) {
             const timer = setTimeout(() => handleNextNode(currentEdges[0].target), 50);
             return () => clearTimeout(timer);
        }
    } else if (type === 'reward') {
        // Auto-grant reward
        const { rewardType, amount } = data;
        // In a real game, add to inventory. For now, just log or set a variable.
        if (rewardType) {
            setVariables(prev => ({ ...prev, [`reward_${rewardType}`]: (prev[`reward_${rewardType}`] || 0) + Number(amount || 0) }));
        }
        
        // Auto-proceed after delay
        const timer = setTimeout(() => {
            if (currentEdges.length > 0) handleNextNode(currentEdges[0].target);
        }, 2000);
        return () => clearTimeout(timer);

    } else if (type === 'punishment') {
        // Auto-apply punishment
        const { punishmentType, amount } = data;
        if (punishmentType) {
            setVariables(prev => ({ ...prev, [`penalty_${punishmentType}`]: (prev[`penalty_${punishmentType}`] || 0) + Number(amount || 0) }));
        }

        // Auto-proceed after delay
        const timer = setTimeout(() => {
            if (currentEdges.length > 0) handleNextNode(currentEdges[0].target);
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [currentNode, currentEdges, variables, handleNextNode]);

  const handleRestart = () => {
    setHistory([]);
    setVariables({ ...initialVariables });
    processingNodeId.current = null;
    const startNode = nodes.find(n => 
      (n.data.tags as string[])?.includes('start') || 
      (n.data.label as string).toLowerCase() === 'start'
    );
    if (startNode) setCurrentNodeId(startNode.id);
    else if (nodes.length > 0) setCurrentNodeId(nodes[0].id);
  };

  const parseContent = (text: string) => {
    if (!text) return "";
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] !== undefined ? String(variables[key]) : `{{${key}}}`;
    });
  };

  if (!currentNode) return null;

  const nodeType = currentNode.type as NodeType;
  const nodeData = currentNode.data as unknown as StoryNodeData;

  // Render logic based on node type
  const renderContent = () => {
    switch (nodeType) {
        case 'scene':
            return (
                <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-[var(--end-yellow)] mb-4 shadow-lg border border-[var(--end-border)]">
                        <FontAwesomeIcon icon={faImage} className="text-2xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--end-text-main)] uppercase tracking-widest border-b-2 border-[var(--end-yellow)] inline-block pb-2 px-8">
                        {nodeData.label}
                    </h1>
                    <div className="max-w-xl mx-auto text-[var(--end-text-sub)] italic text-lg leading-relaxed pt-4">
                        {nodeData.content}
                    </div>
                    <div className="pt-12">
                         {currentEdges.length > 0 && (
                            <button 
                                onClick={() => handleNextNode(currentEdges[0].target)}
                                className="px-8 py-3 bg-[var(--end-yellow)] hover:bg-[var(--end-yellow-hover)] text-black font-bold rounded-full transition-transform hover:scale-105 shadow-lg shadow-[var(--end-yellow)]/20"
                            >
                                进入场景
                            </button>
                         )}
                    </div>
                </div>
            );
        
        case 'dialogue':
        case 'storyNode': // Backward compatibility
            return (
                <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-500 w-full">
                    {/* Speaker Card */}
                    <div className="flex items-end gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg text-white">
                            <FontAwesomeIcon icon={faCommentDots} />
                        </div>
                        <div className="bg-slate-800/80 backdrop-blur px-6 py-2 rounded-t-xl border-t border-x border-[var(--end-border)] -mb-[1px] relative z-10">
                            <span className="text-[var(--end-yellow)] font-bold tracking-wide text-lg">
                                {nodeData.speaker || '???'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Dialogue Box */}
                    <div className="bg-slate-900/90 backdrop-blur-md border border-[var(--end-border)] rounded-b-xl rounded-tr-xl p-8 shadow-2xl relative min-h-[200px] flex flex-col">
                        <div className="prose prose-invert prose-lg max-w-none font-medium leading-loose text-slate-200"
                             dangerouslySetInnerHTML={{ __html: parseContent(nodeData.content || '') }} 
                        />
                        
                        {/* Next Button / Choices */}
                        <div className="mt-auto pt-8 flex justify-end">
                            {currentEdges.length > 0 && currentEdges.map(edge => {
                                 // If next is a choice node, we might want to show "Continue" then show choices? 
                                 // Or if it's direct connection.
                                 // For now, simple "Next" button for single edge
                                 const target = nodes.find(n => n.id === edge.target);
                                 // If target is Choice node, label button "..." or "Continue"
                                 // If target is another dialogue, maybe label "Next"
                                 
                                 return (
                                    <button 
                                        key={edge.id}
                                        onClick={() => handleNextNode(edge.target)}
                                        className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-bold text-[var(--end-text-dim)] hover:text-white transition-all group"
                                    >
                                        <span>继续</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                 );
                            })}
                        </div>
                    </div>
                </div>
            );

        case 'narration':
            return (
                <div className="max-w-3xl mx-auto w-full animate-in fade-in duration-1000 flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="mb-8 text-[var(--end-yellow)] opacity-50">
                        <FontAwesomeIcon icon={faBookOpen} className="text-3xl" />
                    </div>
                    <div className="prose prose-invert prose-xl text-center font-serif italic text-slate-300 leading-relaxed"
                         dangerouslySetInnerHTML={{ __html: parseContent(nodeData.content || '') }} 
                    />
                    
                    <div className="mt-12">
                        {currentEdges.length > 0 && (
                            <button 
                                onClick={() => handleNextNode(currentEdges[0].target)}
                                className="w-12 h-12 rounded-full border border-slate-600 text-slate-400 hover:text-[var(--end-yellow)] hover:border-[var(--end-yellow)] flex items-center justify-center transition-all animate-bounce"
                            >
                                <span className="text-xl">↓</span>
                            </button>
                        )}
                    </div>
                </div>
            );

        case 'branch':
            return (
                <div className="max-w-4xl mx-auto w-full animate-in zoom-in-95 duration-700 flex flex-col items-center text-center p-10 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700">
                    <div className="w-20 h-20 rounded-2xl bg-teal-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-teal-500/20">
                        <FontAwesomeIcon icon={faMapSigns} className="text-4xl" />
                    </div>
                    <h2 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-2">Subplot Branch</h2>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {nodeData.label}
                    </h1>
                    {nodeData.content && (
                        <div className="text-lg text-slate-300 max-w-2xl leading-relaxed mb-10">
                            {nodeData.content}
                        </div>
                    )}
                    
                    {currentEdges.length > 0 && (
                        <button 
                            onClick={() => handleNextNode(currentEdges[0].target)}
                            className="px-10 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-lg shadow-teal-600/30 flex items-center gap-3"
                        >
                            <span>Start Branch</span>
                            <FontAwesomeIcon icon={faRedo} className="text-sm" />
                        </button>
                    )}
                </div>
            );

        case 'task':
            return (
                <div className="max-w-md mx-auto w-full animate-in zoom-in-95 duration-500">
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-indigo-100">
                        <div className="bg-indigo-600 p-6 text-white flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faClipboardList} className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase opacity-80 tracking-widest">New Quest</h3>
                                <h2 className="text-xl font-bold">{nodeData.label}</h2>
                            </div>
                        </div>
                        <div className="p-8">
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {nodeData.content || "Task details..."}
                            </p>
                            
                            <button 
                                onClick={() => {
                                    // Mark task as completed in variables?
                                    setVariables(prev => ({ ...prev, [`task_${currentNodeId}_status`]: 'completed' }));
                                    if (currentEdges.length > 0) handleNextNode(currentEdges[0].target);
                                }}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                            >
                                <FontAwesomeIcon icon={faCheck} /> Complete Task
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'reward':
            return (
                <div className="max-w-sm mx-auto w-full animate-in bounce-in duration-700">
                    <div className="bg-gradient-to-b from-yellow-50 to-white rounded-xl shadow-2xl border-2 border-yellow-200 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400" />
                        <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 mb-6 shadow-inner">
                            <FontAwesomeIcon icon={faGift} className="text-4xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-yellow-600 mb-2">Rewards Received!</h2>
                        <div className="text-4xl font-black text-slate-800 mb-2">
                            {nodeData.amount || 0}
                        </div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
                            {nodeData.rewardType || "Gold"}
                        </div>
                        <div className="text-xs text-slate-400">Auto-continuing...</div>
                    </div>
                </div>
            );

        case 'punishment':
            return (
                <div className="max-w-sm mx-auto w-full animate-in shake duration-500">
                    <div className="bg-red-50 rounded-xl shadow-2xl border-2 border-red-200 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-inner">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Penalty Applied!</h2>
                        <div className="text-4xl font-black text-slate-800 mb-2">
                            -{nodeData.amount || 0}
                        </div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
                            {nodeData.punishmentType || "HP"}
                        </div>
                        <div className="text-xs text-slate-400">Auto-continuing...</div>
                    </div>
                </div>
            );

        case 'choice':
            const choices = nodeData.choices || [];
            return (
                <div className="max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-300">
                    <h3 className="text-center text-[var(--end-text-dim)] font-bold uppercase tracking-widest mb-8 text-sm">
                        请做出选择
                    </h3>
                    <div className="space-y-4">
                        {choices.map((choice, idx) => {
                            // Find edge connected to this choice handle
                            const edge = currentEdges.find(e => e.sourceHandle === choice.id);
                            if (!edge) return null; // Should ideally show disabled option?

                            return (
                                <button
                                    key={choice.id || idx}
                                    onClick={() => {
                                        // Execute choice action if any (simple setter)
                                        if (choice.action) {
                                            const parts = choice.action.split('=');
                                            if (parts.length === 2) {
                                                const key = parts[0].trim();
                                                const val = parts[1].trim();
                                                let finalVal: any = val;
                                                if (val === 'true') finalVal = true;
                                                else if (val === 'false') finalVal = false;
                                                else if (!isNaN(Number(val))) finalVal = Number(val);
                                                
                                                setVariables(prev => ({...prev, [key]: finalVal}));
                                            }
                                        }
                                        handleNextNode(edge.target);
                                    }}
                                    className="w-full p-6 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-[var(--end-yellow)] rounded-xl text-left transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-[var(--end-yellow)]/0 group-hover:bg-[var(--end-yellow)]/5 transition-colors" />
                                    <span className="relative z-10 text-lg font-bold text-slate-200 group-hover:text-white group-hover:pl-2 transition-all">
                                        <span className="inline-block w-6 opacity-0 group-hover:opacity-100 text-[var(--end-yellow)] -ml-6 transition-all mr-2">➤</span>
                                        {choice.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
            
        case 'condition':
        case 'setter':
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin text-[var(--end-yellow)] text-2xl">
                        <FontAwesomeIcon icon={faRedo} />
                    </div>
                    <span className="ml-3 text-slate-500 font-mono text-xs">Processing logic...</span>
                </div>
            );

        default:
            return <div className="text-red-500">Unknown node type: {nodeType}</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
      <div className="w-full h-full flex flex-col relative bg-[url('/grid.svg')] bg-fixed opacity-100">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
          <div className="pointer-events-auto">
             {/* Optional: Breadcrumbs or current chapter title */}
          </div>
          <div className="flex gap-4 pointer-events-auto">
            <button 
                onClick={handleRestart}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 backdrop-blur border border-slate-700 transition-colors"
                title="重新开始"
            >
                <FontAwesomeIcon icon={faRedo} />
            </button>
            <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/80 text-slate-400 hover:text-red-400 hover:bg-slate-700 backdrop-blur border border-slate-700 transition-colors"
                title="退出剧情"
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Main Stage */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden">
            {renderContent()}
        </div>

        {/* Debug Overlay (Toggleable ideally, kept visible for dev) */}
        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur p-2 rounded text-[10px] font-mono text-slate-500 hover:opacity-100 opacity-30 transition-opacity">
            <div>Node: {currentNodeId} ({nodeType})</div>
            <div>Vars: {JSON.stringify(variables)}</div>
        </div>

      </div>
    </div>
  );
}
