import Link from "next/link";
import dynamic from "next/dynamic";
import { CALCULATORS, CATEGORIES, byCategory } from "@/lib/calc/defs";
import { CalcCard } from "@/components/CalcCard";

const Hero = dynamic(() => import("@/components/HeroClient"), { ssr: true });

const featured = ["beam", "concrete", "rebar", "footing", "roofing", "earthwork"];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative h-[calc(100svh-48px)] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0"><Hero /></div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-bg via-bg/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />
        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1024px] flex-col items-center justify-start px-5 pt-[8vh] text-center">
          <p className="rise text-[14px] font-medium text-fg-2">Space Between Worlds</p>
          <h1 className="display rise rise-1 mt-3 max-w-[820px] text-[48px] sm:text-[72px] lg:text-[84px]">
            Every number a builder needs.
          </h1>
          <p className="rise rise-2 mt-5 max-w-[560px] text-[19px] leading-snug text-fg-2 sm:text-[23px]">
            {CALCULATORS.length} engineering calculators. Metric or imperial. Instant, exact, and beautiful.
          </p>
          <div className="rise rise-3 pointer-events-auto mt-7 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/calculators" className="btn btn-primary">Open the calculators</Link>
            <Link href="/calculators/beam" className="btn btn-ghost link-arrow">Try the beam analyser</Link>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-[1024px] px-5 pt-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: "Live results", d: "Every field recalculates as you type. No submit button, no waiting." },
            { t: "Metric ↔ Imperial", d: "Flip units anywhere and every input and output converts with you." },
            { t: "Built for site", d: "Waste, bags, trucks and pallets. Numbers you can actually order." },
          ].map((p) => (
            <div key={p.t} className="card p-7">
              <h3 className="text-[19px] font-semibold tracking-tight">{p.t}</h3>
              <p className="mt-2 text-[15px] leading-snug text-fg-2">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-[1024px] px-5 pt-24">
        <h2 className="display text-[36px] sm:text-[48px]">Start with the essentials.</h2>
        <p className="mt-2 text-[19px] text-fg-2">The six calculators engineers open first.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((slug) => { const c = CALCULATORS.find((x) => x.slug === slug)!; return <CalcCard key={slug} calc={c} big />; })}
        </div>
      </section>

      {/* CATEGORIES */}
      {CATEGORIES.map((cat, i) => (
        <section key={cat.name} className={`mt-24 ${i % 2 === 0 ? "bg-bg-2" : ""} py-20`}>
          <div className="mx-auto max-w-[1024px] px-5">
            <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
              <div>
                <h2 className="display text-[32px] sm:text-[40px]">{cat.name}</h2>
                <p className="mt-3 text-[17px] leading-snug text-fg-2">{cat.blurb}</p>
                <Link href={`/calculators#${slugify(cat.name)}`} className="link-arrow mt-4 inline-block text-[15px] text-accent hover:underline">See all {cat.name.toLowerCase()}</Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {byCategory(cat.name).map((c) => <CalcCard key={c.slug} calc={c} />)}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="mx-auto max-w-[1024px] px-5 pt-24 text-center">
        <h2 className="display text-[36px] sm:text-[56px]">Measure twice. Calculate once.</h2>
        <p className="mx-auto mt-3 max-w-[520px] text-[19px] text-fg-2">Save results, share a link with the site team, or print a clean summary for the file.</p>
        <Link href="/calculators" className="btn btn-primary mt-7">Browse all {CALCULATORS.length} calculators</Link>
      </section>
    </>
  );
}

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
