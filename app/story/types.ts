export type NodeType = 'storyNode' | 'dialogue' | 'choice' | 'condition' | 'setter' | 'scene' | 'narration' | 'branch' | 'task' | 'reward' | 'punishment' | 'prefab';

export interface ChoiceOption {
  id: string;
  label: string;
  action?: string; // e.g. "choice=1"
}

export interface StoryNodeData extends Record<string, unknown> {
  label: string;
  content?: string;
  tags?: string[];
  
  // Specific fields
  type?: NodeType;
  speaker?: string;
  choices?: ChoiceOption[];
  condition?: string; // e.g. "choice == 1"
  variable?: string;
  value?: string;
  
  // Task/Reward/Punishment fields
  taskStatus?: 'pending' | 'completed' | 'failed';
  rewardType?: string; // e.g. "gold", "exp", "item"
  punishmentType?: string; // e.g. "hp", "gold"
  amount?: string | number;

  // Prefab fields
  prefabId?: string;
  targetNodeName?: string;
  targetNodeType?: string;
}

export interface StoryLink {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface StoryProject {
  id: string;
  name: string;
  version: string;
  nodes: any[]; // reactflow nodes
  edges: any[]; // reactflow edges
  variables: Record<string, any>;
  prefabBindings?: Record<string, any[]>;
  lastModified: number;
}
