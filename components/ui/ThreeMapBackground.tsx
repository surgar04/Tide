"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

// Scan colors to cycle through
const SCAN_COLORS = [
    "#00ff88", // Green
    "#00ccff", // Blue
    "#ff0055", // Red/Pink
    "#ffcc00", // Yellow
    "#aa00ff", // Purple
];

// Shader for the terrain
const TerrainShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColorMain: { value: new THREE.Color("#2d2d2d") }, // Darker Grid
    uColorScan: { value: new THREE.Color("#00ff88") }, // Dynamic Scan Color
    uColorHigh2: { value: new THREE.Color("#00ccff") }, // Cyber Blue
  },
  vertexShader: `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;

    // Simple pseudo-random noise
    float random (in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // 2D Noise
    float noise (in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        // Four corners in 2D of a tile
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Dynamic elevation based on noise and time
      float n = noise(vUv * 10.0 + uTime * 0.2);
      float elevation = n * 0.5;
      
      pos.z += elevation; 
      vElevation = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vElevation;
    uniform vec3 uColorMain;
    uniform vec3 uColorScan;
    uniform vec3 uColorHigh2;
    uniform float uTime;

    void main() {
      // Grid effect
      float gridX = step(0.98, fract(vUv.x * 40.0));
      float gridY = step(0.98, fract(vUv.y * 40.0));
      float grid = max(gridX, gridY);

      // Moving scanlines
      float scan = step(0.5, sin(vUv.y * 100.0 + uTime * 2.0));
      
      // Radar sweep
      float dist = distance(vUv, vec2(0.5));
      // Sweep logic: dist * 3.0 - uTime * 0.2
      // We want a ring that moves outward.
      float sweepPhase = fract(dist * 3.0 - uTime * 0.2);
      float sweep = step(0.48, sweepPhase) * step(sweepPhase, 0.5);
      
      // Mix colors
      vec3 color = uColorMain;
      
      // Elevation highlight
      color = mix(color, uColorHigh2, vElevation * 1.5);

      // Grid highlight
      if (grid > 0.0) {
        color = mix(color, uColorScan, 0.3); // Grid also pulses a bit with scan color? Or keep static. Let's use scan color for coherence.
      }
      
      // Sweep highlight - This is the main scanline
      if (sweep > 0.0) {
         color += uColorScan * 0.8;
      }

      // Alpha mask
      float alpha = grid * 0.3 + (sweep * 0.5) + (vElevation * 0.2);
      
      // Distance fade (vignette/fog)
      float fade = distance(vUv, vec2(0.5));
      alpha *= (1.0 - fade * 1.8);
      alpha = clamp(alpha, 0.0, 1.0);

      gl_FragColor = vec4(color, alpha);
    }
  `
};

function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  // Plane geometry: [width, height, widthSegments, heightSegments]
  const geometry = useMemo(() => new THREE.PlaneGeometry(15, 15, 128, 128), []);
  
  // Current scan color target
  const colorRef = useRef(new THREE.Color(SCAN_COLORS[0]));
  const colorIndexRef = useRef(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = time;
      
      // Cycle colors every time the main wave resets (roughly every 5 seconds since speed is 0.2)
      // Phase = time * 0.2. 
      const index = Math.floor(time * 0.2);
      
      if (index !== colorIndexRef.current) {
          colorIndexRef.current = index;
          const nextColor = SCAN_COLORS[index % SCAN_COLORS.length];
          
          // Animate color transition
          gsap.to(colorRef.current, {
              r: new THREE.Color(nextColor).r,
              g: new THREE.Color(nextColor).g,
              b: new THREE.Color(nextColor).b,
              duration: 1, // Smooth transition
              onUpdate: () => {
                  if(shaderRef.current) {
                      shaderRef.current.uniforms.uColorScan.value.copy(colorRef.current);
                  }
              }
          });
      }
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -1, 0]}>
      <primitive object={geometry} />
      <shaderMaterial
        ref={shaderRef}
        args={[TerrainShaderMaterial]}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function CameraController() {
    const { camera, pointer } = useThree();
    
    useFrame(() => {
        // Smooth camera movement based on mouse pointer
        // pointer.x/y are normalized coordinates [-1, 1]
        
        const targetX = pointer.x * 1;
        const targetY = pointer.y * 0.5 + 1; // Base height 1
        
        // Use GSAP for smooth interpolation (or simple lerp)
        // Since useFrame runs every frame, simple lerp is efficient
        // But let's use GSAP as requested for something one-off or just use MathUtils.lerp
        
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
        
        camera.lookAt(0, 0, 0);
    });
    
    // Example GSAP usage: Animate camera on mount
    useEffect(() => {
        gsap.from(camera.position, {
            z: 10,
            duration: 2,
            ease: "power3.out"
        });
    }, [camera]);

    return null;
}

export function ThreeMapBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[var(--end-bg)]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
        
        {/* Environment */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Stars Background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Terrain */}
        <Terrain />
        
        {/* Interaction */}
        <CameraController />
        
        {/* Fog to blend edges */}
        <fog attach="fog" args={['#050505', 2, 12]} />
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
