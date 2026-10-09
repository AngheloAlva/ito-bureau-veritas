'use client';

import { LabelList } from 'recharts';
import { EvilBarChart } from '@/components/evilcharts/charts/recharts-bar-chart';
import { ChartTooltip } from '@/components/evilcharts/ui/recharts-tooltip';
import type { ChartConfig } from '@/components/evilcharts/ui/recharts-chart';
import { applyPortfolioFilter, clientBreakdown, omitKey, HEALTH_TONE } from '@/lib/portfolio-analytics';
import { PROJECT_HEALTHS } from '@/domain/portfolio';
import { PORTFOLIO } from '@/data/portfolio';
import { ChartCard } from './card-shell';
import { KeyboardLayer, pct, toneVar, type Cat } from './chart-kit';
import type { ChartProps } from './types';

const SERIES = { Completado: 'done', 'En curso': 'active', Atrasado: 'late' } as const;
const config: ChartConfig = Object.fromEntries(PROJECT_HEALTHS.map(h => [SERIES[h], { label: h, colors: { light: [toneVar(HEALTH_TONE[h])], dark: [toneVar(HEALTH_TONE[h])] } }]));

type Row = { key: string; label: string; total: number; grand: number; delay: number; done: number; active: number; late: number; __dim: boolean };

function ClientTooltip({ active, payload }: { active?: boolean; payload?: { payload?: Row }[] }) {
  const r = payload?.[0]?.payload;
  if (!active || !r) return <span className="p-4" />;
  return (
    <div className="grid min-w-40 gap-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl tabular-nums">
      <span className="font-semibold">{r.label}</span>
      {PROJECT_HEALTHS.map(h => (
        <span key={h} className="flex items-center justify-between gap-4 text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: toneVar(HEALTH_TONE[h]) }} aria-hidden="true" />{h}</span>
          <span className="font-semibold text-foreground">{r[SERIES[h]]}</span>
        </span>
      ))}
      <span className="border-t pt-1 text-muted-foreground">{r.total} proyectos · {pct(r.total, r.grand)}% de la vista{r.delay ? ` · atraso prom. ${r.delay} d` : ' · sin atraso'}</span>
    </div>
  );
}

export function ClientBars({ filter, toggle }: ChartProps) {
  const found = clientBreakdown(applyPortfolioFilter(PORTFOLIO, omitKey(filter, 'clientId')), PORTFOLIO.clients).filter(r => r.total > 0);
  const grand = found.reduce((a, r) => a + r.total, 0);
  const any = !!filter.clientId;
  const rows: Row[] = found.map(r => ({
    key: r.clientId, label: r.short, total: r.total, grand, delay: r.avgDelayDays,
    done: r.byHealth.Completado, active: r.byHealth['En curso'], late: r.byHealth.Atrasado, __dim: any && filter.clientId !== r.clientId,
  }));
  const cats: Cat[] = found.map(r => ({ key: r.clientId, label: `${r.name}, ${r.avgDelayDays ? `atraso promedio ${r.avgDelayDays} días` : 'sin atraso'}`, value: r.total, color: '', selected: filter.clientId === r.clientId, onPick: () => toggle('clientId', r.clientId) }));
  const hint = filter.clientId ? PORTFOLIO.clients.find(c => c.id === filter.clientId)?.name : null;
  const h = Math.max(150, rows.length * 38);
  return (
    <ChartCard title="Proyectos por cliente" subtitle="Estado de los proyectos de cada mandante." hint={hint}>
      <div className="relative" role="group" aria-label="Proyectos por cliente" style={{ height: h }}>
        <div aria-hidden="true" className="size-full">
          <EvilBarChart
            data={rows} config={config} layout="horizontal" stackType="stacked" barRadius={4} className="size-full aspect-auto" barCategoryGap="16%"
            chartProps={{ accessibilityLayer: false, margin: { top: 0, right: 8, bottom: 0, left: 0 }, style: { cursor: 'pointer' },
              onClick: (s: { activeTooltipIndex?: string | number | null }) => { const i = Number(s?.activeTooltipIndex); if (Number.isInteger(i)) cats[i]?.onPick?.(); } }}
          >
            <EvilBarChart.YAxis dataKey="label" width={96} interval={0} tick={{ fontSize: 12 }} tickMargin={6} />
            <EvilBarChart.XAxis hide />
            <ChartTooltip cursor={false} content={<ClientTooltip />} />
            {PROJECT_HEALTHS.map(hh => (
              <EvilBarChart.Bar key={hh} dataKey={SERIES[hh]} barProps={{
                children: <LabelList dataKey={SERIES[hh]} position="center" formatter={(v: unknown) => (Number(v) > 0 ? String(v) : '')} className="fill-white text-[11px] font-semibold tabular-nums" />,
              }} />
            ))}
          </EvilBarChart>
        </div>
        <KeyboardLayer data={cats} unit="proyectos" axis="rows" />
      </div>
      <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-label="Leyenda">
        {PROJECT_HEALTHS.map(hh => <li key={hh} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: toneVar(HEALTH_TONE[hh]) }} aria-hidden="true" />{hh}</li>)}
      </ul>
    </ChartCard>
  );
}
