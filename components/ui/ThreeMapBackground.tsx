"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Shader for the terrain
const TerrainShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColorMain: { value: new THREE.Color("#d4d4d4") }, // Grid color
    uColorHigh: { value: new THREE.Color("#FFC700") }, // Highlight color (Yellow)
  },
  vertexShader: `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Flat terrain, minimal elevation
      float elevation = 0.0;
      
      pos.z += elevation; 
      vElevation = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vElevation;
    uniform vec3 uColorMain;
    uniform vec3 uColorHigh;
    uniform float uTime;

    void main() {
      // Grid effect
      float gridX = step(0.98, fract(vUv.x * 50.0));
      float gridY = step(0.98, fract(vUv.y * 50.0));
      float grid = max(gridX, gridY);

      // Scanline effect (Radar sweep)
      float dist = distance(vUv, vec2(0.5));
      float scan = step(0.48, fract(dist * 2.0 - uTime * 0.1)) * step(fract(dist * 2.0 - uTime * 0.1), 0.5);
      
      // Mix colors
      vec3 color = uColorMain;
      
      // Scanline highlight
      if (scan > 0.0) {
        color = mix(color, uColorHigh, 0.3);
      }

      // Alpha mask for grid
      float alpha = grid * 0.4 + (scan * 0.2);
      
      // Distance fade (fog-like)
      float fade = distance(vUv, vec2(0.5));
      alpha *= (1.0 - fade * 1.5);

      gl_FragColor = vec4(color, alpha);
    }
  `
};

function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  // Plane geometry for the terrain
  // args: [width, height, widthSegments, heightSegments]
  const geometry = useMemo(() => new THREE.PlaneGeometry(10, 10, 128, 128), []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -0.5, 0]}>
      <primitive object={geometry} />
      <shaderMaterial
        ref={shaderRef}
        args={[TerrainShaderMaterial]}
        transparent
        wireframe={false} // We draw grid in shader, or we can use true for real wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function ThreeMapBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[var(--end-bg)]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
        
        {/* Environment */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Terrain */}
        <Terrain />
        
        {/* Fog to blend edges */}
        <fog attach="fog" args={['#f4f4f4', 2, 8]} />
      </Canvas>
      
      {/* Overlay UI Elements */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-8 left-8">
             <div className="flex flex-col gap-1 border-l-2 border-[var(--end-yellow)] pl-3">
                 <span className="text-xs font-mono font-bold text-[var(--end-text-sub)]">TERRAIN_SYS</span>
                 <span className="text-[10px] text-[var(--end-text-dim)]">ONLINE // SCANNING</span>
             </div>
         </div>
      </div>
    </div>
  );
}
