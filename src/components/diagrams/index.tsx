"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { BeamDiagram, FootingDiagram, RetainingDiagram, RoofDiagram, SectionDiagram, SlopeDiagram, StairsDiagram, type DiagramProps } from "./svg";

const Skeleton = () => <div className="h-[260px] w-full animate-pulse rounded-2xl bg-bg-2" />;
const ConcreteViewer = dynamic(() => import("../three/ConcreteViewer"), { ssr: false, loading: Skeleton });
const EarthworkViewer = dynamic(() => import("../three/EarthworkViewer"), { ssr: false, loading: Skeleton });

export const DIAGRAMS: Record<string, ComponentType<DiagramProps>> = {
  beam: BeamDiagram,
  section: SectionDiagram,
  footing: FootingDiagram,
  retaining: RetainingDiagram,
  roof: RoofDiagram,
  stairs: StairsDiagram,
  slope: SlopeDiagram,
  concrete: ConcreteViewer,
  earthwork: EarthworkViewer,
};
