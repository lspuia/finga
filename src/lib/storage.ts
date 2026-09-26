"use client";
import { useSyncExternalStore } from "react";
import type { OutputValue, UnitSystem, Values } from "./calc/types";

export type SavedCalc = {
  id: string;
  slug: string;
  name: string;
  title: string;
  values: Values;
  outputs: OutputValue[];
  system: UnitSystem;
  savedAt: string;
};

// NOTE: localStorage stand-in. Swap the read/write functions for API calls when the database lands.

function makeStore<T>(key: string, parse: (raw: string | null) => T, serverValue: T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cached: T = serverValue;
  const read = () => {
    let raw: string | null = null;
    try { raw = localStorage.getItem(key); } catch {}
    if (raw !== cachedRaw) { cachedRaw = raw; cached = parse(raw); }
    return cached;
  };
  const write = (raw: string | null) => {
    try { if (raw === null) localStorage.removeItem(key); else localStorage.setItem(key, raw); } catch {}
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => { if (e.key === key) l(); };
    window.addEventListener("storage", onStorage);
    return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
  };
  const use = () => useSyncExternalStore(subscribe, read, () => serverValue);
  return { read, write, use };
}

const EMPTY: SavedCalc[] = [];
const savedStore = makeStore<SavedCalc[]>("sbw:saved", (raw) => { try { return raw ? (JSON.parse(raw) as SavedCalc[]) : EMPTY; } catch { return EMPTY; } }, EMPTY);

export const useSaved = savedStore.use;
export function listSaved() { return savedStore.read(); }
export function saveCalc(item: Omit<SavedCalc, "id" | "savedAt">): SavedCalc {
  const rec: SavedCalc = { ...item, id: Math.random().toString(36).slice(2, 10), savedAt: new Date().toISOString() };
  savedStore.write(JSON.stringify([rec, ...listSaved()]));
  return rec;
}
export function deleteSaved(id: string) { savedStore.write(JSON.stringify(listSaved().filter((s) => s.id !== id))); }
export function clearSaved() { savedStore.write(null); }

const unitStore = makeStore<UnitSystem>("sbw:units", (raw) => (raw === "imperial" ? "imperial" : "metric"), "metric");
export const useUnitSystem = unitStore.use;
export function setUnitSystem(s: UnitSystem) { unitStore.write(s); }
