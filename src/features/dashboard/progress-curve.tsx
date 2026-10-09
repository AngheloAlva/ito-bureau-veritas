'use client';

import { useState } from 'react';
import { REFERENCE_DATE } from '@/domain/types';
import { linePath, niceMax } from '@/lib/chart-geometry';
import { progressCurve, type PortfolioView } from '@/lib/portfolio-analytics';
import { ChartCard } from './card-shell';

const W = 640, H = 270, L = 38, R = 14, T = 16, B = 30;

export function ProgressCurve({ view }: { view: PortfolioView }) {
  const data = progressCurve(view);
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map(d => d.plannedCompleted), 1));
  const x = (i: number) => L + (i / (data.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const planned = linePath(data.map((d, i) => [x(i), y(d.plannedCompleted)]));
  const actual = linePath(data.map((d, i) => (d.actualCompleted === null ? null : [x(i), y(d.actualCompleted)])));
  const refMonth = REFERENCE_DATE.slice(0, 7);
  const ci = data.findIndex(d => d.month === refMonth);
  const cut = data[ci];
  const dev = cut && cut.actualCompleted !== null ? cut.actualCompleted - cut.plannedCompleted : 0;
  const ticks = [0, 0.5, 1].map(t => Math.round(max * t));
  const h = hover !== null ? data[hover] : null;
  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * (W - L - R);
    setHover(Math.max(0, Math.min(data.length - 1, Math.round((px / (W - L - R)) * (data.length - 1)))));
  };
  return (
    <ChartCard title="Curva S de hitos" subtitle="Hitos acumulados: planificado frente a real." hint={null}>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><svg width="20" height="4" aria-hidden="true"><line x1="0" y1="2" x2="20" y2="2" className="stroke-chart-1" strokeWidth="2" strokeDasharray="4 3" /></svg>Planificado</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 rounded bg-copper" aria-hidden="true" />Real</span>
        <span className={`ml-auto rounded-full px-2.5 py-0.5 font-semibold tabular-nums ${dev < 0 ? 'bg-tone-red-bg text-tone-red-fg' : 'bg-tone-green-bg text-tone-green-fg'}`}>
          Desviación: {dev < 0 ? '−' : '+'}{Math.abs(dev)} hitos
        </span>
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Curva S de hitos. Desviación a la fecha de corte: ${dev} hitos.`}>
          {ticks.map(t => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray={t ? '2 4' : undefined} />
              <text x={L - 6} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">{t}</text>
            </g>
          ))}
          {data.map((d, i) => i % 3 === 0 && <text key={d.month} x={x(i)} y={H - 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">{d.label}</text>)}
          {ci >= 0 && (
            <g>
              <line x1={x(ci)} x2={x(ci)} y1={T} y2={H - B} className="stroke-copper" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x={x(ci) + 4} y={T + 8} className="fill-copper text-[10px] font-semibold">Corte</text>
              {cut.actualCompleted !== null && dev !== 0 && (
                <line x1={x(ci)} x2={x(ci)} y1={y(cut.plannedCompleted)} y2={y(cut.actualCompleted)} className="stroke-tone-red-solid" strokeWidth="3" strokeLinecap="round" />
              )}
            </g>
          )}
          <path d={planned} fill="none" className="stroke-chart-1" strokeWidth="2" strokeDasharray="5 4" />
          <path d={actual} fill="none" className="stroke-copper" strokeWidth="2.75" strokeLinejoin="round" strokeLinecap="round" />
          {h && (
            <g>
              <line x1={x(hover!)} x2={x(hover!)} y1={T} y2={H - B} className="stroke-foreground/40" />
              <circle cx={x(hover!)} cy={y(h.plannedCompleted)} r="4" className="fill-chart-1" />
              {h.actualCompleted !== null && <circle cx={x(hover!)} cy={y(h.actualCompleted)} r="4.5" className="fill-copper" />}
            </g>
          )}
          <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
        </svg>
        {h && (
          <div className="pointer-events-none absolute top-2 z-20 w-max -translate-x-1/2 rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg tabular-nums" style={{ left: `${(x(hover!) / W) * 100}%`, marginLeft: hover! > data.length - 4 ? -50 : hover! < 3 ? 50 : 0 }}>
            <div className="font-semibold capitalize">{h.label}</div>
            <div>Planificado: {h.plannedCompleted}</div>
            <div>Real: {h.actualCompleted ?? '—'}</div>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
