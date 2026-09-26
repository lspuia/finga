import Link from "next/link";
import type { CalculatorDef } from "@/lib/calc/types";
import { CalcIcon } from "./CalcIcon";

export function CalcCard({ calc, big = false }: { calc: CalculatorDef; big?: boolean }) {
  return (
    <Link
      href={`/calculators/${calc.slug}`}
      className={`group card-white flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${big ? "min-h-[200px] p-7" : "p-5"}`}
    >
      <div>
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-bg-2 text-fg"><CalcIcon slug={calc.slug} /></div>
        <h3 className={`font-semibold tracking-tight ${big ? "text-[22px]" : "text-[17px]"}`}>{calc.name}</h3>
        <p className={`mt-1 leading-snug text-fg-2 ${big ? "text-[15px]" : "text-[13px]"}`}>{calc.tagline}</p>
      </div>
      <span className="link-arrow mt-4 text-[13px] text-accent group-hover:underline">Open</span>
    </Link>
  );
}
