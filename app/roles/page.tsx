"use client";

import { useState } from 'react';
import { PageHeader } from "@/components/ui/PageHeader";
import CharacterList from './components/CharacterList';
import CharacterEditor from './components/CharacterEditor';
import { GameCharacter } from './types';
import { v4 as uuidv4 } from 'uuid';

export default function RolesPage() {
  const [characters, setCharacters] = useState<GameCharacter[]>([]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<GameCharacter | undefined>(undefined);

  const handleAdd = () => {
    setEditingCharacter(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (char: GameCharacter) => {
    setEditingCharacter(char);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个角色吗？此操作不可撤销。')) {
      setCharacters(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSave = (char: GameCharacter) => {
    if (editingCharacter) {
      // Update existing
      setCharacters(prev => prev.map(c => c.id === char.id ? char : c));
    } else {
      // Create new
      setCharacters(prev => [...prev, char]);
    }
    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <PageHeader 
        title="角色设计 | CHARACTER DESIGN" 
        description="管理游戏角色、NPC数据、美术资源与属性配置" 
      />
      
      <div className="flex-1 overflow-hidden">
        <CharacterList 
          characters={characters}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {isEditorOpen && (
        <CharacterEditor 
          character={editingCharacter}
          onSave={handleSave}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}
