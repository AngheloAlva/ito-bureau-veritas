'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';

type Tip = { x: number; y: number; content: ReactNode } | null;

/** Lightweight hover/focus tooltip positioned inside a relative container. */
export function useChartTooltip() {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  const place = useCallback((el: Element | null, pt: { x: number; y: number } | null, content: ReactNode) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    if (pt) return setTip({ x: pt.x - box.left, y: pt.y - box.top, content });
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTip({ x: r.left + r.width / 2 - box.left, y: r.top - box.top, content });
  }, []);
  const bind = (content: ReactNode) => ({
    onMouseMove: (e: React.MouseEvent) => place(null, { x: e.clientX, y: e.clientY - 12 }, content),
    onMouseLeave: () => setTip(null),
    onFocus: (e: React.FocusEvent) => place(e.currentTarget, null, content),
    onBlur: () => setTip(null),
  });
  const node = tip && (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 w-max max-w-56 -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg"
      style={{ left: tip.x, top: tip.y }}
    >{tip.content}</div>
  );
  return { ref, bind, node, hide: () => setTip(null) };
}

export function TipBody({ label, value, pct, extra }: { label: string; value: string; pct?: number; extra?: string }) {
  return (
    <div className="space-y-0.5 tabular-nums">
      <div className="font-semibold">{label}</div>
      <div>{value}{pct !== undefined && <span className="opacity-70"> · {pct}% de la vista</span>}</div>
      {extra && <div className="opacity-70">{extra}</div>}
    </div>
  );
}

export const pctOf = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
