"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges, Grid } from "@react-three/drei";
import type { ReactNode } from "react";

export const INK = "#1d1d1f";
export const BLUE = "#0071e3";

export function Viewer({ children, distance = 8, caption }: { children: ReactNode; distance?: number; caption?: string }) {
  return (
    <div className="relative h-[260px] w-full sm:h-[300px]">
      <Canvas dpr={[1, 2]} camera={{ position: [distance, distance * 0.7, distance], fov: 30 }} gl={{ antialias: true, alpha: true }} style={{ width: "100%", height: "100%" }}>
        <ambientLight intensity={1.3} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        {children}
        <Grid infiniteGrid fadeDistance={distance * 4} fadeStrength={2} cellSize={1} sectionSize={5} cellColor="#e8e8ed" sectionColor="#d2d2d7" position={[0, -0.002, 0]} />
        <OrbitControls enablePan={false} minDistance={distance * 0.4} maxDistance={distance * 3} autoRotate autoRotateSpeed={0.6} makeDefault />
      </Canvas>
      {caption && <div className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-fg-3">{caption}</div>}
      <div className="pointer-events-none absolute right-3 top-2 text-[11px] text-fg-3">drag to orbit · live 3D</div>
    </div>
  );
}

export function Solid({ children, color = "#ffffff", edge = INK, position, rotation, opacity = 1 }: { children: ReactNode; color?: string; edge?: string; position?: [number, number, number]; rotation?: [number, number, number]; opacity?: number }) {
  return (
    <mesh position={position} rotation={rotation}>
      {children}
      <meshStandardMaterial color={color} roughness={0.85} transparent={opacity < 1} opacity={opacity} />
      <Edges color={edge} threshold={20} />
    </mesh>
  );
}
