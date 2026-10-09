'use client';

import { applyPortfolioFilter, durationHistogram, omitKey } from '@/lib/portfolio-analytics';
import { niceMax } from '@/lib/chart-geometry';
import { PORTFOLIO } from '@/data/portfolio';
import { ChartCard, dim } from './card-shell';
import { TipBody, pctOf, useChartTooltip } from './chart-tooltip';
import type { ChartProps } from './types';

export function DurationHistogram({ filter, toggle }: ChartProps) {
  const data = durationHistogram(applyPortfolioFilter(PORTFOLIO, omitKey(filter, 'bucket')));
  const total = data.reduce((a, d) => a + d.count, 0);
  const max = niceMax(Math.max(...data.map(d => d.count), 1));
  const { ref, bind, node } = useChartTooltip();
  const any = !!filter.bucket;
  return (
    <ChartCard title="Tiempo de ejecución de hitos" subtitle="Hitos según días de ejecución." hint={filter.bucket}>
      <div ref={ref} className="relative">
        <div className="flex h-44 items-end gap-2 border-b border-border pt-6" role="group" aria-label="Histograma de tiempo de ejecución">
          {data.map(d => {
            const sel = filter.bucket === d.bucket;
            return (
              <button
                key={d.bucket} type="button" aria-pressed={sel} aria-label={`${d.bucket}: ${d.count} hitos`}
                onClick={() => toggle('bucket', d.bucket)}
                className={`group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 rounded-t-lg outline-none focus-visible:ring-2 focus-visible:ring-ring ${dim(sel, any)} transition-opacity duration-200 motion-reduce:transition-none`}
                {...bind(<TipBody label={`${d.bucket} de ejecución`} value={`${d.count} hitos`} pct={pctOf(d.count, total)} />)}
              >
                <span className="text-xs font-semibold tabular-nums">{d.count}</span>
                <span
                  className={`w-full rounded-t-md transition-[height,background-color] duration-300 motion-reduce:transition-none ${sel ? 'bg-copper' : 'bg-chart-2 group-hover:bg-chart-1'}`}
                  style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 3 : 0 }}
                />
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-2">
          {data.map(d => <span key={d.bucket} className="min-w-0 flex-1 text-center text-[11px] text-muted-foreground tabular-nums">{d.bucket}</span>)}
        </div>
        {node}
      </div>
    </ChartCard>
  );
}
