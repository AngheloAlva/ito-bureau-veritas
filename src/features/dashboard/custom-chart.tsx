'use client';

import { donutSegments, linePath, niceMax } from '@/lib/chart-geometry';
import { toneClasses, type Tone } from '@/lib/tones';
import type { ChartTypeId } from '@/lib/chart-builder';

export type ChartPoint = { key: string; label: string; value: number; tone?: Tone; selected?: boolean; onPick?: () => void };
export type LineSeries = { name: string; values: (number | null)[]; dashed?: boolean };

const BG = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5', 'bg-chart-6', 'bg-chart-7', 'bg-chart-8'];
const FILL = ['fill-chart-1', 'fill-chart-2', 'fill-chart-3', 'fill-chart-4', 'fill-chart-5', 'fill-chart-6', 'fill-chart-7', 'fill-chart-8'];
const STROKE = ['stroke-chart-1', 'stroke-chart-2'];
const bg = (p: ChartPoint, i: number) => (p.tone ? toneClasses(p.tone).solid : BG[i % 8]);
const fill = (p: ChartPoint, i: number) => (p.tone ? toneClasses(p.tone).fill : FILL[i % 8]);
const fmt = (v: number) => v.toLocaleString('es-CL', { maximumFractionDigits: 1 });
const MAX_CATEGORIES = 12;

type Props = {
  chart: ChartTypeId; points: ChartPoint[]; unit?: string; ariaLabel: string; series?: LineSeries[]; seriesLabels?: string[];
};

function interactive(p: ChartPoint, any: boolean) {
  return {
    type: 'button' as const, 'aria-pressed': p.onPick ? !!p.selected : undefined, disabled: !p.onPick,
    onClick: p.onPick, className: `outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${p.onPick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} ${any && !p.selected ? 'opacity-35' : ''} ${p.selected ? 'bg-copper-surface' : ''}`,
  };
}

export function CustomChartView({ chart, points, unit = '', ariaLabel, series, seriesLabels }: Props) {
  const all = points;
  const pts = chart === 'line' || all.length <= MAX_CATEGORIES ? all : all.slice(0, MAX_CATEGORIES);
  const any = pts.some(p => p.selected);
  const u = unit ? ` ${unit}` : '';
  if (pts.length === 0 || pts.every(p => p.value === 0) && !series) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No hay datos para esta combinación en la vista actual.</p>;
  }
  const trunc = all.length > pts.length ? <p className="mt-2 text-xs text-muted-foreground">Se muestran los {MAX_CATEGORIES} mayores de {all.length}.</p> : null;

  if (chart === 'hbar') {
    const max = Math.max(...pts.map(p => p.value), 1);
    return (
      <div>
        <ul className="space-y-1" aria-label={ariaLabel}>
          {pts.map((p, i) => (
            <li key={p.key}>
              <button {...interactive(p, any)} aria-label={`${p.label}: ${fmt(p.value)}${u}`} className={`${interactive(p, any).className} grid w-full grid-cols-[7rem_1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-left`}>
                <span className="truncate text-sm font-medium" title={p.label}>{p.label}</span>
                <span className="h-4 rounded-full bg-muted"><span className={`block h-full rounded-full ${bg(p, i)}`} style={{ width: `${Math.max(p.value ? 3 : 0, (p.value / max) * 100)}%` }} /></span>
                <span className="min-w-12 text-right text-sm font-semibold tabular-nums">{fmt(p.value)}{u}</span>
              </button>
            </li>
          ))}
        </ul>
        {trunc}
      </div>
    );
  }

  if (chart === 'bar') {
    const max = niceMax(Math.max(...pts.map(p => p.value), 1));
    return (
      <div>
        <ul className="flex h-52 items-end gap-1.5" aria-label={ariaLabel}>
          {pts.map((p, i) => (
            <li key={p.key} className="h-full min-w-0 flex-1">
              <button {...interactive(p, any)} aria-label={`${p.label}: ${fmt(p.value)}${u}`} className={`${interactive(p, any).className} flex size-full flex-col items-center justify-end gap-1 rounded-md px-0.5 pb-1`}>
                <span className="text-xs font-semibold tabular-nums">{fmt(p.value)}</span>
                <span className="flex w-full flex-1 items-end"><span className={`w-full rounded-t-md ${bg(p, i)}`} style={{ height: `${Math.max(p.value ? 2 : 0, (p.value / max) * 100)}%` }} /></span>
                <span className="w-full truncate text-center text-[11px] text-muted-foreground" title={p.label}>{p.label}</span>
              </button>
            </li>
          ))}
        </ul>
        {unit && <p className="mt-1 text-xs text-muted-foreground">Unidad: {unit}</p>}
        {trunc}
      </div>
    );
  }

  if (chart === 'donut') {
    const total = pts.reduce((a, p) => a + p.value, 0);
    const segs = donutSegments(pts.map(p => p.value));
    return (
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <svg viewBox="0 0 200 200" className="size-40 shrink-0" role="group" aria-label={ariaLabel}>
          {segs.map((s, i) => s.path && (
            <path key={pts[i].key} d={s.path} className={`${fill(pts[i], i)} ${any && !pts[i].selected ? 'opacity-35' : ''}`} />
          ))}
          <text x="100" y="104" textAnchor="middle" className="fill-foreground text-[30px] font-semibold tabular-nums">{fmt(total)}</text>
          <text x="100" y="122" textAnchor="middle" className="fill-muted-foreground text-[10px]">{unit || 'total'}</text>
        </svg>
        <ul className="w-full space-y-1">
          {pts.map((p, i) => (
            <li key={p.key}>
              <button {...interactive(p, any)} aria-label={`${p.label}: ${fmt(p.value)}${u}`} className={`${interactive(p, any).className} flex w-full items-center gap-2 rounded-lg px-2 py-1 text-sm`}>
                <span className={`size-2.5 shrink-0 rounded-full ${bg(p, i)}`} aria-hidden="true" />
                <span className="flex-1 truncate text-left" title={p.label}>{p.label}</span>
                <span className="font-semibold tabular-nums">{fmt(p.value)}</span>
                <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{total ? Math.round((p.value / total) * 100) : 0}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // line
  const W = 520, H = 220, L = 34, R = 14, T = 20, B = 30;
  const lines: LineSeries[] = series ?? [{ name: ariaLabel, values: pts.map(p => p.value) }];
  const n = pts.length;
  const max = niceMax(Math.max(...lines.flatMap(s => s.values.map(v => v ?? 0)), 1));
  const x = (i: number) => L + (n > 1 ? i / (n - 1) : 0.5) * (W - L - R);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const step = Math.ceil(n / 7);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="group" aria-label={ariaLabel}>
        {[0, 0.5, 1].map(t => <g key={t}><line x1={L} x2={W - R} y1={y(max * t)} y2={y(max * t)} className="stroke-border" strokeDasharray="2 4" /><text x={L - 6} y={y(max * t) + 3} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">{fmt(max * t)}</text></g>)}
        {pts.map((p, i) => i % step === 0 && <text key={p.key} x={x(i)} y={H - 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">{p.label}</text>)}
        {lines.map((s, si) => (
          <path key={s.name} d={linePath(s.values.map((v, i) => (v === null ? null : [x(i), y(v)])))} fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
            strokeDasharray={s.dashed ? '5 4' : undefined} className={si === 0 && !s.dashed ? 'stroke-copper' : STROKE[si % 2]} />
        ))}
        {!series && pts.map((p, i) => (
          <g key={p.key}>
            <text x={x(i)} y={y(p.value) - 9} textAnchor="middle" className="fill-foreground text-[10px] font-semibold tabular-nums">{fmt(p.value)}</text>
            <circle cx={x(i)} cy={y(p.value)} r={p.selected ? 6 : 4.5} tabIndex={p.onPick ? 0 : undefined} role={p.onPick ? 'button' : undefined} aria-pressed={p.onPick ? !!p.selected : undefined}
              aria-label={`${p.label}: ${fmt(p.value)}${u}`}
              onClick={p.onPick} onKeyDown={e => { if (p.onPick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); p.onPick(); } }}
              className={`fill-copper stroke-card outline-none focus-visible:stroke-foreground ${p.onPick ? 'cursor-pointer' : ''} ${any && !p.selected ? 'opacity-35' : ''}`} strokeWidth="2" />
          </g>
        ))}
      </svg>
      {series && (
        <ul className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
          {lines.map((s, si) => <li key={s.name}>{seriesLabels?.[si] ?? s.name}</li>)}
        </ul>
      )}
    </div>
  );
}
