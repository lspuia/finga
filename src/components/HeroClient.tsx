"use client";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false, loading: () => <div className="h-full w-full" /> });

export default function HeroClient() {
  return <HeroScene />;
}
