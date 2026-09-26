"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import type { DiagramProps } from "../diagrams/svg";
import { Viewer, INK, BLUE } from "./Viewer";

export default function EarthworkViewer({ values, result }: DiagramProps) {
  const L = +values.L, W = +values.W, D = +values.D, s = +values.slope;
  const Lt = L + 2 * s * D, Wt = W + 2 * s * D;
  const k = 6 / Math.max(Lt, Wt, D * 2, 1);
  const bank = result.outputs.find((o) => o.key === "bank")?.value;

  const geom = useMemo(() => {
    // frustum: base (L×W) at depth -D, top (Lt×Wt) at 0
    const g = new THREE.BufferGeometry();
    const b = [L * k / 2, W * k / 2], t = [Lt * k / 2, Wt * k / 2], d = -D * k;
    const v = [
      // top
      -t[0], 0, -t[1],  t[0], 0, -t[1],  t[0], 0, t[1],  -t[0], 0, t[1],
      // bottom
      -b[0], d, -b[1],  b[0], d, -b[1],  b[0], d, b[1],  -b[0], d, b[1],
    ];
    const idx = [
      4, 5, 6, 4, 6, 7, // bottom face
      0, 4, 7, 0, 7, 3, // -x side
      1, 2, 6, 1, 6, 5, // +x side
      0, 1, 5, 0, 5, 4, // -z side
      3, 7, 6, 3, 6, 2, // +z side
    ];
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [L, W, D, k, Lt, Wt]);

  return (
    <Viewer distance={7} caption={typeof bank === "number" ? `${bank.toFixed(1)} m³ bank · drawn to scale` : undefined}>
      {/* ground slab with a hole approximated by a thin frame */}
      <mesh geometry={geom}>
        <meshStandardMaterial color="#e8e8ed" roughness={1} side={THREE.DoubleSide} />
        <Edges color={INK} threshold={10} />
      </mesh>
      <mesh position={[0, -D * k, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[L * k, W * k]} />
        <meshStandardMaterial color={BLUE} transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 1, 4]} />
        <meshStandardMaterial visible={false} />
      </mesh>
    </Viewer>
  );
}
