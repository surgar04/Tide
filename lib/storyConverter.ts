import { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { NodeType, StoryNodeData } from '../app/story/types';

// Simplified Regex Patterns
const SCENE_REGEX = /^\[\s*场景\s*[：:]\s*(.*?)\s*\]$/;
const NARRATION_REGEX = /^\[\s*旁白\s*[：:]\s*(.*?)\s*\]$/;
const DIALOGUE_REGEX = /^\[\s*对话\s*-\s*(.*?)\s*[：:]\s*(.*?)\s*\]$/;
const TASK_REGEX = /^\[\s*任务\s*[：:]\s*(.*?)\s*\]$/;
const CHOICE_BLOCK_START = /^\[\s*选项\s*[：:]\s*$/;
const CONDITION_BLOCK_START = /^\[\s*判断\s*[：:]\s*$/;
const SETTER_REGEX = /^\[\s*变量\s*[：:]\s*(.*?)\s*=\s*(.*?)\s*\]$/;
const BRANCH_REGEX = /^\[\s*支线\s*[：:]\s*(.*?)\s*\]$/;
const REWARD_REGEX = /^\[\s*奖励\s*[：:]\s*(.*?)\s*(\d+)\s*\]$/; // [ 奖励：Gold 100 ]
const PUNISHMENT_REGEX = /^\[\s*惩罚\s*[：:]\s*(.*?)\s*(\d+)\s*\]$/; // [ 惩罚：HP 10 ]
const BLOCK_END = /^\s*\]\s*$/;
const OPTION_LINE = /^\s*-\s*(.*?)$/;
const CONDITION_LINE = /^\s*-\s*(.*?)\s*[：:]\s*(.*?)$/;

// Helper to sanitize labels for IDs
const toId = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

export function nodesToScript(nodes: Node[], edges: Edge[]): string {
  let script = "";
  
  // Topological sort or Y-position sort to maintain flow
  // For simplicity, we just sort by Y position for now, but a true traversal would be better
  // to reconstruct the "Story".
  // However, given the graph nature, Y-sort is a decent approximation for linear-ish stories.
  
  const sortedNodes = [...nodes].sort((a, b) => {
      // Primary: Y position
      if (Math.abs(a.position.y - b.position.y) > 50) return a.position.y - b.position.y;
      // Secondary: X position
      return a.position.x - b.position.x;
  });

  // Track processed nodes to avoid duplicates if we do traversal later
  // const processed = new Set<string>();

  sortedNodes.forEach(node => {
    const data = node.data as StoryNodeData;
    const type = node.type;

    if (type === 'scene') {
        script += `[ 场景：${data.label} ]\n`;
        if (data.content && data.content !== 'Scene description...') script += `> ${data.content}\n`; // Optional description syntax?
    } else if (type === 'narration') {
        script += `[ 旁白：${data.content} ]\n`;
    } else if (type === 'dialogue') {
        script += `[ 对话-${data.speaker || '???'}: ${data.content} ]\n`;
    } else if (type === 'task') {
        script += `[ 任务：${data.label} ]\n`;
    } else if (type === 'branch') {
        script += `[ 支线：${data.label} ]\n`;
    } else if (type === 'setter') {
        script += `[ 变量：${data.variable} = ${data.value} ]\n`;
    } else if (type === 'reward') {
        script += `[ 奖励：${data.rewardType} ${data.amount} ]\n`;
    } else if (type === 'punishment') {
        script += `[ 惩罚：${data.punishmentType} ${data.amount} ]\n`;
    } else if (type === 'choice') {
        script += `[ 选项：\n`;
        // Find outgoing edges to get options
        const choices = (data.choices || []) as any[];
        choices.forEach(choice => {
            // Find target node for this choice handle
            const edge = edges.find(e => e.source === node.id && e.sourceHandle === choice.id);
            // We only print the label here. Connection logic is implicit in parsing?
            // User wanted "Automatic ID generation".
            // In script -> nodes, we generate IDs.
            // In nodes -> script, we lose explicit IDs.
            // This is a lossy conversion unless we embed IDs or strictly follow order.
            script += `    - ${choice.label}\n`;
        });
        script += `]\n`;
    } else if (type === 'condition') {
         script += `[ 判断：\n`;
         // Condition node usually has True/False branches
         // But user example was switch-case style linked to previous choice.
         // Standard Condition Node:
         script += `    Condition: ${data.condition}\n`;
         script += `]\n`;
    }

    script += `\n`;
  });

  return script;
}

export function scriptToNodes(script: string, existingNodes: Node[], prefabBindings: Record<string, any[]> = {}): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const lines = script.split('\n');
  
  let lastNodeId: string | null = null;
  let currentY = 0;
  
  // Context for block parsing
  let inChoiceBlock = false;
  let currentChoiceNode: Node | null = null;
  let choiceOptions: { label: string, id: string, explicitId?: string }[] = [];
  
  let inConditionBlock = false; // "判断" block
  
  // Helper to add node
  const addNode = (type: NodeType, data: any, customId?: string) => {
      const id = customId || uuidv4();
      const node: Node = {
          id,
          type,
          position: { x: 250, y: currentY },
          data: { ...data, type }
      };
      nodes.push(node);
      currentY += 200; // Auto-layout Y increment
      
      // Auto-link from previous node (if linear)
      if (lastNodeId && !inChoiceBlock && !inConditionBlock) {
          // If previous node was a choice, we don't auto-link linearly because choice has branches
          // Unless this new node is a merge point? 
          // For simplicity: Linear linking only if previous node wasn't a branching node (Choice/Condition)
          const lastNode = nodes.find(n => n.id === lastNodeId);
          if (lastNode && lastNode.type !== 'choice' && lastNode.type !== 'condition') {
              edges.push({
                  id: `e-${lastNodeId}-${id}`,
                  source: lastNodeId,
                  target: id
              });
          }
      }
      
      lastNodeId = id;
      return node;
  };

  for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 1. Scene
      const sceneMatch = line.match(SCENE_REGEX);
      if (sceneMatch) {
          addNode('scene', { label: sceneMatch[1], content: 'Scene description...' });
          continue;
      }

      // 2. Narration
      const narrationMatch = line.match(NARRATION_REGEX);
      if (narrationMatch) {
          addNode('narration', { content: narrationMatch[1] });
          continue;
      }

      // 3. Dialogue (Standard: [ 对话-Speaker: Content ])
      const dialogueMatch = line.match(DIALOGUE_REGEX);
      if (dialogueMatch) {
          addNode('dialogue', { speaker: dialogueMatch[1], content: dialogueMatch[2] });
          continue;
      }

      // 3.1 Dialogue (Natural: Speaker：Content)
      // Check for Prefab syntax in Speaker or Content?
      // Regex: ^(.*?)\s*[：:]\s*(.*)$
      // But we need to exclude block starts like [ ... ]
      if (!line.startsWith('[') && !line.startsWith('-')) {
          const naturalDialogueMatch = line.match(/^(.*?)\s*[：:]\s*(.*)$/);
          if (naturalDialogueMatch) {
              const speaker = naturalDialogueMatch[1].trim();
              const content = naturalDialogueMatch[2].trim();
              
              // Check if speaker matches a prefab binding?
              // But prefab syntax in script is usually explicit {{Role:ID}}
              // If we want to support "Role: Content" -> PrefabNode, we need to know the binding ID.
              // If we don't know the binding ID, we can't create a PrefabNode that links to a specific binding.
              // Unless we search bindings by name and pick the first one?
              
              let bindingId: string | null = null;
              let foundBinding: any = null;
              
              if (prefabBindings[speaker] && prefabBindings[speaker].length > 0) {
                   // Pick the first binding for this speaker?
                   // Or should we require explicit syntax?
                   // User said "Need to correctly set prefabs".
                   // Let's try to use the first binding if available.
                   foundBinding = prefabBindings[speaker][0];
                   bindingId = foundBinding.id;
              }
              
              if (foundBinding) {
                   addNode('prefab', {
                       label: content || speaker,
                       content: content,
                       prefabId: bindingId,
                       targetNodeId: foundBinding.targetNodeId,
                       targetNodeName: foundBinding.npcName,
                       targetNodeType: foundBinding.targetNodeType,
                       color: foundBinding.color
                   });
              } else {
                   // Fallback to standard dialogue
                   addNode('dialogue', { speaker, content });
              }
              continue;
          }
      }
      
      // 3.2 Explicit Prefab Line: {{Role:ID}}: Content
      const prefabLineMatch = line.match(/^\{\{(.*?):(.*?)\}\}\s*[：:]?\s*(.*)$/);
      if (prefabLineMatch) {
          const npcName = prefabLineMatch[1];
          const bindingId = prefabLineMatch[2];
          const actualContent = prefabLineMatch[3] || '';
          
          let foundBinding: any = null;
          Object.values(prefabBindings).forEach(bindings => {
              const b = bindings.find(item => item.id === bindingId);
              if (b) foundBinding = b;
          });

          if (foundBinding) {
               addNode('prefab', {
                   label: actualContent || foundBinding.npcName,
                   content: actualContent,
                   prefabId: bindingId,
                   targetNodeId: foundBinding.targetNodeId,
                   targetNodeName: foundBinding.npcName,
                   targetNodeType: foundBinding.targetNodeType,
                   color: foundBinding.color
               });
               continue;
          }
      }
      
      // 4. Task
      const taskMatch = line.match(TASK_REGEX);
      if (taskMatch) {
          addNode('task', { label: taskMatch[1], taskStatus: 'pending' });
          continue;
      }

      // 5. Setter
      const setterMatch = line.match(SETTER_REGEX);
      if (setterMatch) {
          addNode('setter', { variable: setterMatch[1], value: setterMatch[2] });
          continue;
      }
      
      // 6. Branch (Supports standard [ 支线：Label ] and simplified [如果...])
      const branchMatch = line.match(BRANCH_REGEX);
      if (branchMatch) {
          addNode('branch', { label: branchMatch[1] });
          continue;
      }
      
      // 6.1 Logical Branch (If/Else)
      // [如果 condition] -> Branch Node?
      // Or should it be a Condition Node?
      // In our DSL, Condition Node [ 判断： ] has options.
      // But [如果 condition] implies a flow control.
      // We can map it to a Condition Node with label "如果 condition"?
      // But "如果" usually wraps a block.
      // scriptToNodes is flat linear parser. It doesn't handle nesting well except for Choice/Condition blocks.
      // But we can treat [如果 ...] as a Label/Marker for now?
      // Or map it to a "branch" node to visualize the logic flow?
      if (line.startsWith('[如果') || line.startsWith('[否则') || line.startsWith('[结束如果]')) {
           // Treat as a logic node or comment
           // Let's make it a 'branch' node to visualize the flow structure
           const content = line.replace(/^\[|\]$/g, '').trim();
           addNode('branch', { label: content });
           continue;
      }
      
      // 6.2 Goto / Jump
      // [前往: Label] or [跳转: Label]
      // We need to implement this as an Edge to a node with that Label.
      // But we might not have parsed that node yet.
      // So we need a second pass or deferred linking.
      // Let's store "jumps" and resolve them after parsing.
      // Since scriptToNodes returns { nodes, edges }, we can process jumps at the end?
      // But we need to modify the function to support deferred edges.
      // Let's just add a "Jump Node" for now? No, we want an Edge.
      // Regex: \[前往[:：]\s*(.*?)\]
      const jumpMatch = line.match(/^\[(?:前往|跳转)[:：]\s*(.*?)\]$/);
      if (jumpMatch) {
           const targetLabel = jumpMatch[1];
           // We can't link yet.
           // Store it in a "jumps" array: { sourceId: lastNodeId, targetLabel }
           // But we can't easily modify the function scope variables unless we lift them.
           // Let's add a special 'jump' node type? Or just a comment node?
           // Better: Add a "branch" node that says "Go to: targetLabel".
           // AND try to add an edge if we find the node later?
           // Real "Goto" support requires multi-pass parsing.
           addNode('branch', { label: `跳转至: ${targetLabel}` });
           continue;
      }
      
      // 7. Reward
      const rewardMatch = line.match(REWARD_REGEX);
      if (rewardMatch) {
          addNode('reward', { rewardType: rewardMatch[1], amount: rewardMatch[2] });
          continue;
      }
      
      // 8. Punishment
      const punishmentMatch = line.match(PUNISHMENT_REGEX);
      if (punishmentMatch) {
          addNode('punishment', { punishmentType: punishmentMatch[1], amount: punishmentMatch[2] });
          continue;
      }

      // 9. Choice Block Start
      if (CHOICE_BLOCK_START.test(line)) {
          inChoiceBlock = true;
          choiceOptions = [];
          // Create the choice node container immediately? Or wait?
          // Create immediately to establish ID
          currentChoiceNode = addNode('choice', { label: 'Choice', choices: [] });
          continue;
      }

      // 10. Condition Block Start (User's "判断")
      // User Logic: [ 判断： - Option1: Reply1 ... ]
      // This implies linking previous choice options to new nodes
      if (CONDITION_BLOCK_START.test(line)) {
          inConditionBlock = true;
          continue;
      }

      // Process Block Content
      if (inChoiceBlock) {
          if (BLOCK_END.test(line)) {
              inChoiceBlock = false;
              // Update choice node with collected options
              if (currentChoiceNode) {
                  currentChoiceNode.data = { ...currentChoiceNode.data, choices: choiceOptions };
                  // Reset linear flow tracking? 
                  // The Choice node is now lastNodeId. 
                  // Subsequent nodes shouldn't auto-link to it as target (it's source).
                  // But linear auto-link logic checks `lastNode.type !== 'choice'`.
                  // So next nodes won't auto-connect. Good.
              }
              continue;
          }
          
          const optMatch = line.match(OPTION_LINE);
          if (optMatch) {
              let label = optMatch[1];
              let explicitId = undefined;
              
              // Check for explicit ID: [[ID]] Label
              const explicitIdMatch = label.match(/^\[\[(.*?)\]\]\s*(.*)$/);
              if (explicitIdMatch) {
                  explicitId = explicitIdMatch[1];
                  label = explicitIdMatch[2] || explicitId; // Use ID as label if no text
              }

              // Use explicit ID as handle ID if present? Or store it?
              // The handle ID (choice.id) is used for linking.
              // If we use explicit ID as handle ID, it's easier to link.
              const id = explicitId || uuidv4(); 
              
              choiceOptions.push({ label, id, explicitId });
          }
      }

      if (inConditionBlock) {
          if (BLOCK_END.test(line)) {
              inConditionBlock = false;
              continue;
          }

          // Format: - OptionLabel: Response Content
          // Logic: Find the previous ChoiceNode. Find the option with OptionLabel.
          // Create a new DialogueNode with Response Content.
          // Create Edge: ChoiceNode(handle=optionId) -> DialogueNode.
          const condMatch = line.match(CONDITION_LINE);
          if (condMatch && currentChoiceNode) {
              const optRef = condMatch[1].trim(); // Label or [[ID]]
              const responseContent = condMatch[2].trim();
              
              // Find option ID
              const prevChoices = (currentChoiceNode.data as any).choices || [];
              let matchedOpt = null;

              // Check if optRef is [[ID]]
              const refIdMatch = optRef.match(/^\[\[(.*?)\]\]$/);
              if (refIdMatch) {
                  const refId = refIdMatch[1];
                  matchedOpt = prevChoices.find((c: any) => c.id === refId || c.explicitId === refId);
              } else {
                  matchedOpt = prevChoices.find((c: any) => c.label === optRef);
              }
              
              if (matchedOpt) {
                  // Check for Prefab Syntax in Content: {{NPC:BindingID}} or {{BindingID}}
                  // User Insertion: {{NPCName:BindingID}}
                  // Regex to find binding ID
                  const prefabMatch = responseContent.match(/^\{\{(.*?):(.*?)\}\}\s*[：:]?\s*(.*)$/);
                  
                  let nodeType: NodeType = 'dialogue';
                  let nodeData: any = { speaker: '???', content: responseContent, type: 'dialogue' };
                  
                  if (prefabMatch) {
                      const npcName = prefabMatch[1];
                      const bindingId = prefabMatch[2];
                      const actualContent = prefabMatch[3] || '';
                      
                      // Look up binding
                      // prefabBindings is Record<string, any[]> (name -> bindings)
                      // We need to find the binding by ID across all names
                      let foundBinding: any = null;
                      Object.values(prefabBindings).forEach(bindings => {
                          const b = bindings.find(item => item.id === bindingId);
                          if (b) foundBinding = b;
                      });

                      if (foundBinding) {
                           // Use the bound node type if possible?
                           // But for now, we use 'prefab' type wrapper to allow special rendering
                           // OR we can use the bound type directly but add prefab metadata.
                           // User: "Render as bound node's graph"
                           // If we use 'prefab' type, PrefabNode component handles it.
                           nodeType = 'prefab';
                           nodeData = {
                               ...nodeData, // defaults
                               type: 'prefab',
                               label: actualContent || foundBinding.npcName,
                               content: actualContent,
                               prefabId: bindingId,
                               targetNodeId: foundBinding.targetNodeId,
                               targetNodeName: foundBinding.npcName, // Store NPC name
                               targetNodeType: foundBinding.targetNodeType,
                               color: foundBinding.color
                           };
                      }
                  }

                  // Create response node
                  // We manually place it. 
                  // X offset based on option index?
                  const optIndex = prevChoices.indexOf(matchedOpt);
                  const responseNodeId = uuidv4();
                  const responseNode: Node = {
                      id: responseNodeId,
                      type: nodeType,
                      position: { 
                          x: currentChoiceNode.position.x + (optIndex - prevChoices.length/2) * 300, 
                          y: currentChoiceNode.position.y + 200 
                      },
                      data: nodeData
                  };
                  nodes.push(responseNode);
                  
                  // Link
                  edges.push({
                      id: `e-${currentChoiceNode.id}-${responseNodeId}`,
                      source: currentChoiceNode.id,
                      target: responseNodeId,
                      sourceHandle: matchedOpt.id
                  });
                  
                  // Update lastNodeId?
                  // If we have multiple branches, linear flow is broken.
                  // We assume subsequent content starts a NEW linear chain or user manually manages it.
                  // For now, let's leave lastNodeId as the LAST created branch response.
                  // This means next "Scene" will connect to the LAST option's response.
                  // This is a simple linear approximation.
                  lastNodeId = responseNodeId;
              }
          }
      }
  }

  return { nodes, edges };
}
