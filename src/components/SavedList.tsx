"use client";
import Link from "next/link";
import { clearSaved, deleteSaved, useSaved } from "@/lib/storage";
import { fmt } from "@/lib/calc/format";
import { toDisplay, unitLabel } from "@/lib/calc/units";
import { CalcIcon } from "./CalcIcon";

function encode(v: unknown) { try { return btoa(unescape(encodeURIComponent(JSON.stringify(v)))); } catch { return ""; } }

export function SavedList() {
  const items = useSaved();

  return (
    <div className="mx-auto max-w-[1024px] px-5">
      <div className="flex flex-col gap-4 pt-10 pb-8 sm:flex-row sm:items-end sm:justify-between sm:pt-16 sm:pb-10">
        <div>
          <h1 className="display text-[40px] sm:text-[56px]">Saved</h1>
          <p className="mt-3 text-[19px] text-fg-2">Results you kept. Stored on this device for now; a shared project database is next.</p>
        </div>
        {!!items?.length && <button className="btn btn-secondary" onClick={() => clearSaved()}>Clear all</button>}
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[19px] font-semibold tracking-tight">Nothing saved yet.</p>
          <p className="mt-2 text-fg-2">Open any calculator and press “Save result”.</p>
          <Link href="/calculators" className="btn btn-primary mt-6">Browse calculators</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => {
            const primary = it.outputs.filter((o) => o.primary).slice(0, 3);
            return (
              <li key={it.id} className="card-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-2"><CalcIcon slug={it.slug} /></div>
                    <div>
                      <div className="text-[12px] text-fg-3">{new Date(it.savedAt).toLocaleString()} · {it.system}</div>
                      <h2 className="text-[19px] font-semibold tracking-tight">{it.name}</h2>
                      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                        {primary.map((o) => (
                          <div key={o.key}>
                            <div className="text-[12px] text-fg-3">{o.label}</div>
                            <div className="tabular text-[17px] font-medium">{typeof o.value === "number" ? fmt(toDisplay(o.value, o.dim, it.system), o.precision) : o.value} <span className="text-[12px] text-fg-3">{unitLabel(o.dim, it.system)}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/calculators/${it.slug}?s=${encode(it.values)}`} className="btn btn-secondary">Open</Link>
                    <button className="btn btn-ghost" onClick={() => deleteSaved(it.id)}>Delete</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
