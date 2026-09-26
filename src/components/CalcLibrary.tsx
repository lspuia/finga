"use client";
import { useMemo, useState } from "react";
import { CALCULATORS, CATEGORIES } from "@/lib/calc/defs";
import { CalcCard } from "./CalcCard";

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export function CalcLibrary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return CALCULATORS.filter((c) => (cat === "All" || c.category === cat) && (!t || `${c.name} ${c.tagline} ${c.description} ${c.category}`.toLowerCase().includes(t)));
  }, [q, cat]);

  return (
    <div className="mx-auto max-w-[1024px] px-5">
      <div className="pt-10 pb-8 sm:pt-16 sm:pb-10">
        <h1 className="display text-[40px] sm:text-[56px]">Calculators</h1>
        <p className="mt-3 text-[19px] text-fg-2">{CALCULATORS.length} tools across {CATEGORIES.length} disciplines.</p>
      </div>

      <div className="no-print sticky top-12 z-40 -mx-5 bg-bg/80 px-5 py-3 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input className="field pl-11" placeholder="Search calculators" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search calculators" />
          </div>
          <div className="flex gap-1 overflow-x-auto rounded-full bg-bg-3 p-[3px]">
            {["All", ...CATEGORIES.map((c) => c.name)].map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ${cat === c ? "bg-bg shadow-sm" : "text-fg-2 hover:text-fg"}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 && <p className="py-20 text-center text-fg-3">No calculators match “{q}”.</p>}

      {(cat === "All" ? CATEGORIES : CATEGORIES.filter((c) => c.name === cat)).map((c) => {
        const items = list.filter((x) => x.category === c.name);
        if (!items.length) return null;
        return (
          <section key={c.name} id={slugify(c.name)} className="scroll-mt-32 pt-12">
            <h2 className="display text-[28px]">{c.name}</h2>
            <p className="mt-1 text-[15px] text-fg-2">{c.blurb}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((x) => <CalcCard key={x.slug} calc={x} />)}</div>
          </section>
        );
      })}
    </div>
  );
}
