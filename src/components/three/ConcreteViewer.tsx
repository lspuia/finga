"use client";
import type { DiagramProps } from "../diagrams/svg";
import { Solid, Viewer, BLUE } from "./Viewer";

export default function ConcreteViewer({ values, result }: DiagramProps) {
  const shape = String(values.shape);
  const vol = result.outputs.find((o) => o.key === "net")?.value;
  const caption = typeof vol === "number" ? `${vol.toFixed(2)} m³ net · drawn to scale` : undefined;

  if (shape === "slab") {
    const L = +values.L, W = +values.W, T = +values.T / 1000;
    const k = 6 / Math.max(L, W, 1);
    return (
      <Viewer distance={7} caption={caption}>
        <Solid position={[0, (T * k) / 2, 0]} color="#f5f5f7">
          <boxGeometry args={[L * k, Math.max(T * k, 0.05), W * k]} />
        </Solid>
      </Viewer>
    );
  }
  if (shape === "column") {
    const D = +values.D / 1000, H = +values.H;
    const k = 5 / Math.max(H, D, 1);
    return (
      <Viewer distance={7} caption={caption}>
        <Solid position={[0, (H * k) / 2, 0]} color="#f5f5f7">
          <cylinderGeometry args={[(D * k) / 2, (D * k) / 2, H * k, 48]} />
        </Solid>
      </Viewer>
    );
  }
  if (shape === "wall") {
    const L = +values.L, H = +values.H, T = +values.T / 1000;
    const k = 6 / Math.max(L, H, 1);
    return (
      <Viewer distance={7} caption={caption}>
        <Solid position={[0, (H * k) / 2, 0]} color="#f5f5f7">
          <boxGeometry args={[L * k, H * k, Math.max(T * k, 0.05)]} />
        </Solid>
      </Viewer>
    );
  }
  const n = Math.max(1, Math.round(+values.steps)), r = +values.rise / 1000, t = +values.run / 1000, w = +values.sw, waist = +values.waist / 1000;
  const k = 5 / Math.max(n * t, n * r, w, 1);
  const angle = Math.atan2(r, t);
  const incl = Math.sqrt(r * r + t * t) * n;
  return (
    <Viewer distance={7} caption={caption}>
      <group position={[(-n * t * k) / 2, 0, 0]}>
        {Array.from({ length: n }).map((_, i) => (
          <Solid key={i} position={[(i + 0.5) * t * k, (i + 0.5) * r * k, 0]} color="#f5f5f7">
            <boxGeometry args={[t * k, r * k, w * k]} />
          </Solid>
        ))}
        <Solid position={[(n * t * k) / 2 - Math.sin(angle) * (waist * k) / 2, (n * r * k) / 2 - Math.cos(angle) * (waist * k) / 2, 0]} rotation={[0, 0, angle]} color="#e8e8ed" edge={BLUE}>
          <boxGeometry args={[incl * k, waist * k, w * k]} />
        </Solid>
      </group>
    </Viewer>
  );
}
