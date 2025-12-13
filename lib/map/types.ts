export type Vector3 = [number, number, number];
export type Quaternion = [number, number, number, number];

export interface SceneObject {
  id: string;
  name: string;
  type: 'mesh' | 'light' | 'camera' | 'empty' | 'model';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  visible: boolean;
  children?: string[]; // IDs of children
  parentId?: string | null;
  properties?: Record<string, any>;
  prefabId?: string; // If it's an instance of a prefab
}

export type EditorMode = 'select' | 'translate' | 'rotate' | 'scale' | 'terrain';

export interface MapData {
    name: string;
    version: string;
    objects: Record<string, SceneObject>;
    rootIds: string[];
}
