'use client';

import { applyPortfolioFilter, clientBreakdown, omitKey } from '@/lib/portfolio-analytics';
import { PROJECT_HEALTHS } from '@/domain/portfolio';
import { HEALTH_TONE } from '@/lib/portfolio-analytics';
import { toneClasses } from '@/lib/tones';
import { PORTFOLIO } from '@/data/portfolio';
import { ChartCard, dim } from './card-shell';
import { TipBody, pctOf, useChartTooltip } from './chart-tooltip';
import type { ChartProps } from './types';

export function ClientBars({ filter, toggle }: ChartProps) {
  const rows = clientBreakdown(applyPortfolioFilter(PORTFOLIO, omitKey(filter, 'clientId')), PORTFOLIO.clients).filter(r => r.total > 0);
  const grand = rows.reduce((a, r) => a + r.total, 0);
  const max = Math.max(...rows.map(r => r.total), 1);
  const { ref, bind, node } = useChartTooltip();
  const any = !!filter.clientId;
  const hint = filter.clientId ? PORTFOLIO.clients.find(c => c.id === filter.clientId)?.name : null;
  return (
    <ChartCard title="Proyectos por cliente" subtitle="Estado de los proyectos de cada mandante." hint={hint}>
      <div ref={ref} className="relative">
        <ul className="space-y-1" aria-label="Proyectos por cliente">
          {rows.map(r => {
            const sel = filter.clientId === r.clientId;
            return (
              <li key={r.clientId}>
                <button
                  type="button" aria-pressed={sel} aria-label={`${r.name}: ${r.total} proyectos, atraso promedio ${r.avgDelayDays} días`}
                  onClick={() => toggle('clientId', r.clientId)}
                  className={`grid w-full grid-cols-[5.5rem_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${dim(sel, any)} ${sel ? 'bg-copper-surface' : ''}`}
                  {...bind(<TipBody label={r.name} value={PROJECT_HEALTHS.map(h => `${h}: ${r.byHealth[h]}`).join(' · ')} pct={pctOf(r.total, grand)} extra={r.avgDelayDays ? `Atraso prom. ${r.avgDelayDays} d` : 'Sin hitos atrasados'} />)}
                >
                  <span className="truncate text-sm font-medium">{r.short}</span>
                  <span className="flex h-5 overflow-hidden rounded-full bg-muted" style={{ width: `${(r.total / max) * 100}%`, minWidth: 24 }}>
                    {PROJECT_HEALTHS.map(h => r.byHealth[h] > 0 && (
                      <span key={h} className={`flex items-center justify-center text-[10px] font-semibold text-white transition-[flex-grow] duration-300 ${toneClasses(HEALTH_TONE[h]).solid}`} style={{ flexGrow: r.byHealth[h] }}>{r.byHealth[h]}</span>
                    ))}
                  </span>
                  <span className="text-right text-xs tabular-nums">
                    <span className="block text-sm font-semibold">{r.total}</span>
                    <span className={r.avgDelayDays ? 'text-tone-red-fg' : 'text-muted-foreground'}>{r.avgDelayDays ? `prom. ${r.avgDelayDays} d de atraso` : 'sin atraso'}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-label="Leyenda">
          {PROJECT_HEALTHS.map(h => <li key={h} className="flex items-center gap-1.5"><span className={`size-2.5 rounded-full ${toneClasses(HEALTH_TONE[h]).solid}`} aria-hidden="true" />{h}</li>)}
        </ul>
        {node}
      </div>
    </ChartCard>
  );
}
