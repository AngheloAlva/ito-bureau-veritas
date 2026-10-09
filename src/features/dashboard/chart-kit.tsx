'use client';

import type { ReactNode } from 'react';
import { LabelList } from 'recharts';
import { useReducedMotion } from 'motion/react';
import { EvilBarChart } from '@/components/evilcharts/charts/recharts-bar-chart';
import { EvilPieChart } from '@/components/evilcharts/charts/recharts-pie-chart';
import { ChartTooltip } from '@/components/evilcharts/ui/recharts-tooltip';
import type { ChartConfig } from '@/components/evilcharts/ui/recharts-chart';
import type { Tone } from '@/lib/tones';

/** One category of a cross-filterable chart. `color` is any CSS color (usually a theme token). */
export type Cat = {
  key: string; label: string; value: number; color: string; selected?: boolean; onPick?: () => void;
};

export const toneVar = (tone: Tone) => `var(--tone-${tone}-solid)`;
export const chartVar = (i: number) => `var(--chart-${(i % 8) + 1})`;
export const fmt = (v: number) => v.toLocaleString('es-CL', { maximumFractionDigits: 1 });
export const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

const solid = (color: string) => ({ light: [color], dark: [color] });
const safeKey = (i: number) => `c${i}`;

/** Spanish tooltip for single-series category charts (bar / donut). */
function CatTooltip({ active, payload, unit }: { active?: boolean; payload?: { payload?: Record<string, unknown> }[]; unit: string }) {
  const row = payload?.[0]?.payload as { label?: string; value?: number; total?: number } | undefined;
  if (!active || !row || row.value === undefined) return <span className="p-4" />;
  return (
    <div className="grid min-w-32 gap-0.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl tabular-nums">
      <span className="font-semibold text-foreground">{row.label}</span>
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground">{fmt(row.value)}</span>{unit ? ` ${unit}` : ''}
        {row.total ? ` · ${pct(row.value, row.total)}% de la vista` : ''}
      </span>
    </div>
  );
}

export const catTooltip = (unit: string) => <ChartTooltip cursor={false} offset={18} allowEscapeViewBox={{ x: true, y: true }} wrapperStyle={{ zIndex: 20, outline: 'none' }} content={<CatTooltip unit={unit} />} />;

/**
 * Invisible keyboard layer over a chart: one focusable button per category, laid out on the same
 * equal-size grid as the bars/slices. Pointer events pass through to the chart.
 */
export function KeyboardLayer({ data, unit, axis }: { data: Cat[]; unit: string; axis: 'columns' | 'rows' }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 grid"
      style={axis === 'columns' ? { gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` } : { gridTemplateRows: `repeat(${data.length}, minmax(0, 1fr))` }}
    >
      {data.map(d => (
        <button
          key={d.key} type="button" aria-pressed={d.onPick ? !!d.selected : undefined} disabled={!d.onPick}
          aria-label={`${d.label}: ${fmt(d.value)}${unit ? ` ${unit}` : ''}`} onClick={d.onPick}
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        />
      ))}
    </div>
  );
}

type BarsProps = {
  data: Cat[]; orientation: 'vertical' | 'horizontal'; unit?: string; height?: number; ariaLabel: string; labelWidth?: number;
};

/** Single-series EvilCharts bar chart with per-category colour, dimming of unselected bars and click-to-filter. */
export function CategoryBars({ data, orientation, unit = '', height, ariaLabel, labelWidth = 118 }: BarsProps) {
  const horizontal = orientation === 'horizontal';
  const any = data.some(d => d.selected);
  const total = data.reduce((a, d) => a + d.value, 0);
  const rows = data.map(d => ({ key: d.key, label: d.label, value: d.value, total, __color: d.color, __dim: any && !d.selected }));
  const config: ChartConfig = { value: { label: unit || 'Valor', colors: solid('var(--chart-1)') } };
  const h = height ?? (horizontal ? Math.max(120, data.length * 34) : 184);
  const pick = (state: { activeTooltipIndex?: string | number | null }) => {
    const i = Number(state?.activeTooltipIndex);
    if (Number.isInteger(i)) data[i]?.onPick?.();
  };
  return (
    <div className="relative" role="group" aria-label={ariaLabel} style={{ height: h }}>
      <div aria-hidden="true" className="size-full">
        <EvilBarChart
          data={rows} config={config} layout={horizontal ? 'horizontal' : 'vertical'} barRadius={horizontal ? 5 : 6} animationType="left-to-right"
          className="size-full aspect-auto" barCategoryGap={horizontal ? '16%' : '18%'}
          chartProps={{ accessibilityLayer: false, margin: { top: horizontal ? 0 : 20, right: horizontal ? 34 : 0, bottom: 0, left: 0 }, onClick: pick, style: { cursor: 'pointer' } }}
        >
          {horizontal ? (
            <>
              <EvilBarChart.YAxis dataKey="label" width={labelWidth} interval={0} tick={{ fontSize: 12 }} tickMargin={6} />
              <EvilBarChart.XAxis hide />
            </>
          ) : (
            <>
              <EvilBarChart.XAxis dataKey="label" interval={0} tick={{ fontSize: 11 }} height={26} />
              <EvilBarChart.YAxis hide width={0} />
            </>
          )}
          {catTooltip(unit)}
          <EvilBarChart.Bar dataKey="value" barProps={{
            minPointSize: 3,
            children: <LabelList dataKey="value" position={horizontal ? 'right' : 'top'} offset={6} formatter={(v: unknown) => fmt(Number(v))} className="fill-foreground text-xs font-semibold tabular-nums" />,
          }} />
        </EvilBarChart>
      </div>
      <KeyboardLayer data={data} unit={unit} axis={horizontal ? 'rows' : 'columns'} />
    </div>
  );
}

type DonutProps = { data: Cat[]; unit?: string; ariaLabel: string; center?: { value: ReactNode; label: string }; size?: number };

/** EvilCharts donut with per-slice colour, dimming and click-to-filter. Keyboard access lives in <LegendButtons />. */
export function CategoryDonut({ data, unit = '', ariaLabel, center, size = 176 }: DonutProps) {
  const reduced = useReducedMotion();
  const any = data.some(d => d.selected);
  const total = data.reduce((a, d) => a + d.value, 0);
  const visible = data.filter(d => d.value > 0);
  const config: ChartConfig = Object.fromEntries(data.map((d, i) => [safeKey(i), { label: d.label, colors: solid(d.color) }]));
  const rows = data.map((d, i) => ({ name: safeKey(i), label: d.label, value: d.value, total, __dim: any && !d.selected })).filter(r => r.value > 0);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={ariaLabel}>
      <EvilPieChart
        data={rows} config={config} dataKey="value" nameKey="name" className="size-full aspect-square"
        chartProps={{ accessibilityLayer: false, margin: { top: 2, right: 2, bottom: 2, left: 2 } }}
      >
        {catTooltip(unit)}
        <EvilPieChart.Pie
          innerRadius="66%" outerRadius="100%" paddingAngle={visible.length > 1 ? 2 : 0} cornerRadius={5} startAngle={90} endAngle={-270}
          pieProps={{
            style: { cursor: 'pointer' }, animationDuration: 450, animationEasing: 'ease-out', isAnimationActive: !reduced,
            onClick: (_: unknown, i: number) => visible[i]?.onPick?.(),
          }}
        />
      </EvilPieChart>
      {center && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${size < 170 ? 'text-2xl' : 'text-3xl'} font-semibold leading-none tabular-nums`}>{center.value}</span>
          <span className="mt-1 text-xs text-muted-foreground">{center.label}</span>
        </div>
      )}
    </div>
  );
}

/** Keyboard-accessible legend rows (buttons) with value and share; mirrors the cross-filter state. */
export function LegendButtons({ data, unit = '', ariaLabel, dense = false }: { data: Cat[]; unit?: string; ariaLabel: string; dense?: boolean }) {
  const any = data.some(d => d.selected);
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <ul className="w-full space-y-0.5" aria-label={ariaLabel}>
      {data.map(d => (
        <li key={d.key}>
          <button
            type="button" aria-pressed={d.onPick ? !!d.selected : undefined} disabled={!d.onPick} onClick={d.onPick}
            aria-label={`${d.label}: ${fmt(d.value)}${unit ? ` ${unit}` : ''}`}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2 ${dense ? 'py-1' : 'py-1.5'} text-sm outline-none transition-[background-color,opacity] duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${any && !d.selected ? 'opacity-35' : ''} ${d.selected ? 'bg-copper-surface' : ''} ${d.onPick ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} aria-hidden="true" />
            <span className="flex-1 truncate text-left" title={d.label}>{d.label}</span>
            <span className="font-semibold tabular-nums">{fmt(d.value)}</span>
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{pct(d.value, total)}%</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
