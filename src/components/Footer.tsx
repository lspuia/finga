import Link from "next/link";
import { CATEGORIES, byCategory } from "@/lib/calc/defs";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-line bg-bg-2">
      <div className="mx-auto max-w-[1024px] px-5 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <div key={c.name}>
              <div className="mb-3 text-[12px] font-semibold text-fg">{c.name}</div>
              <ul className="space-y-2">
                {byCategory(c.name).map((calc) => (
                  <li key={calc.slug}>
                    <Link href={`/calculators/${calc.slug}`} className="text-[12px] text-fg-2 hover:text-fg hover:underline">
                      {calc.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-[12px] text-fg-3 sm:flex-row sm:items-center sm:justify-between">
          <p>Space Between Worlds. Engineering calculators for people who build.</p>
          <p>Results are for preliminary design only. Verify against your governing code.</p>
        </div>
      </div>
    </footer>
  );
}
