import { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { NodeType } from '../app/story/types';

interface ParsedNode {
  id: string;
  label: string;
  type: NodeType;
  data: any;
  position: { x: number; y: number };
}

export function nodesToScript(nodes: Node[], edges: Edge[]): string {
  let script = "";

  // Sort nodes by vertical position to keep a logical flow in text
  const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);

  sortedNodes.forEach(node => {
    script += `# ${node.data.label || 'Untitled Node'}\n`;
    script += `ID: ${node.id}\n`;
    script += `Type: ${node.type || 'custom'}\n`;
    if (node.position) {
      script += `Position: ${Math.round(node.position.x)}, ${Math.round(node.position.y)}\n`;
    }
    
    // Node specific data
    const data: any = node.data || {};

    if (data.speaker) script += `Speaker: ${data.speaker}\n`;
    if (data.tags && Array.isArray(data.tags)) script += `Tags: ${data.tags.join(', ')}\n`;
    
    // Specific Node Properties
    if (data.condition) script += `Condition: ${data.condition}\n`;
    if (data.variable) script += `Variable: ${data.variable}\n`;
    if (data.value) script += `Value: ${data.value}\n`;
    if (data.taskStatus) script += `TaskStatus: ${data.taskStatus}\n`;
    if (data.rewardType) script += `RewardType: ${data.rewardType}\n`;
    if (data.punishmentType) script += `PunishmentType: ${data.punishmentType}\n`;
    if (data.amount) script += `Amount: ${data.amount}\n`;

    script += `\n`; // Separator
    
    // Content
    if (data.content) {
      script += `${data.content}\n`;
    }

    script += `\n`;

    // Outgoing connections (Edges)
    const nodeEdges = edges.filter(e => e.source === node.id);
    if (nodeEdges.length > 0) {
      script += `### Links\n`;
      nodeEdges.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        const targetLabel = targetNode?.data.label || edge.target;
        const edgeLabel = edge.label || 'Next';
        script += `- [${edgeLabel}] -> [[${targetLabel}]]\n`;
      });
    }
    
    script += `\n---\n\n`;
  });

  return script;
}

export function scriptToNodes(script: string, existingNodes: Node[]): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const blocks = script.split(/^---$/gm);
  
  const labelToIdMap: Record<string, string> = {};
  const linksToProcess: { sourceId: string, label: string, targetLabel: string }[] = [];

  blocks.forEach(block => {
    const lines = block.trim().split('\n');
    if (lines.length === 0) return;

    let currentNode: Partial<Node> = {
      id: uuidv4(),
      type: 'storyNode',
      position: { x: 0, y: 0 },
      data: { label: 'New Node' }
    };
    
    let isReadingContent = false;
    let contentBuffer = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('# ')) {
        currentNode.data = { ...currentNode.data, label: line.substring(2).trim() };
        isReadingContent = false;
      } else if (line.startsWith('ID: ')) {
        currentNode.id = line.substring(4).trim();
      } else if (line.startsWith('Type: ')) {
        currentNode.type = line.substring(6).trim();
      } else if (line.startsWith('Position: ')) {
        const [x, y] = line.substring(10).split(',').map(n => parseInt(n.trim()));
        currentNode.position = { x: x || 0, y: y || 0 };
      } else if (line.startsWith('Speaker: ')) {
        currentNode.data = { ...currentNode.data, speaker: line.substring(9).trim() };
      } else if (line.startsWith('Tags: ')) {
        currentNode.data = { ...currentNode.data, tags: line.substring(6).split(',').map(t => t.trim()) };
      } else if (line.startsWith('Condition: ')) {
        currentNode.data = { ...currentNode.data, condition: line.substring(11).trim() };
      } else if (line.startsWith('Variable: ')) {
        currentNode.data = { ...currentNode.data, variable: line.substring(10).trim() };
      } else if (line.startsWith('Value: ')) {
        currentNode.data = { ...currentNode.data, value: line.substring(7).trim() };
      } else if (line.startsWith('TaskStatus: ')) {
        currentNode.data = { ...currentNode.data, taskStatus: line.substring(12).trim() };
      } else if (line.startsWith('RewardType: ')) {
        currentNode.data = { ...currentNode.data, rewardType: line.substring(12).trim() };
      } else if (line.startsWith('PunishmentType: ')) {
        currentNode.data = { ...currentNode.data, punishmentType: line.substring(16).trim() };
      } else if (line.startsWith('Amount: ')) {
        currentNode.data = { ...currentNode.data, amount: line.substring(8).trim() };
      } else if (line.startsWith('### Links')) {
        isReadingContent = false;
      } else if (line.startsWith('- [')) {
        // Link parsing: - [Label] -> [[Target]]
        const match = line.match(/- \[(.*?)\] -> \[\[(.*?)\]\]/);
        if (match && currentNode.id) {
           linksToProcess.push({
             sourceId: currentNode.id,
             label: match[1],
             targetLabel: match[2]
           });
        }
      } else {
        // Content
        if (line.length > 0 && !line.includes(': ')) {
            contentBuffer += line + "\n";
        }
      }
    }
    
    if (currentNode.id && currentNode.data) {
        currentNode.data.content = contentBuffer.trim();
        // Preserve existing node properties if ID matches (to keep other data not in script)
        const existing = existingNodes.find(n => n.id === currentNode.id);
        if (existing) {
            nodes.push({
                ...existing,
                ...currentNode as Node,
                data: { ...existing.data, ...currentNode.data }
            });
        } else {
            nodes.push(currentNode as Node);
        }
        
        labelToIdMap[currentNode.data.label as string] = currentNode.id;
    }
  });

  // Rebuild Edges
  linksToProcess.forEach(link => {
      // Find target ID by Label
      // Priority: 1. Exact Label Match 2. Target is an ID
      let targetId = labelToIdMap[link.targetLabel];
      if (!targetId) {
          // Check if targetLabel is actually an ID
          const targetNodeById = nodes.find(n => n.id === link.targetLabel);
          if (targetNodeById) targetId = targetNodeById.id;
      }

      if (targetId) {
          edges.push({
              id: `e${link.sourceId}-${targetId}-${uuidv4().slice(0, 4)}`,
              source: link.sourceId,
              target: targetId,
              label: link.label
          });
      }
  });

  return { nodes, edges };
}
