"use client";
import { Suspense } from "react";
import { getCalculator } from "@/lib/calc/defs";
import { CalculatorShell } from "./CalculatorShell";

export function CalculatorClient({ slug }: { slug: string }) {
  const def = getCalculator(slug);
  if (!def) return null;
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1024px] px-5 py-32 text-fg-3">Loading…</div>}>
      <CalculatorShell key={slug} def={def} />
    </Suspense>
  );
}
