export function fmt(n: number, precision = 2): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  let p = precision;
  if (abs >= 10000) p = Math.min(p, 0);
  else if (abs >= 1000) p = Math.min(p, 1);
  else if (abs < 0.01 && abs > 0) p = Math.max(p, 4);
  return n.toLocaleString("en-US", { maximumFractionDigits: p, minimumFractionDigits: 0 });
}

export function fmtCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
