const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function CalcIcon({ slug }: { slug: string }) {
  const s = 20;
  switch (slug) {
    case "beam": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M3 10h18M6 10l-2 5h4zM18 10l-2 5h4z" /><path d="M8 5v4M12 5v4M16 5v4" /></svg>;
    case "column": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><rect x="9" y="4" width="6" height="16" rx="1" /><path d="M6 20h12M6 4h12" /></svg>;
    case "section-properties": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M5 4h14v3H14v10h5v3H5v-3h5V7H5z" /></svg>;
    case "load-takedown": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 16h16M8 4v9M12 4v9M16 4v9M6 11l2 2 2-2M10 11l2 2 2-2M14 11l2 2 2-2" /></svg>;
    case "footing": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M10 4h4v8h-4zM4 12h16v6H4z" /></svg>;
    case "retaining-wall": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M8 4v14H4v2h16v-2H12V4z" /><path d="M12 8h8M12 12h8M12 16h8" opacity=".5" /></svg>;
    case "timber-joist": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 6h16v12H4z" /><path d="M8 6v12M12 6v12M16 6v12" /></svg>;
    case "concrete": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M3 9l9-5 9 5-9 5z" /><path d="M3 9v6l9 5 9-5V9M12 14v6" /></svg>;
    case "rebar": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 8h16M4 12h16M4 16h16M8 4v16M16 4v16" /></svg>;
    case "brick-block": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M3 6h18v12H3zM3 10h18M3 14h18M9 6v4M15 10v4M9 14v4" /></svg>;
    case "plaster": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 18L16 6l2 2L6 20z" /><path d="M14 8l2 2M18 4l2 2" /></svg>;
    case "paint": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 4h12v6H4z" /><path d="M16 7h3v6h-7v4M12 17v3" /></svg>;
    case "tile-flooring": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 4h16v16H4zM12 4v16M4 12h16" /></svg>;
    case "drywall": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><rect x="4" y="3" width="16" height="18" /><path d="M8 7h.01M16 7h.01M8 17h.01M16 17h.01M12 12h.01" strokeWidth="2.4" /></svg>;
    case "roofing": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M3 13l9-8 9 8M6 11v9h12v-9" /></svg>;
    case "stairs": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 20h4v-4h4v-4h4V8h4" /></svg>;
    case "earthwork": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M3 8h4l3 10h4l3-10h4" /><path d="M3 8V6M21 8V6" /></svg>;
    case "paving": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M3 18h18M3 14h18M3 10h18" /><path d="M7 6h10" opacity=".5" /></svg>;
    case "slope-grade": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 18h16V8z" /></svg>;
    case "unit-converter": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 8h13l-3-3M20 16H7l3 3" /></svg>;
    case "cost-estimate": return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="8" /><path d="M12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 2-2.5 1-2.5 2 1 1.5 2.5 1.5 2.5-.5 2.5-1.5" /></svg>;
    default: return <svg width={s} height={s} viewBox="0 0 24 24" {...P}><rect x="4" y="4" width="16" height="16" rx="3" /></svg>;
  }
}
