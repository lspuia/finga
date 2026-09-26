"use client";
import type { CalcResult, Values } from "@/lib/calc/types";

export type DiagramProps = { values: Values; result: CalcResult };

const stroke = "#1d1d1f";
const soft = "#86868b";
const fill = "#f5f5f7";
const accent = "#0071e3";

function Svg({ children, h = 260 }: { children: React.ReactNode; h?: number }) {
  return (
    <svg viewBox={`0 0 600 ${h}`} className="h-auto w-full" role="img" aria-label="Diagram" style={{ fontFamily: "inherit" }}>
      {children}
    </svg>
  );
}

const Label = ({ x, y, children, anchor = "middle", color = soft }: { x: number; y: number; children: React.ReactNode; anchor?: "start" | "middle" | "end"; color?: string }) => (
  <text x={x} y={y} fontSize="12" fill={color} textAnchor={anchor} style={{ fontVariantNumeric: "tabular-nums" }}>{children}</text>
);

const Pin = ({ x, y }: { x: number; y: number }) => <polygon points={`${x},${y + 4} ${x - 12},${y + 24} ${x + 12},${y + 24}`} fill={fill} stroke={stroke} strokeWidth="1.5" />;
const Roller = ({ x, y }: { x: number; y: number }) => (<g><polygon points={`${x},${y + 4} ${x - 12},${y + 20} ${x + 12},${y + 20}`} fill={fill} stroke={stroke} strokeWidth="1.5" /><circle cx={x - 6} cy={y + 25} r="3.5" fill="#fff" stroke={stroke} strokeWidth="1.5" /><circle cx={x + 6} cy={y + 25} r="3.5" fill="#fff" stroke={stroke} strokeWidth="1.5" /></g>);
const Fixed = ({ x, y, side }: { x: number; y: number; side: "l" | "r" }) => (
  <g>
    <line x1={x} y1={y - 30} x2={x} y2={y + 30} stroke={stroke} strokeWidth="2" />
    {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={x} y1={y - 28 + i * 11} x2={x + (side === "l" ? -10 : 10)} y2={y - 18 + i * 11} stroke={soft} strokeWidth="1" />)}
  </g>
);

/* ---------- BEAM ---------- */
export function BeamDiagram({ values }: DiagramProps) {
  const support = String(values.support), load = String(values.loadType);
  const L = +values.L || 1, a = Math.min(Math.max(+values.a, 0), L);
  const x0 = 80, x1 = 520, y = 110;
  const px = (m: number) => x0 + ((x1 - x0) * m) / L;

  // moment diagram (shape only)
  const my = 200, mh = 55;
  let momentPath = "";
  const n = 40;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n; const x = t * L; let m = 0;
    if (support === "simple") m = load === "udl" ? (x * (L - x)) / (L * L / 4) : x <= a ? (x * (L - a)) / (a * (L - a) || 1) : ((L - x) * a) / (a * (L - a) || 1);
    else if (support === "cantilever") m = load === "udl" ? -((L - x) * (L - x)) / (L * L) : x <= a ? -(a - x) / (a || 1) : 0;
    else m = load === "udl" ? (6 * x * (L - x) / (L * L) - 1) : x <= a ? (-(1) + 2 * (x / (a || 1))) * 0.6 : (-(1) + 2 * ((L - x) / ((L - a) || 1))) * 0.6;
    pts.push(`${px(x).toFixed(1)},${(my - m * mh).toFixed(1)}`);
  }
  momentPath = `M${px(0)},${my} L${pts.join(" L")} L${px(L)},${my} Z`;

  return (
    <Svg h={250}>
      {/* beam */}
      <rect x={x0} y={y - 6} width={x1 - x0} height={12} fill={fill} stroke={stroke} strokeWidth="1.5" />
      {support === "simple" && <><Pin x={x0} y={y} /><Roller x={x1} y={y} /></>}
      {support === "cantilever" && <Fixed x={x0} y={y} side="l" />}
      {support === "fixed" && <><Fixed x={x0} y={y} side="l" /><Fixed x={x1} y={y} side="r" /></>}
      {/* loads */}
      {load === "udl" ? (
        <g>
          <rect x={x0} y={y - 46} width={x1 - x0} height={40} fill={accent} opacity="0.08" />
          <line x1={x0} y1={y - 46} x2={x1} y2={y - 46} stroke={accent} strokeWidth="1.5" />
          {Array.from({ length: 12 }).map((_, i) => { const x = x0 + ((x1 - x0) * i) / 11; return <g key={i}><line x1={x} y1={y - 44} x2={x} y2={y - 12} stroke={accent} strokeWidth="1.5" /><polygon points={`${x},${y - 8} ${x - 4},${y - 15} ${x + 4},${y - 15}`} fill={accent} /></g>; })}
          <Label x={(x0 + x1) / 2} y={y - 54} color={accent}>w</Label>
        </g>
      ) : (
        <g>
          <line x1={px(a)} y1={y - 60} x2={px(a)} y2={y - 12} stroke={accent} strokeWidth="2" />
          <polygon points={`${px(a)},${y - 8} ${px(a) - 5},${y - 17} ${px(a) + 5},${y - 17}`} fill={accent} />
          <Label x={px(a)} y={y - 66} color={accent}>P</Label>
          <Label x={(x0 + px(a)) / 2} y={y + 48}>a = {a.toFixed(2)} m</Label>
        </g>
      )}
      {/* span dimension */}
      <line x1={x0} y1={y + 40} x2={x1} y2={y + 40} stroke={soft} strokeWidth="1" />
      <line x1={x0} y1={y + 35} x2={x0} y2={y + 45} stroke={soft} strokeWidth="1" />
      <line x1={x1} y1={y + 35} x2={x1} y2={y + 45} stroke={soft} strokeWidth="1" />
      <Label x={(x0 + x1) / 2} y={y + 60}>L = {L.toFixed(2)} m</Label>
      {/* moment */}
      <path d={momentPath} fill={accent} opacity="0.12" stroke={accent} strokeWidth="1.2" />
      <line x1={x0} y1={my} x2={x1} y2={my} stroke={soft} strokeWidth="1" />
      <Label x={x0 - 8} y={my + 4} anchor="end">M</Label>
    </Svg>
  );
}

/* ---------- SECTION ---------- */
export function SectionDiagram({ values }: DiagramProps) {
  const shape = String(values.shape);
  const b = +values.b, h = +values.h, t = +values.t, tf = +values.tf, tw = +values.tw, d = +values.d;
  const maxDim = Math.max(shape === "circle" || shape === "pipe" ? d : Math.max(b, h), 1);
  const s = 180 / maxDim; const cx = 300, cy = 130;
  const common = { fill, stroke, strokeWidth: 1.5 };
  return (
    <Svg h={260}>
      {shape === "rect" && <rect x={cx - (b * s) / 2} y={cy - (h * s) / 2} width={b * s} height={h * s} {...common} />}
      {shape === "hrect" && (
        <path fillRule="evenodd" d={`M${cx - (b * s) / 2},${cy - (h * s) / 2} h${b * s} v${h * s} h${-b * s} Z M${cx - (b * s) / 2 + t * s},${cy - (h * s) / 2 + t * s} h${(b - 2 * t) * s} v${(h - 2 * t) * s} h${-(b - 2 * t) * s} Z`} {...common} />
      )}
      {shape === "circle" && <circle cx={cx} cy={cy} r={(d * s) / 2} {...common} />}
      {shape === "pipe" && <path fillRule="evenodd" d={`M${cx - (d * s) / 2},${cy} a${(d * s) / 2},${(d * s) / 2} 0 1,0 ${d * s},0 a${(d * s) / 2},${(d * s) / 2} 0 1,0 ${-d * s},0 Z M${cx - ((d - 2 * t) * s) / 2},${cy} a${((d - 2 * t) * s) / 2},${((d - 2 * t) * s) / 2} 0 1,0 ${(d - 2 * t) * s},0 a${((d - 2 * t) * s) / 2},${((d - 2 * t) * s) / 2} 0 1,0 ${-(d - 2 * t) * s},0 Z`} {...common} />}
      {shape === "i" && (
        <path d={`M${cx - (b * s) / 2},${cy - (h * s) / 2} h${b * s} v${tf * s} h${-((b - tw) * s) / 2} v${(h - 2 * tf) * s} h${((b - tw) * s) / 2} v${tf * s} h${-b * s} v${-tf * s} h${((b - tw) * s) / 2} v${-(h - 2 * tf) * s} h${-((b - tw) * s) / 2} Z`} {...common} />
      )}
      {/* axes */}
      <line x1={cx - 120} y1={cy} x2={cx + 120} y2={cy} stroke={accent} strokeWidth="1" strokeDasharray="4 4" />
      <line x1={cx} y1={cy - 115} x2={cx} y2={cy + 115} stroke={accent} strokeWidth="1" strokeDasharray="4 4" />
      <Label x={cx + 128} y={cy + 4} anchor="start" color={accent}>x</Label>
      <Label x={cx + 4} y={cy - 120} anchor="start" color={accent}>y</Label>
      <Label x={cx} y={cy + 135}>{shape === "circle" || shape === "pipe" ? `Ø ${d} mm` : `${b} × ${h} mm`}</Label>
    </Svg>
  );
}

/* ---------- FOOTING ---------- */
export function FootingDiagram({ result }: DiagramProps) {
  const B = Number(result.outputs.find((o) => o.key === "B")?.value ?? 1);
  const q = result.outputs.find((o) => o.key === "qact")?.value;
  const w = Math.min(360, Math.max(120, B * 90));
  const cx = 300, groundY = 70, top = 150, bot = 200;
  return (
    <Svg h={260}>
      <rect x="0" y={groundY} width="600" height="190" fill="#f5f5f7" />
      <line x1="0" y1={groundY} x2="600" y2={groundY} stroke={soft} strokeWidth="1" />
      {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={i * 20} y1={groundY} x2={i * 20 + 8} y2={groundY + 8} stroke={soft} strokeWidth="0.8" />)}
      <rect x={cx - 20} y={20} width={40} height={top - 20} fill="#fff" stroke={stroke} strokeWidth="1.5" />
      <rect x={cx - w / 2} y={top} width={w} height={bot - top} fill="#fff" stroke={stroke} strokeWidth="1.5" />
      <line x1={cx} y1={0} x2={cx} y2={16} stroke={accent} strokeWidth="2" />
      <polygon points={`${cx},20 ${cx - 5},11 ${cx + 5},11`} fill={accent} />
      <Label x={cx + 10} y={12} anchor="start" color={accent}>P</Label>
      {Array.from({ length: Math.floor(w / 18) }).map((_, i) => { const x = cx - w / 2 + 9 + i * 18; return <g key={i}><line x1={x} y1={bot + 26} x2={x} y2={bot + 6} stroke={accent} strokeWidth="1.2" /><polygon points={`${x},${bot + 3} ${x - 3},${bot + 9} ${x + 3},${bot + 9}`} fill={accent} /></g>; })}
      <line x1={cx - w / 2} y1={bot + 40} x2={cx + w / 2} y2={bot + 40} stroke={soft} />
      <Label x={cx} y={bot + 56}>B = {B.toFixed(2)} m{typeof q === "number" ? `   ·   q = ${q.toFixed(0)} kPa` : ""}</Label>
    </Svg>
  );
}

/* ---------- RETAINING ---------- */
export function RetainingDiagram({ values }: DiagramProps) {
  const H = +values.H, tb = +values.tBase / 1000, ts = +values.tStem / 1000, B = +values.Bbase, heel = +values.heel;
  const s = 150 / Math.max(H + tb, B, 1);
  const ox = 180, baseY = 220;
  const toe = B - heel - ts;
  const stemX = ox + toe * s;
  return (
    <Svg h={260}>
      {/* retained soil */}
      <rect x={stemX + ts * s} y={baseY - (H + tb) * s} width={600 - stemX - ts * s} height={H * s} fill="#f5f5f7" />
      <line x1={stemX + ts * s} y1={baseY - (H + tb) * s} x2="600" y2={baseY - (H + tb) * s} stroke={soft} />
      {/* wall */}
      <path d={`M${ox},${baseY} h${B * s} v${-tb * s} h${-heel * s} v${-H * s} h${-ts * s} v${H * s} h${-toe * s} Z`} fill="#fff" stroke={stroke} strokeWidth="1.5" />
      {/* pressure triangle */}
      <polygon points={`${stemX + ts * s + 4},${baseY - (H + tb) * s} ${stemX + ts * s + 4 + (H + tb) * s * 0.35},${baseY} ${stemX + ts * s + 4},${baseY}`} fill={accent} opacity="0.15" stroke={accent} strokeWidth="1" />
      {Array.from({ length: 5 }).map((_, i) => { const y = baseY - (H + tb) * s + ((H + tb) * s * (i + 1)) / 5.5; const len = ((H + tb) * s * 0.35 * (i + 1)) / 5.5; return <g key={i}><line x1={stemX + ts * s + 4 + len} y1={y} x2={stemX + ts * s + 10} y2={y} stroke={accent} strokeWidth="1.2" /><polygon points={`${stemX + ts * s + 5},${y} ${stemX + ts * s + 12},${y - 3} ${stemX + ts * s + 12},${y + 3}`} fill={accent} /></g>; })}
      <line x1="0" y1={baseY} x2="600" y2={baseY} stroke={soft} />
      <Label x={ox + (B * s) / 2} y={baseY + 18}>B = {B.toFixed(2)} m</Label>
      <Label x={stemX - 10} y={baseY - (H + tb) * s / 2} anchor="end">H = {H.toFixed(2)} m</Label>
      <Label x={stemX + ts * s + 60} y={baseY - (H + tb) * s - 8} anchor="start" color={accent}>Pa</Label>
    </Svg>
  );
}

/* ---------- ROOF ---------- */
export function RoofDiagram({ values, result }: DiagramProps) {
  const span = +values.span, oh = +values.overhang / 1000;
  const angle = Number(result.outputs.find((o) => o.key === "angle")?.value ?? 0);
  const rise = Number(result.outputs.find((o) => o.key === "rise")?.value ?? 0);
  const rafter = Number(result.outputs.find((o) => o.key === "rafter")?.value ?? 0);
  const s = Math.min(400 / (span + 2 * oh), 150 / Math.max(rise, 0.5));
  const cx = 300, plateY = 200;
  const half = (span / 2) * s, ohs = oh * s, rs = rise * s;
  const ohDrop = Math.tan((angle * Math.PI) / 180) * ohs;
  return (
    <Svg h={260}>
      <rect x={cx - half} y={plateY} width={half * 2} height={40} fill="#f5f5f7" stroke={soft} />
      <path d={`M${cx - half - ohs},${plateY + ohDrop} L${cx},${plateY - rs} L${cx + half + ohs},${plateY + ohDrop}`} fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <line x1={cx - half} y1={plateY} x2={cx + half} y2={plateY} stroke={soft} strokeDasharray="4 4" />
      <line x1={cx} y1={plateY} x2={cx} y2={plateY - rs} stroke={accent} strokeDasharray="4 4" />
      <Label x={cx + 8} y={plateY - rs / 2} anchor="start" color={accent}>rise {rise.toFixed(2)} m</Label>
      <Label x={cx} y={plateY + 60}>span {span.toFixed(2)} m</Label>
      <Label x={cx - half / 2 - 30} y={plateY - rs / 2 - 14} anchor="end">rafter {rafter.toFixed(2)} m</Label>
      <path d={`M${cx - half + 40},${plateY} A40,40 0 0,0 ${cx - half + 40 * Math.cos((angle * Math.PI) / 180)},${plateY - 40 * Math.sin((angle * Math.PI) / 180)}`} fill="none" stroke={accent} strokeWidth="1" />
      <Label x={cx - half + 52} y={plateY - 10} anchor="start" color={accent}>{angle.toFixed(1)}°</Label>
    </Svg>
  );
}

/* ---------- STAIRS ---------- */
export function StairsDiagram({ result }: DiagramProps) {
  const n = Number(result.outputs.find((o) => o.key === "n")?.value ?? 2);
  const riser = Number(result.outputs.find((o) => o.key === "riser")?.value ?? 175);
  const run = Number(result.outputs.find((o) => o.key === "run")?.value ?? 3);
  const angle = Number(result.outputs.find((o) => o.key === "angle")?.value ?? 30);
  const tread = (run * 1000) / Math.max(n - 1, 1);
  const s = Math.min(400 / (run * 1000 + tread), 180 / (n * riser));
  const ox = 120, oy = 230;
  let d = `M${ox},${oy}`;
  for (let i = 0; i < n; i++) d += ` v${-riser * s} h${tread * s}`;
  d += ` v${riser * s * 0.5} h${-tread * s * 0.3}`;
  d += ` L${ox + (n - 1) * tread * s + tread * s * 0.7},${oy} Z`;
  return (
    <Svg h={260}>
      <path d={d} fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <line x1={ox} y1={oy} x2={ox + (n - 1) * tread * s} y2={oy - n * riser * s + riser * s} stroke={accent} strokeDasharray="4 4" />
      <Label x={ox + ((n - 1) * tread * s) / 2} y={oy + 20}>run {run.toFixed(2)} m · {n - 1} treads</Label>
      <Label x={ox - 8} y={oy - (n * riser * s) / 2} anchor="end">{n} × {riser.toFixed(0)} mm</Label>
      <Label x={ox + 60} y={oy - 12} anchor="start" color={accent}>{angle.toFixed(1)}°</Label>
    </Svg>
  );
}

/* ---------- SLOPE ---------- */
export function SlopeDiagram({ result }: DiagramProps) {
  const grade = Number(result.outputs.find((o) => o.key === "grade")?.value ?? 0);
  const angle = Number(result.outputs.find((o) => o.key === "angle")?.value ?? 0);
  const run = Number(result.outputs.find((o) => o.key === "run")?.value ?? 1);
  const rise = Number(result.outputs.find((o) => o.key === "rise")?.value ?? 0) / 1000;
  const ratio = String(result.outputs.find((o) => o.key === "ratio")?.value ?? "");
  const w = 440; const h = Math.min(160, Math.max(6, Math.abs(rise / run) * w));
  const ox = 80, oy = 200;
  const up = rise >= 0;
  return (
    <Svg h={260}>
      <polygon points={`${ox},${oy} ${ox + w},${oy} ${ox + w},${up ? oy - h : oy + h}`} fill={accent} opacity="0.08" />
      <line x1={ox} y1={oy} x2={ox + w} y2={oy} stroke={soft} />
      <line x1={ox + w} y1={oy} x2={ox + w} y2={up ? oy - h : oy + h} stroke={soft} />
      <line x1={ox} y1={oy} x2={ox + w} y2={up ? oy - h : oy + h} stroke={stroke} strokeWidth="2.5" />
      <Label x={ox + w / 2} y={oy + (up ? 20 : h + 20)}>run {run.toFixed(2)} m</Label>
      <Label x={ox + w + 8} y={(up ? oy - h / 2 : oy + h / 2) + 4} anchor="start">rise {(rise * 1000).toFixed(0)} mm</Label>
      <Label x={ox + 40} y={up ? oy - 12 : oy + 20} anchor="start" color={accent}>{grade.toFixed(2)}% · {angle.toFixed(2)}° · {ratio}</Label>
    </Svg>
  );
}
