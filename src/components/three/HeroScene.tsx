"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const INK = "#1d1d1f";
const PAPER = "#ffffff";
const BLUE = "#0071e3";

function Member({ position, size, color = PAPER, edge = INK, opacity = 1 }: { position: [number, number, number]; size: [number, number, number]; color?: string; edge?: string; opacity?: number }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.9} metalness={0} />
      <Edges color={edge} threshold={15} />
    </mesh>
  );
}

const bays = 3, storeys = 3, bay = 1.6, storey = 1.1;
const w = bays * bay;

function Frame() {
  const group = useRef<THREE.Group>(null);
  const members = useMemo(() => {
    const cols: [number, number, number][] = [];
    const beamsX: [number, number, number][] = [];
    const beamsZ: [number, number, number][] = [];
    for (let i = 0; i <= bays; i++) for (let k = 0; k <= bays; k++) cols.push([i * bay - w / 2, (storeys * storey) / 2, k * bay - w / 2]);
    for (let s = 1; s <= storeys; s++) {
      for (let k = 0; k <= bays; k++) beamsX.push([0, s * storey, k * bay - w / 2]);
      for (let i = 0; i <= bays; i++) beamsZ.push([i * bay - w / 2, s * storey, 0]);
    }
    return { cols, beamsX, beamsZ };
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const px = state.pointer.x, py = state.pointer.y;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, t * 0.12 + px * 0.35, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -py * 0.18, 0.05);
  });

  return (
    <group ref={group} position={[0, -3.1, 0]} scale={0.95}>
      {members.cols.map((p, i) => <Member key={`c${i}`} position={p} size={[0.09, storeys * storey, 0.09]} />)}
      {members.beamsX.map((p, i) => <Member key={`bx${i}`} position={p} size={[w, 0.12, 0.08]} />)}
      {members.beamsZ.map((p, i) => <Member key={`bz${i}`} position={p} size={[0.08, 0.12, w]} />)}
      {Array.from({ length: storeys }).map((_, s) => (
        <Member key={`slab${s}`} position={[0, (s + 1) * storey + 0.07, 0]} size={[w, 0.02, w]} color={BLUE} edge={BLUE} opacity={0.06} />
      ))}
      {/* a highlighted beam: the "space between" */}
      <Member position={[bay / 2 - w / 2 + bay, 2 * storey, bay - w / 2]} size={[bay, 0.13, 0.09]} color={BLUE} edge={BLUE} />
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[w + 2.4, w + 2.4]} />
        <meshStandardMaterial color="#f5f5f7" />
      </mesh>
      <gridHelper args={[w + 2.4, 12, "#d2d2d7", "#e8e8ed"]} position={[0, 0, 0]} />
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const n = 240; const arr = new Float32Array(n * 3);
    let seed = 1337;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < n; i++) { arr[i * 3] = (rnd() - 0.5) * 16; arr[i * 3 + 1] = rnd() * 7 - 2; arr[i * 3 + 2] = (rnd() - 0.5) * 10 - 2; }
    return arr;
  }, []);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.02; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#86868b" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [6.5, 2.6, 10.5], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} />
      <directionalLight position={[-6, 3, -4]} intensity={0.4} />
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.35}>
        <Frame />
      </Float>
      <Particles />
      <fog attach="fog" args={["#ffffff", 11, 22]} />
    </Canvas>
  );
}
