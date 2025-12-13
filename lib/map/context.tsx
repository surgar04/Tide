"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useReducer, useEffect } from 'react';
import { SceneObject, Vector3, EditorMode, MapData } from './types';
import { v4 as uuidv4 } from 'uuid';

interface EditorState {
    objects: Record<string, SceneObject>;
    rootIds: string[];
    selectedIds: string[];
}

type Action = 
    | { type: 'ADD_OBJECT', payload: { obj: SceneObject, parentId?: string } }
    | { type: 'UPDATE_OBJECT', payload: { id: string, changes: Partial<SceneObject> } }
    | { type: 'DELETE_OBJECT', payload: { id: string } }
    | { type: 'SELECT_OBJECT', payload: { id: string | null, multi: boolean } }
    | { type: 'LOAD_MAP', payload: MapData };

interface EditorContextType extends EditorState {
  mode: EditorMode;
  canUndo: boolean;
  canRedo: boolean;
  addObject: (obj: Partial<SceneObject>, parentId?: string) => void;
  selectObject: (id: string | null, multi?: boolean) => void;
  updateObjectTransform: (id: string, pos?: Vector3, rot?: Vector3, scale?: Vector3) => void;
  deleteObject: (id: string) => void;
  setMode: (mode: EditorMode) => void;
  undo: () => void;
  redo: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

// History Stack Implementation
const HISTORY_LIMIT = 50;

export function EditorProvider({ children }: { children: ReactNode }) {
  // State for non-undoable things
  const [mode, setMode] = useState<EditorMode>('select');

  // State for undoable things
  const [history, setHistory] = useState<EditorState[]>([{ objects: {}, rootIds: [], selectedIds: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentState = history[historyIndex];

  const pushState = useCallback((newState: EditorState) => {
      setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(newState);
          if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
          return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, HISTORY_LIMIT - 1));
  }, [historyIndex]);

  const undo = useCallback(() => {
      setHistoryIndex(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
      setHistoryIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history]);

  const addObject = useCallback((obj: Partial<SceneObject>, parentId?: string) => {
    const id = obj.id || uuidv4();
    const newObj: SceneObject = {
      id,
      name: obj.name || 'New Object',
      type: obj.type || 'mesh',
      position: obj.position || [0, 0, 0],
      rotation: obj.rotation || [0, 0, 0],
      scale: obj.scale || [1, 1, 1],
      visible: obj.visible ?? true,
      children: [],
      parentId: parentId || null,
      ...obj
    };

    const nextState = { ...currentState };
    nextState.objects = { ...nextState.objects, [id]: newObj };
    
    if (parentId && nextState.objects[parentId]) {
        const parent = nextState.objects[parentId];
        nextState.objects[parentId] = {
            ...parent,
            children: [...(parent.children || []), id]
        };
    } else {
        nextState.rootIds = [...nextState.rootIds, id];
    }

    pushState(nextState);
  }, [currentState, pushState]);

  const selectObject = useCallback((id: string | null, multi = false) => {
    // Selection is part of state to allow undoing selection changes? 
    // Usually selection is transient, but for heavy editors sometimes it's nice.
    // Let's keep selection transient for now to avoid spamming history, OR specific action.
    // User requested "Undo/Redo System", usually applies to data.
    // We will modify the current state's selection without pushing history, unless we want to track it.
    // For simplicity, let's keep selection OUT of history stack to avoid annoyance, 
    // BUT we need it in the 'state' object for rendering.
    // We will update the CURRENT state in history without advancing index? No, that breaks immutability.
    
    // Let's separate Selection from Undoable State?
    // Actually, many editors DO undo selection. Let's try to just update the state but maybe NOT push a new history entry for simple clicks?
    // For now, let's just make selection NOT undoable to keep it simple and snappy.
    
    // Wait, I defined selectedIds in EditorState.
    // Let's update the current history entry in place? No.
    // Let's decouple selection from history.
    
  }, []);

  // Re-implementing selection as separate state for better UX
  const [selection, setSelection] = useState<string[]>([]);

  const handleSelect = useCallback((id: string | null, multi = false) => {
      if (id === null) {
          setSelection([]);
          return;
      }
      setSelection(prev => multi ? [...prev, id] : [id]);
  }, []);

  const updateObjectTransform = useCallback((id: string, pos?: Vector3, rot?: Vector3, scale?: Vector3) => {
    const nextState = { 
        ...currentState,
        objects: { ...currentState.objects }
    };
    
    const obj = nextState.objects[id];
    if (!obj) return;

    nextState.objects[id] = {
        ...obj,
        position: pos || obj.position,
        rotation: rot || obj.rotation,
        scale: scale || obj.scale
    };

    pushState(nextState);
  }, [currentState, pushState]);

  const deleteObject = useCallback((id: string) => {
      const nextState = { 
          ...currentState,
          objects: { ...currentState.objects },
          rootIds: [...currentState.rootIds]
      };
      
      const obj = nextState.objects[id];
      if (!obj) return;

      delete nextState.objects[id];
      
      if (obj.parentId && nextState.objects[obj.parentId]) {
          const parent = nextState.objects[obj.parentId];
          nextState.objects[obj.parentId] = {
              ...parent,
              children: parent.children?.filter(cid => cid !== id)
          };
      } else {
          nextState.rootIds = nextState.rootIds.filter(rid => rid !== id);
      }
      
      setSelection(prev => prev.filter(sid => sid !== id));
      pushState(nextState);
  }, [currentState, pushState]);

  return (
    <EditorContext.Provider value={{
      objects: currentState.objects,
      rootIds: currentState.rootIds,
      selectedIds: selection,
      mode,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1,
      addObject,
      selectObject: handleSelect,
      updateObjectTransform,
      deleteObject,
      setMode,
      undo,
      redo
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
