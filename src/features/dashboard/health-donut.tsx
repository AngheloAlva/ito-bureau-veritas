'use client';

import { donutSegments } from '@/lib/chart-geometry';
import { healthDistribution, omitKey, applyPortfolioFilter } from '@/lib/portfolio-analytics';
import { toneClasses } from '@/lib/tones';
import { PORTFOLIO } from '@/data/portfolio';
import { ChartCard, dim } from './card-shell';
import { TipBody, pctOf, useChartTooltip } from './chart-tooltip';
import type { ChartProps } from './types';

export function HealthDonut({ filter, toggle }: ChartProps) {
  const data = healthDistribution(applyPortfolioFilter(PORTFOLIO, omitKey(filter, 'health')));
  const total = data.reduce((a, d) => a + d.count, 0);
  const segs = donutSegments(data.map(d => d.count));
  const { ref, bind, node } = useChartTooltip();
  const any = !!filter.health;
  return (
    <ChartCard title="Estado de proyectos" subtitle="Distribución de la cartera por estado." hint={filter.health}>
      <div ref={ref} className="relative flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
        <svg viewBox="0 0 200 200" className="size-44 shrink-0" role="group" aria-label="Gráfico de estado de proyectos">
          {segs.map((s, i) => s.path && (
            <path
              key={data[i].health} d={s.path} tabIndex={0} role="button"
              aria-pressed={filter.health === data[i].health}
              aria-label={`${data[i].health}: ${data[i].count} proyectos`}
              onClick={() => toggle('health', data[i].health)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('health', data[i].health); } }}
              className={`${toneClasses(data[i].tone).fill} cursor-pointer outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:stroke-foreground focus-visible:stroke-2 motion-reduce:transition-none ${dim(filter.health === data[i].health, any)}`}
              {...bind(<TipBody label={data[i].health} value={`${data[i].count} proyectos`} pct={pctOf(data[i].count, total)} />)}
            />
          ))}
          <text x="100" y="98" textAnchor="middle" className="fill-foreground text-[34px] font-semibold tabular-nums">{total}</text>
          <text x="100" y="120" textAnchor="middle" className="fill-muted-foreground text-[11px]">proyectos</text>
        </svg>
        <ul className="w-full space-y-1.5">
          {data.map(d => (
            <li key={d.health}>
              <button
                type="button" aria-pressed={filter.health === d.health} onClick={() => toggle('health', d.health)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none ${dim(filter.health === d.health, any)} ${filter.health === d.health ? 'bg-copper-surface' : ''}`}
              >
                <span className={`size-2.5 rounded-full ${toneClasses(d.tone).solid}`} aria-hidden="true" />
                <span className="flex-1 text-left">{d.health}</span>
                <span className="font-semibold tabular-nums">{d.count}</span>
                <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{pctOf(d.count, total)}%</span>
              </button>
            </li>
          ))}
        </ul>
        {node}
      </div>
    </ChartCard>
  );
}
