import { useCallback, useState, useRef, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faDownload, faUpload, faPlay, faCog, faArrowLeft, faTimes, faProjectDiagram, faFileCode } from '@fortawesome/free-solid-svg-icons';

import CustomNode from './CustomNode';
import DialogueNode from './DialogueNode';
import ChoiceNode from './ChoiceNode';
import ConditionNode from './ConditionNode';
import SetterNode from './SetterNode';
import SceneNode from './SceneNode';
import NarrationNode from './NarrationNode';
import BranchNode from './BranchNode';
import TaskNode from './TaskNode';
import RewardNode from './RewardNode';
import PunishmentNode from './PunishmentNode';
import NodeEditor from './NodeEditor';
import VariableManager from './VariableManager';
import StoryPlayer from './StoryPlayer';
import RichTextEditor from './RichTextEditor';
import StoryTree from './StoryTree';
import StoryScriptEditor from './StoryScriptEditor';
import { nodesToScript, scriptToNodes } from '@/lib/storyConverter';
import { StoryNodeData, NodeType } from '../types';

const nodeTypes = {
  storyNode: CustomNode,
  dialogue: DialogueNode,
  choice: ChoiceNode,
  condition: ConditionNode,
  setter: SetterNode,
  scene: SceneNode,
  narration: NarrationNode,
  branch: BranchNode,
  task: TaskNode,
  reward: RewardNode,
  punishment: PunishmentNode,
};

export interface StoryEditorProps {
  filePath: string;
  projectId: string;
  onBack: () => void;
}

const INITIAL_NODES: Node[] = [];

export default function StoryEditor({ filePath, projectId, onBack }: StoryEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [variables, setVariables] = useState<Record<string, any>>({});
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showVarManager, setShowVarManager] = useState(false);
  const [showStoryTree, setShowStoryTree] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New state for split view
  const [showRichEditor, setShowRichEditor] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  
  // Script Mode State
  const [viewMode, setViewMode] = useState<'visual' | 'script'>('visual');
  const [scriptContent, setScriptContent] = useState("");

  const switchToScriptMode = useCallback(() => {
    const script = nodesToScript(nodes, edges);
    setScriptContent(script);
    setViewMode('script');
  }, [nodes, edges]);

  const switchToVisualMode = useCallback(() => {
    // Optional: Auto-parse when switching back, or require manual save
    // For now, let's keep it manual via "Apply" button in ScriptEditor
    setViewMode('visual');
  }, []);

  const handleScriptSave = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = scriptToNodes(scriptContent, nodes);
    setNodes(newNodes);
    setEdges(newEdges);
    setViewMode('visual');
  }, [scriptContent, nodes, setNodes, setEdges]);

  // Script Mode State


  // Load project data from GitHub or Local Tutorial
  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      try {
        if (filePath === 'public/tutorial_project.json') {
            // Load local tutorial
            const res = await fetch('/tutorial_project.json');
            if (res.ok) {
                const project = await res.json();
                if (project.nodes && Array.isArray(project.nodes)) {
                    setNodes(project.nodes);
                    setEdges(project.edges || []);
                    if (project.variables) setVariables(project.variables);
                }
            } else {
                console.error("Failed to load tutorial file");
            }
        } else {
            // Check if file exists by fetching it
            const res = await fetch(`/api/github/file?path=${encodeURIComponent(filePath)}`);
            if (res.ok) {
              const blob = await res.blob();
              const text = await blob.text();
              const project = JSON.parse(text);
              
              if (project.nodes && Array.isArray(project.nodes)) {
                setNodes(project.nodes);
                setEdges(project.edges || []);
                if (project.variables) setVariables(project.variables);
              }
            } else {
              // File might not exist (new file), keep initial state
              console.log("New file or file not found, starting fresh.");
            }
        }
      } catch (e) {
        console.error('Failed to load project', e);
        alert('加载失败，请检查网络');
      } finally {
        setIsLoading(false);
      }
    };
    loadProject();
  }, [filePath, setNodes, setEdges]);

  // Save to GitHub
  const handleSaveToGithub = useCallback(async () => {
    setIsSaving(true);
    try {
      const projectData = {
        id: filePath, // Use path as ID for internal reference if needed
        nodes,
        edges,
        variables,
        version: '1.0',
        timestamp: Date.now()
      };

      const content = JSON.stringify(projectData, null, 2);
      const base64Content = btoa(unescape(encodeURIComponent(content))); // Handle UTF-8 chars

      const message = `Update story: ${filePath.split('/').pop()}`;

      const res = await fetch("/api/github/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: filePath,
          content: base64Content,
          message
        })
      });

      if (!res.ok) throw new Error("Upload failed");
      
      alert("保存成功！");
    } catch (e) {
      console.error("Save failed", e);
      alert("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  }, [filePath, nodes, edges, variables]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));

      // Auto-update condition if connecting Choice -> Condition
      setNodes((currentNodes) => {
        const sourceNode = currentNodes.find(n => n.id === params.source);
        const targetNode = currentNodes.find(n => n.id === params.target);

        if (sourceNode && targetNode && sourceNode.type === 'choice' && targetNode.type === 'condition') {
           const choices = (sourceNode.data as any).choices || [];
           const selectedChoice = choices.find((c: any) => (c.id || '') === params.sourceHandle);
           
           if (selectedChoice && selectedChoice.action) {
               // Convert action "var=val" to condition "var == val"
               const action = selectedChoice.action.trim();
               let newCondition = action;
               if (action.includes('=') && !action.includes('==')) {
                   newCondition = action.replace('=', ' == ');
               }
               
               return currentNodes.map(n => 
                 n.id === targetNode.id 
                   ? { ...n, data: { ...n.data, condition: newCondition } }
                   : n
               );
           }
        }
        return currentNodes;
      });
    },
    [setEdges, setNodes],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setShowVarManager(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setShowAddMenu(false);
    setShowRichEditor(false);
  }, []);

  const handleAddNode = useCallback((type: NodeType = 'dialogue') => {
    const id = uuidv4();
    const position = { x: Math.random() * 500, y: Math.random() * 500 };

    const newNode: Node = {
      id,
      type: type,
      position,
      data: { 
        label: type === 'dialogue' ? 'New Dialogue' : 
               type === 'scene' ? 'New Scene' : 
               type === 'narration' ? 'Narration' :
                type === 'branch' ? 'New Subplot' :
                type === 'task' ? 'New Task' :
                type === 'reward' ? 'Reward' :
                type === 'punishment' ? 'Punishment' :
                type.charAt(0).toUpperCase() + type.slice(1), 
        content: type === 'dialogue' ? 'Say something...' : 
                 type === 'scene' ? 'Scene description...' : 
                 type === 'narration' ? 'Narrative text...' :
                 type === 'branch' ? 'Subplot description...' : 
                 type === 'task' ? 'Task description...' : '',
        speaker: type === 'dialogue' ? 'Speaker' : undefined,
        choices: type === 'choice' ? [{ id: 'opt1', label: 'Option 1' }] : undefined,
        condition: type === 'condition' ? 'variable == true' : undefined,
        variable: type === 'setter' ? 'varName' : undefined,
        value: type === 'setter' ? 'true' : undefined,
        taskStatus: type === 'task' ? 'pending' : undefined,
        rewardType: type === 'reward' ? 'Gold' : undefined,
        punishmentType: type === 'punishment' ? 'HP' : undefined,
        amount: (type === 'reward' || type === 'punishment') ? '100' : undefined,
        tags: [],
        type: type // store type in data for easy access
      },
    };

    const newNodes = [newNode];
    const newEdges: Edge[] = [];

    // Auto-create dialogue for condition (True branch)
    if (type === 'condition') {
        const dialogueId = uuidv4();
        const dialogueNode: Node = {
            id: dialogueId,
            type: 'dialogue',
            position: { x: position.x + 300, y: position.y + 20 },
            data: {
                label: 'True Branch',
                content: 'Dialogue when condition is true...',
                speaker: 'Speaker',
                tags: [],
                type: 'dialogue'
            }
        };
        newNodes.push(dialogueNode);
        
        newEdges.push({
            id: `e${id}-true-${dialogueId}`,
            source: id,
            sourceHandle: 'true',
            target: dialogueId,
            type: 'default'
        });
    }

    setNodes((nds) => nds.concat(newNodes));
    if (newEdges.length > 0) {
        setEdges((eds) => eds.concat(newEdges));
    }
    setShowAddMenu(false);
  }, [setNodes, setEdges]);

  const handleUpdateNode = useCallback((id: string, data: StoryNodeData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
    setShowRichEditor(false); // Close editor if node is deleted
  }, [setNodes, setEdges]);

  const handleExport = useCallback(() => {
    const project = {
      nodes,
      edges,
      variables,
      version: '1.0',
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, variables]);

  const handleExportHTML = useCallback(() => {
    // Generate standalone HTML
    const projectData = JSON.stringify({ nodes, edges, variables });
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tide Story Export</title>
    <style>
        body { margin: 0; padding: 0; background: #0f0f0f; color: #e0e0e0; font-family: monospace; }
        #app { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .node-title { font-size: 2rem; font-weight: bold; color: #FFC700; margin-bottom: 1rem; }
        .node-content { font-size: 1.1rem; line-height: 1.6; white-space: pre-wrap; margin-bottom: 2rem; }
        .choices { display: flex; flex-direction: column; gap: 0.5rem; }
        .choice-btn { 
            background: transparent; border: 1px solid #333; color: #aaa; 
            padding: 1rem; text-align: left; cursor: pointer; font-family: monospace; font-size: 1rem;
            transition: all 0.2s;
        }
        .choice-btn:hover { border-color: #FFC700; color: #fff; background: rgba(255, 199, 0, 0.1); }
    </style>
</head>
<body>
    <div id="app"></div>
    <script>
        const project = ${projectData};
        const app = document.getElementById('app');
        let currentNodeId = null;
        let variables = { ...project.variables };

        function findStartNode() {
            const start = project.nodes.find(n => n.data.tags && n.data.tags.includes('start'));
            return start ? start.id : (project.nodes.length > 0 ? project.nodes[0].id : null);
        }

        function parseContent(text) {
            return text.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => {
                return variables[key] !== undefined ? variables[key] : '{{' + key + '}}';
            });
        }

        function renderNode(id) {
            const node = project.nodes.find(n => n.id === id);
            if (!node) return;
            currentNodeId = id;

            const edges = project.edges.filter(e => e.source === id);
            
            let html = '<div class="node-title">' + node.data.label + '</div>';
            html += '<div class="node-content">' + parseContent(node.data.content) + '</div>';
            
            html += '<div class="choices">';
            if (edges.length === 0) {
                 html += '<div style="color: #666; font-style: italic;">- End -</div>';
            } else {
                edges.forEach(edge => {
                    const target = project.nodes.find(n => n.id === edge.target);
                    const label = edge.label || (target ? target.data.label : 'Next');
                    html += '<button class="choice-btn" onclick="renderNode(\\'' + edge.target + '\\')">> ' + label + '</button>';
                });
            }
            html += '</div>';
            
            app.innerHTML = html;
        }

        const startId = findStartNode();
        if (startId) renderNode(startId);
        else app.innerHTML = "No start node found.";
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-export-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, variables]);

  const handleExportMD = useCallback(() => {
    let mdContent = `# Story Project Export\nDate: ${new Date().toLocaleString()}\n\n`;
    
    nodes.forEach(node => {
      const data = node.data as StoryNodeData;
      mdContent += `## ${data.label}\n\n`;
      if (data.tags && data.tags.length > 0) {
        mdContent += `Tags: ${data.tags.join(', ')}\n\n`;
      }
      mdContent += `${data.content}\n\n`;
      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-project-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const project = JSON.parse(content);
        
        if (project.nodes && project.edges) {
          setNodes(project.nodes);
          setEdges(project.edges);
          if (project.variables) setVariables(project.variables);
        } else {
          alert('Invalid project file');
        }
      } catch (err) {
        console.error('Failed to parse project file', err);
        alert('Failed to parse project file');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleOpenRichEditor = useCallback(() => {
    setShowRichEditor(true);
  }, []);

  const handleRichEditorChange = useCallback((content: string) => {
    if (selectedNodeId) {
        handleUpdateNode(selectedNodeId, { content } as Partial<StoryNodeData> as any);
    }
  }, [selectedNodeId, handleUpdateNode]);

  const { fitView, setCenter } = useReactFlow();

  const handleTreeCallback = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setCenter(node.position.x, node.position.y, { zoom: 1, duration: 800 });
    }
  }, [nodes, setCenter]);

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center text-[var(--end-text-dim)]">Loading Project...</div>;
  }

  // Script Mode View
  if (viewMode === 'script') {
    return (
        <div className="w-full h-full p-4 bg-slate-50 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={switchToVisualMode}
                        className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-xs hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> 返回可视化
                    </button>
                    <div className="text-sm font-bold text-slate-800">剧本编辑器 (Script Editor)</div>
                </div>
            </div>
            <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <StoryScriptEditor 
                    content={scriptContent}
                    onChange={setScriptContent}
                    onSave={handleScriptSave}
                />
            </div>
        </div>
    );
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const isRichEditorVisible = showRichEditor && selectedNode && 
      (selectedNode.type === 'dialogue' || selectedNode.type === 'narration' || selectedNode.type === 'branch' || selectedNode.type === 'task');

  return (
    <div className="w-full h-[80vh] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative shadow-inner flex flex-col">
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 z-20 shadow-sm">
         <div className="flex items-center gap-3">
            <button 
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                title="返回剧情列表"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            
            <div className="h-6 w-px bg-slate-200" />
            
            <button 
                onClick={() => setShowStoryTree(!showStoryTree)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${showStoryTree ? 'bg-[var(--end-yellow)] text-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                title="剧情大纲树"
            >
                <FontAwesomeIcon icon={faProjectDiagram} />
            </button>

            <button 
                onClick={switchToScriptMode}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                title="切换到纯文本模式"
            >
                <FontAwesomeIcon icon={faFileCode} />
            </button>

            <button 
                onClick={handleSaveToGithub}
                disabled={isSaving}
                className="px-4 py-1.5 bg-[var(--end-yellow)] hover:bg-[var(--end-yellow-hover)] text-black text-sm font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
                <FontAwesomeIcon icon={faSave} className={isSaving ? "animate-spin" : ""} /> 
                {isSaving ? "保存中..." : "保存项目"}
            </button>

            <div className="relative ml-2">
              <button 
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <FontAwesomeIcon icon={faPlus} /> 添加节点
              </button>
              
              {showAddMenu && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-2 flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">基础节点</div>
                  <button onClick={() => handleAddNode('scene')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-800"></span> 场景 (Scene)
                  </button>
                  <button onClick={() => handleAddNode('dialogue')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> 对话 (Dialogue)
                  </button>
                  <button onClick={() => handleAddNode('narration')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> 旁白 (Narration)
                  </button>
                  <button onClick={() => handleAddNode('branch')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span> 支线 (Subplot)
                  </button>
                  <button onClick={() => handleAddNode('task')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 任务 (Task)
                  </button>
                  <div className="my-1 border-t border-slate-100"></div>
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">逻辑控制</div>
                  <button onClick={() => handleAddNode('choice')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> 选项 (Choice)
                  </button>
                  <button onClick={() => handleAddNode('condition')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> 判断 (Condition)
                  </button>
                  <button onClick={() => handleAddNode('setter')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> 变量 (Set Var)
                  </button>
                  <button onClick={() => handleAddNode('reward')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span> 奖励 (Reward)
                  </button>
                  <button onClick={() => handleAddNode('punishment')} className="px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> 惩罚 (Punishment)
                  </button>
                </div>
              )}
            </div>
         </div>

         <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowVarManager(!showVarManager)}
                className={`px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg flex items-center gap-2 transition-colors ${showVarManager ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
                title="全局变量管理"
            >
                <FontAwesomeIcon icon={faCog} /> 变量管理
            </button>
            
            <div className="h-6 w-px bg-slate-200" />
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={handleExport} className="px-3 py-1 hover:bg-white hover:shadow-sm text-slate-600 text-xs font-bold rounded-md transition-all" title="导出 JSON">JSON</button>
                <button onClick={handleExportMD} className="px-3 py-1 hover:bg-white hover:shadow-sm text-slate-600 text-xs font-bold rounded-md transition-all" title="导出 Markdown">MD</button>
                <button onClick={handleExportHTML} className="px-3 py-1 hover:bg-white hover:shadow-sm text-slate-600 text-xs font-bold rounded-md transition-all" title="导出 HTML">HTML</button>
            </div>
            
            <button 
                onClick={handleImportClick}
                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
                title="导入 JSON 项目"
            >
                <FontAwesomeIcon icon={faUpload} />
            </button>
            
            <div className="h-6 w-px bg-slate-200" />

            <button 
                onClick={() => setIsPlaying(true)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
            >
                <FontAwesomeIcon icon={faPlay} /> 试玩剧情
            </button>
         </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />
      
      <div 
        className="relative transition-all duration-300 ease-in-out h-full border-r border-slate-200" 
        style={{ width: isRichEditorVisible ? `${splitRatio}%` : '100%' }}
      >
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange as any} 
            onEdgesChange={onEdgesChange as any}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50"
        >
            <Background gap={20} color="#e2e8f0" />
            <Controls />
            <MiniMap zoomable pannable className="!bg-white !border-slate-200 !rounded-lg !shadow-sm" />
        </ReactFlow>

        {showStoryTree && (
            <div className="absolute top-4 left-4 bottom-4 w-64 animate-in slide-in-from-left duration-300 z-40">
                <StoryTree 
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={handleTreeCallback}
                    onClose={() => setShowStoryTree(false)}
                    className="rounded-xl border border-slate-200/80 shadow-2xl bg-white/95 backdrop-blur-sm"
                />
            </div>
        )}

        {selectedNode && !showVarManager && (
            <NodeEditor 
            nodeId={selectedNode.id}
            data={selectedNode.data as StoryNodeData}
            onUpdate={handleUpdateNode}
            onClose={() => {
              setSelectedNodeId(null);
              setShowRichEditor(false);
            }}
            onDelete={handleDeleteNode}
            onOpenRichEditor={handleOpenRichEditor}
            />
        )}

        {showVarManager && (
            <VariableManager 
                variables={variables}
                onUpdate={(vars) => setVariables(vars)}
                onClose={() => setShowVarManager(false)}
            />
        )}

        {isPlaying && (
            <StoryPlayer 
                nodes={nodes}
                edges={edges}
                initialVariables={variables as Record<string, any>}
                onClose={() => setIsPlaying(false)}
            />
        )}
      </div>

      {isRichEditorVisible && (
        <div 
            className="h-full bg-white shadow-xl relative z-10 animate-in slide-in-from-right duration-300 flex flex-col" 
            style={{ width: `${100 - splitRatio}%` }}
        >
             <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50">
                <span className="font-bold text-sm text-slate-500 ml-2">剧情内容编辑</span>
                <button onClick={() => setShowRichEditor(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
             </div>
             <div className="flex-1 overflow-hidden relative">
                {selectedNode && (
                  <RichTextEditor 
                      content={(selectedNode.data.content as string) || ''}
                      onChange={handleRichEditorChange}
                      readOnly={false}
                  />
                )}
             </div>
        </div>
      )}
      </div>
    </div>
  );
}
