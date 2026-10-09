'use client';

import { ReferenceDot } from 'recharts';
import { EvilAreaChart } from '@/components/evilcharts/charts/recharts-area-chart';
import { ChartTooltip, ChartTooltipContent } from '@/components/evilcharts/ui/recharts-tooltip';
import type { ChartConfig } from '@/components/evilcharts/ui/recharts-chart';
import type { ChartTypeId } from '@/lib/chart-builder';
import type { Tone } from '@/lib/tones';
import { CategoryBars, CategoryDonut, LegendButtons, catTooltip, chartVar, fmt, toneVar, type Cat } from './chart-kit';

export type ChartPoint = { key: string; label: string; value: number; tone?: Tone; selected?: boolean; onPick?: () => void };
export type LineSeries = { name: string; values: (number | null)[]; dashed?: boolean };

const MAX_CATEGORIES = 12;
const SERIES_COLORS = ['var(--copper)', 'var(--chart-1)'];

type Props = {
  chart: ChartTypeId; points: ChartPoint[]; unit?: string; ariaLabel: string; series?: LineSeries[]; seriesLabels?: string[];
};

const toCat = (p: ChartPoint, i: number): Cat => ({ key: p.key, label: p.label, value: p.value, color: p.tone ? toneVar(p.tone) : chartVar(i), selected: p.selected, onPick: p.onPick });

export function CustomChartView({ chart, points, unit = '', ariaLabel, series, seriesLabels }: Props) {
  const pts = chart === 'line' || points.length <= MAX_CATEGORIES ? points : points.slice(0, MAX_CATEGORIES);
  if (pts.length === 0 || (pts.every(p => p.value === 0) && !series)) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No hay datos para esta combinación en la vista actual.</p>;
  }
  const trunc = points.length > pts.length ? <p className="mt-2 text-xs text-muted-foreground">Se muestran los {MAX_CATEGORIES} mayores de {points.length}.</p> : null;
  const cats = pts.map((p, i) => ({ ...toCat(p, i), ...(chart === 'line' ? { color: 'var(--copper)' } : {}) }));

  if (chart === 'hbar') {
    return <div><CategoryBars data={cats} orientation="horizontal" unit={unit} ariaLabel={ariaLabel} labelWidth={140} />{trunc}</div>;
  }
  if (chart === 'bar') {
    return <div><CategoryBars data={cats} orientation="vertical" unit={unit} height={220} ariaLabel={ariaLabel} />{trunc}</div>;
  }
  if (chart === 'donut') {
    const total = cats.reduce((a, c) => a + c.value, 0);
    return (
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <CategoryDonut data={cats} unit={unit} ariaLabel={ariaLabel} size={160} center={{ value: fmt(total), label: unit || 'total' }} />
        <LegendButtons data={cats} unit={unit} ariaLabel={ariaLabel} dense />
      </div>
    );
  }

  // line
  const lines: LineSeries[] = series ?? [{ name: ariaLabel, values: pts.map(p => p.value) }];
  const rows = pts.map((p, i) => ({ key: p.key, label: p.label, value: p.value, ...Object.fromEntries(lines.map((s, si) => [`s${si}`, s.values[i]])) }));
  const config: ChartConfig = Object.fromEntries(lines.map((s, si) => [`s${si}`, { label: seriesLabels?.[si] ?? s.name, colors: { light: [SERIES_COLORS[si % 2]], dark: [SERIES_COLORS[si % 2]] } }]));
  const selected = pts.find(p => p.selected);
  return (
    <div>
      <div role="img" aria-label={ariaLabel} className="h-[220px]">
        <EvilAreaChart data={rows} config={config} curveType={series ? "monotone" : "linear"} className="size-full aspect-auto"
          chartProps={{ accessibilityLayer: false, margin: { top: 14, right: 12, bottom: 0, left: 0 }, style: series ? undefined : { cursor: 'pointer' },
            onClick: series ? undefined : (s: { activeTooltipIndex?: string | number | null }) => { const i = Number(s?.activeTooltipIndex); if (Number.isInteger(i)) pts[i]?.onPick?.(); } }}>
          <EvilAreaChart.Grid vertical={false} />
          <EvilAreaChart.XAxis dataKey="label" tick={{ fontSize: 11 }} interval={Math.max(0, Math.ceil(pts.length / 7) - 1)} />
          <EvilAreaChart.YAxis width={34} tick={{ fontSize: 11 }} tickFormatter={(v: number) => fmt(v)} />
          {series ? <ChartTooltip content={<ChartTooltipContent />} /> : catTooltip(unit)}
          {lines.map((s, si) => <EvilAreaChart.Area key={s.name} dataKey={`s${si}`} variant="gradient" strokeVariant={s.dashed ? 'dashed' : 'solid'} strokeWidth={2.5} areaProps={s.dashed ? { fillOpacity: 0.05 } : undefined} />)}
          {!series && selected && <ReferenceDot x={selected.label} y={selected.value} r={6} fill="var(--copper)" stroke="var(--card)" strokeWidth={2} />}
        </EvilAreaChart>
      </div>
      {series
        ? <ul className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">{lines.map((s, si) => <li key={s.name}>{seriesLabels?.[si] ?? s.name}</li>)}</ul>
        : <div className="mt-2"><LegendButtons data={cats} unit={unit} ariaLabel={`${ariaLabel}: puntos`} dense /></div>}
    </div>
  );
}
