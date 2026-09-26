"use client";
import { useUnits } from "./UnitProvider";

export function UnitToggle({ size = "sm" }: { size?: "sm" | "md" }) {
  const { system, setSystem } = useUnits();
  const pad = size === "sm" ? "px-3 py-1 text-[12px]" : "px-4 py-1.5 text-[14px]";
  return (
    <div className="inline-flex rounded-full bg-bg-3 p-[3px]" role="radiogroup" aria-label="Unit system">
      {(["metric", "imperial"] as const).map((s) => (
        <button
          key={s}
          role="radio"
          aria-checked={system === s}
          onClick={() => setSystem(s)}
          className={`${pad} rounded-full font-medium capitalize transition-all ${system === s ? "bg-bg text-fg shadow-sm" : "text-fg-2 hover:text-fg"}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
