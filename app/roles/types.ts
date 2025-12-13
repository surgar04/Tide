export type CharacterType = 'Player' | 'NPC' | 'Monster';

export interface CharacterAsset {
  id: string;
  type: 'portrait' | 'model' | 'texture' | 'other';
  url: string;
  name: string;
  file?: File; // For handling uploads before upload
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

export interface GameCharacter {
  id: string;
  name: string;
  type: CharacterType;
  faction?: string; // New faction field (Faction ID or Name)
  region?: string; // For NPCs
  description: string;
  initialStats: Record<string, string | number>;
  assets: CharacterAsset[];
  createdAt: number;
  updatedAt: number;
}
