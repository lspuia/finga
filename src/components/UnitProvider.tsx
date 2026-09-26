"use client";
import { createContext, useContext } from "react";
import type { UnitSystem } from "@/lib/calc/types";
import { setUnitSystem, useUnitSystem } from "@/lib/storage";

type Ctx = { system: UnitSystem; setSystem: (s: UnitSystem) => void };
const UnitCtx = createContext<Ctx>({ system: "metric", setSystem: () => {} });

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const system = useUnitSystem();
  return <UnitCtx.Provider value={{ system, setSystem: setUnitSystem }}>{children}</UnitCtx.Provider>;
}

export const useUnits = () => useContext(UnitCtx);
