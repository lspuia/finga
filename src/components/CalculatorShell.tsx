"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CalculatorDef, InputField, OutputValue, Values } from "@/lib/calc/types";
import { displayStep, fromDisplay, toDisplay, unitLabel } from "@/lib/calc/units";
import { fmt } from "@/lib/calc/format";
import { useUnits } from "./UnitProvider";
import { saveCalc } from "@/lib/storage";
import { DIAGRAMS } from "./diagrams";

function defaults(def: CalculatorDef): Values {
  return Object.fromEntries(def.inputs.map((i) => [i.key, i.default]));
}

function visible(i: InputField, v: Values) {
  return !i.showIf || i.showIf.values.includes(String(v[i.showIf.key]));
}

function encode(v: Values) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(v)))); } catch { return ""; }
}
function decode(s: string): Values | null {
  try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch { return null; }
}

export function CalculatorShell({ def }: { def: CalculatorDef }) {
  const { system } = useUnits();
  const params = useSearchParams();
  const [values, setValues] = useState<Values>(() => {
    const s = params.get("s");
    const shared = s ? decode(s) : null;
    return shared ? { ...defaults(def), ...shared } : defaults(def);
  });
  // Only the field currently being typed into keeps raw text; everything else is derived from SI values.
  const [edit, setEdit] = useState<{ key: string; raw: string; system: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayText = (i: InputField) =>
    edit && edit.key === i.key && edit.system === system ? edit.raw : fmtInput(toDisplay(Number(values[i.key]), i.dim, system));

  const result = useMemo(() => {
    try { return def.compute(values); } catch { return { outputs: [], warnings: ["Could not compute with these inputs."] }; }
  }, [def, values]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const onNumber = (i: InputField, raw: string) => {
    setEdit({ key: i.key, raw, system });
    const n = parseFloat(raw);
    if (!isNaN(n)) setValues((v) => ({ ...v, [i.key]: fromDisplay(n, i.dim, system) }));
  };
  const onBlur = (i: InputField) => {
    const n = parseFloat(edit?.key === i.key ? edit.raw : "");
    setEdit(null);
    if (isNaN(n)) return;
    let si = fromDisplay(n, i.dim, system);
    if (i.min !== undefined && si < i.min) si = i.min;
    if (i.max !== undefined && si > i.max) si = i.max;
    setValues((v) => ({ ...v, [i.key]: si }));
  };

  const reset = () => { setValues(defaults(def)); setEdit(null); notify("Reset to defaults"); };

  const resultsText = () => {
    const lines = [`${def.name} — Space Between Worlds`, ""];
    lines.push("Inputs");
    for (const i of def.inputs) if (visible(i, values)) lines.push(`  ${i.label}: ${i.type === "select" ? i.options?.find((o) => o.value === values[i.key])?.label : `${fmt(toDisplay(Number(values[i.key]), i.dim, system))} ${unitLabel(i.dim, system)}`}`);
    lines.push("", "Results");
    for (const o of result.outputs) lines.push(`  ${o.label}: ${typeof o.value === "number" ? fmt(toDisplay(o.value, o.dim, system), o.precision) : o.value} ${unitLabel(o.dim, system)}${o.note ? ` (${o.note})` : ""}`);
    if (result.warnings?.length) { lines.push("", "Warnings"); for (const w of result.warnings) lines.push(`  • ${w}`); }
    return lines.join("\n");
  };

  const copy = async () => { try { await navigator.clipboard.writeText(resultsText()); notify("Results copied"); } catch { notify("Copy failed"); } };
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?s=${encode(values)}`;
    try { await navigator.clipboard.writeText(url); window.history.replaceState(null, "", url); notify("Link copied"); } catch { notify("Copy failed"); }
  };
  const save = () => {
    const first = result.outputs.find((o) => o.primary) ?? result.outputs[0];
    const title = first ? `${first.label}: ${typeof first.value === "number" ? fmt(toDisplay(first.value, first.dim, system), first.precision) : first.value} ${unitLabel(first.dim, system)}` : def.name;
    saveCalc({ slug: def.slug, name: def.name, title, values, outputs: result.outputs, system });
    notify("Saved");
  };

  const groups = groupBy(def.inputs.filter((i) => visible(i, values)), (i) => i.group ?? "Inputs");
  const primary = result.outputs.filter((o) => o.primary);
  const secondary = groupBy(result.outputs.filter((o) => !o.primary), (o) => o.group ?? "Details");
  const Diagram = def.diagram ? DIAGRAMS[def.diagram] : undefined;

  return (
    <div className="mx-auto max-w-[1024px] px-5">
      <div className="pt-10 pb-8 sm:pt-16 sm:pb-12">
        <Link href="/calculators" className="text-[13px] text-accent hover:underline">‹ All calculators</Link>
        <p className="mt-6 text-[13px] font-medium text-fg-3">{def.category}</p>
        <h1 className="display mt-1 text-[40px] sm:text-[56px]">{def.name}</h1>
        <p className="mt-3 max-w-[640px] text-[19px] leading-snug text-fg-2">{def.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Inputs */}
        <section className="card p-6 sm:p-7" aria-label="Inputs">
          {Object.entries(groups).map(([g, fields]) => (
            <div key={g} className="mb-7 last:mb-0">
              <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-fg-3">{g}</h2>
              <div className="space-y-4">
                {fields.map((i) => (
                  <div key={i.key}>
                    <label htmlFor={`in-${i.key}`} className="mb-1.5 block text-[14px] font-medium">{i.label}</label>
                    {i.type === "select" ? (
                      <select id={`in-${i.key}`} className="field" value={String(values[i.key])} onChange={(e) => setValues((v) => ({ ...v, [i.key]: e.target.value }))}>
                        {i.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          id={`in-${i.key}`}
                          type="number"
                          inputMode="decimal"
                          className="field pr-16"
                          value={displayText(i)}
                          step={displayStep(i.dim, system, i.step)}
                          onChange={(e) => onNumber(i, e.target.value)}
                          onBlur={() => onBlur(i)}
                        />
                        {unitLabel(i.dim, system) && (
                          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[14px] text-fg-3">{unitLabel(i.dim, system)}</span>
                        )}
                      </div>
                    )}
                    {i.help && <p className="mt-1 text-[12px] text-fg-3">{i.help}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="no-print mt-8 flex flex-wrap gap-2 border-t border-line pt-5">
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
            <button className="btn btn-secondary" onClick={copy}>Copy results</button>
            <button className="btn btn-secondary" onClick={share}>Share link</button>
            <button className="btn btn-secondary" onClick={() => window.print()}>Print</button>
          </div>
        </section>

        {/* Outputs */}
        <section className="space-y-6" aria-label="Results" aria-live="polite">
          {Diagram && (
            <div className="card-white overflow-hidden p-4 sm:p-6">
              <Diagram values={values} result={result} />
            </div>
          )}

          {!!result.warnings?.length && (
            <div className="pop rounded-2xl bg-warn-bg px-5 py-4 text-[14px] text-warn">
              <ul className="space-y-1">{result.warnings.map((w, i) => <li key={i}>⚠︎ {w}</li>)}</ul>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {primary.map((o) => <PrimaryCard key={o.key} o={o} system={system} />)}
          </div>

          {Object.entries(secondary).map(([g, outs]) => (
            <div key={g} className="card-white px-6 py-2">
              <h3 className="pt-3 pb-1 text-[12px] font-semibold uppercase tracking-wide text-fg-3">{g}</h3>
              <dl>
                {outs.map((o) => (
                  <div key={o.key} className="flex items-baseline justify-between gap-4 border-t border-line py-3 first:border-0">
                    <dt className="text-[14px] text-fg-2">{o.label}{o.note ? <span className="ml-2 text-[12px] text-fg-3">{o.note}</span> : null}</dt>
                    <dd className="tabular whitespace-nowrap text-[15px] font-medium">
                      {typeof o.value === "number" ? fmt(toDisplay(o.value, o.dim, system), o.precision) : o.value}
                      <span className="ml-1 text-[12px] font-normal text-fg-3">{unitLabel(o.dim, system)}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <div className="no-print flex justify-end">
            <button className="btn btn-primary" onClick={save}>Save result</button>
          </div>
        </section>
      </div>

      {(def.formulas || def.notes) && (
        <section className="mt-16 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
          {def.formulas && (
            <div>
              <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-fg-3">Formulas</h3>
              <ul className="space-y-2 font-mono text-[13px] text-fg-2">{def.formulas.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
          )}
          {def.notes && (
            <div>
              <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-fg-3">Notes</h3>
              <ul className="space-y-2 text-[13px] text-fg-2">{def.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          )}
        </section>
      )}

      <div aria-live="polite" className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-fg px-5 py-2.5 text-[14px] font-medium text-white shadow-lg transition-all ${toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>{toast}</div>
    </div>
  );
}

function PrimaryCard({ o, system }: { o: OutputValue; system: "metric" | "imperial" }) {
  const val = typeof o.value === "number" ? fmt(toDisplay(o.value, o.dim, system), o.precision) : o.value;
  const long = String(val).length > 9;
  return (
    <div className="card p-5">
      <div className="text-[13px] text-fg-2">{o.label}</div>
      <div className={`tabular mt-2 font-semibold tracking-tight ${long ? "text-[24px]" : "text-[32px]"} leading-none`}>
        {val}
        <span className="ml-1.5 text-[15px] font-medium text-fg-3">{unitLabel(o.dim, system)}</span>
      </div>
      {o.note && <div className="mt-2 text-[12px] text-fg-3">{o.note}</div>}
    </div>
  );
}

function fmtInput(n: number): string {
  if (!isFinite(n)) return "";
  const r = Math.abs(n) >= 100 ? +n.toFixed(1) : +n.toFixed(4);
  return String(r);
}

function groupBy<T>(arr: T[], key: (t: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const x of arr) (out[key(x)] ||= []).push(x);
  return out;
}
