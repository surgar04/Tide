"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useEditor } from "@/lib/map/context";
import { SceneObject } from "@/lib/map/types";
import { useRef } from "react";
import * as THREE from "three";

function SceneNode({ id }: { id: string }) {
  const { objects, selectedIds, selectObject } = useEditor();
  const obj = objects[id];
  const meshRef = useRef<THREE.Mesh>(null);

  if (!obj) return null;

  const isSelected = selectedIds.includes(id);

  return (
    <group
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
      onClick={(e) => {
        e.stopPropagation();
        selectObject(id, e.ctrlKey);
      }}
    >
      {obj.type === 'mesh' && (
        <mesh ref={meshRef}>
          <boxGeometry />
          <meshStandardMaterial color={isSelected ? "#ffaa00" : "#cccccc"} />
        </mesh>
      )}
      {obj.type === 'light' && (
        <group>
             <pointLight intensity={10} distance={10} />
             <mesh>
                 <sphereGeometry args={[0.2]} />
                 <meshBasicMaterial color="yellow" wireframe />
             </mesh>
        </group>
      )}
      
      {/* Render children */}
      {obj.children?.map(childId => (
        <SceneNode key={childId} id={childId} />
      ))}
    </group>
  );
}

function EditorScene() {
  const { rootIds } = useEditor();
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      <Grid infiniteGrid sectionSize={1} cellSize={1} fadeDistance={30} sectionColor="#666" cellColor="#444" />
      
      {rootIds.map(id => (
        <SceneNode key={id} id={id} />
      ))}
    </>
  );
}

export function Viewport() {
  return (
    <div className="w-full h-full bg-[#111] relative overflow-hidden rounded-lg border border-[var(--end-border)]">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <EditorScene />
        <OrbitControls makeDefault />
        {/* Environment preset removed to prevent network errors in offline mode */}
        {/* <Environment preset="city" /> */}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['#ff3e3e', '#8eff3e', '#3e8eff']} labelColor="black" />
        </GizmoHelper>
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-white/50 font-mono border border-white/10">
              VIEWPORT 01 [PERSPECTIVE]
          </div>
      </div>
    </div>
  );
}
