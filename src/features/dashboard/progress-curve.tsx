'use client';

import { ReferenceLine } from 'recharts';
import { EvilAreaChart } from '@/components/evilcharts/charts/recharts-area-chart';
import { ChartTooltip } from '@/components/evilcharts/ui/recharts-tooltip';
import type { ChartConfig } from '@/components/evilcharts/ui/recharts-chart';
import { REFERENCE_DATE } from '@/domain/types';
import { progressCurve, type PortfolioView } from '@/lib/portfolio-analytics';
import { ChartCard } from './card-shell';
import { STATUS_ICON, StatusChip } from './status-chip';

const PLANNED = 'var(--chart-1)';
const ACTUAL = 'var(--copper)';
const config: ChartConfig = {
  planned: { label: 'Planificado', colors: { light: [PLANNED], dark: [PLANNED] } },
  actual: { label: 'Real', colors: { light: [ACTUAL], dark: [ACTUAL] } },
};

type Row = { month: string; label: string; planned: number; actual: number | null };

function CurveTooltip({ active, payload }: { active?: boolean; payload?: { payload?: Row }[] }) {
  const r = payload?.[0]?.payload;
  if (!active || !r) return <span className="p-4" />;
  const diff = r.actual === null ? null : r.actual - r.planned;
  return (
    <div className="grid min-w-36 gap-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl tabular-nums">
      <span className="font-semibold capitalize">{r.label}</span>
      <span className="flex justify-between gap-4 text-muted-foreground"><span>Planificado</span><span className="font-semibold text-foreground">{r.planned}</span></span>
      <span className="flex justify-between gap-4 text-muted-foreground"><span>Real</span><span className="font-semibold text-foreground">{r.actual ?? '—'}</span></span>
      {diff !== null && diff !== 0 && <span className={diff < 0 ? 'text-tone-red-fg' : 'text-tone-green-fg'}>{diff < 0 ? '−' : '+'}{Math.abs(diff)} hitos frente al plan</span>}
    </div>
  );
}

export function ProgressCurve({ view }: { view: PortfolioView }) {
  const refMonth = REFERENCE_DATE.slice(0, 7);
  // At the reference month both series are measured at the cut date itself (not month end), so the real line ends without a jump.
  const data: Row[] = progressCurve(view).map(d => d.month !== refMonth ? { month: d.month, label: d.label, planned: d.plannedCompleted, actual: d.actualCompleted } : {
    month: d.month, label: d.label,
    planned: view.milestones.filter(m => m.plannedEnd <= REFERENCE_DATE).length,
    actual: view.milestones.filter(m => m.actualEnd && m.actualEnd <= REFERENCE_DATE).length,
  });
  const cut = data.find(d => d.month === refMonth);
  const dev = cut && cut.actual !== null ? cut.actual - cut.planned : 0;
  const labels = new Map(data.map(d => [d.month, d.label]));
  return (
    <ChartCard title="Curva S de hitos" subtitle="Hitos acumulados: planificado frente a real." hint={null}>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><svg width="20" height="4" aria-hidden="true"><line x1="0" y1="2" x2="20" y2="2" stroke={PLANNED} strokeWidth="2" strokeDasharray="4 3" /></svg>Planificado</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 rounded bg-copper" aria-hidden="true" />Real</span>
        <StatusChip tone={dev < 0 ? 'red' : 'green'} icon={dev < 0 ? STATUS_ICON.Atrasado : STATUS_ICON.Completado} className="ml-auto">
          Al corte: real {cut?.actual ?? 0} vs planificado {cut?.planned ?? 0} ({dev < 0 ? '−' : '+'}{Math.abs(dev)} hitos)
        </StatusChip>
      </div>
      <div role="img" aria-label={`Curva S de hitos. Desviación a la fecha de corte: ${dev} hitos.`} className="h-[236px]">
        <EvilAreaChart data={data} config={config} curveType="monotone" className="size-full aspect-auto" chartProps={{ accessibilityLayer: false, margin: { top: 8, right: 18, bottom: 0, left: 0 } }}>
          <EvilAreaChart.Grid vertical={false} />
          <EvilAreaChart.XAxis dataKey="month" interval={2} tickFormatter={(m: string) => labels.get(m) ?? m} tick={{ fontSize: 11 }} />
          <EvilAreaChart.YAxis width={38} tick={{ fontSize: 11 }} allowDecimals={false} />
          <ChartTooltip cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} content={<CurveTooltip />} />
          {cut && <ReferenceLine x={cut.month} stroke={ACTUAL} strokeDasharray="3 3" label={{ value: 'Corte', position: 'insideTopRight', fill: ACTUAL, fontSize: 11, fontWeight: 600 }} />}
          {cut && cut.actual !== null && dev !== 0 && <ReferenceLine segment={[{ x: cut.month, y: cut.planned }, { x: cut.month, y: cut.actual }]} stroke="var(--tone-red-solid)" strokeWidth={3} strokeLinecap="round" />}
          <EvilAreaChart.Area dataKey="planned" variant="gradient" strokeVariant="dashed" strokeWidth={2} areaProps={{ fillOpacity: 0.06 }} />
          <EvilAreaChart.Area dataKey="actual" variant="gradient" strokeVariant="solid" strokeWidth={2.75} />
        </EvilAreaChart>
      </div>
    </ChartCard>
  );
}
