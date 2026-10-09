'use client';

import { applyPortfolioFilter, omitKey, situationDistribution } from '@/lib/portfolio-analytics';
import { toneClasses } from '@/lib/tones';
import { PORTFOLIO } from '@/data/portfolio';
import { ChartCard, dim } from './card-shell';
import { TipBody, pctOf, useChartTooltip } from './chart-tooltip';
import type { ChartProps } from './types';

export function SituationBars({ filter, toggle }: ChartProps) {
  const data = situationDistribution(applyPortfolioFilter(PORTFOLIO, omitKey(filter, 'situation')));
  const total = data.reduce((a, d) => a + d.count, 0);
  const max = Math.max(...data.map(d => d.count), 1);
  const { ref, bind, node } = useChartTooltip();
  const any = !!filter.situation;
  return (
    <ChartCard title="Situación de hitos" subtitle="Cierre, holgura o atraso a la fecha de corte." hint={filter.situation}>
      <div ref={ref} className="relative"><ul className="space-y-1" aria-label="Situación de hitos">
        {data.map(d => {
          const sel = filter.situation === d.situation;
          return (
            <li key={d.situation}>
              <button
                type="button" aria-pressed={sel} aria-label={`${d.situation}: ${d.count} hitos`}
                onClick={() => toggle('situation', d.situation)}
                className={`grid w-full grid-cols-[7.5rem_1fr_2rem] items-center gap-2 rounded-md px-1 py-1 text-left text-xs outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${dim(sel, any)} ${sel ? 'bg-copper-surface' : ''}`}
                {...bind(<TipBody label={d.situation} value={`${d.count} hitos`} pct={pctOf(d.count, total)} />)}
              >
                <span className="truncate">{d.situation}</span>
                <span className="h-3 rounded-full bg-muted">
                  <span className={`block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${toneClasses(d.tone).solid}`} style={{ width: `${(d.count / max) * 100}%`, minWidth: d.count ? 4 : 0 }} />
                </span>
                <span className="text-right font-semibold tabular-nums">{d.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
        {node}
      </div>
    </ChartCard>
  );
}
