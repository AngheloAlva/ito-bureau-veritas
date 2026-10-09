'use client';

import { healthDistribution, omitKey, applyPortfolioFilter } from '@/lib/portfolio-analytics';
import { PORTFOLIO } from '@/data/portfolio';
import { ChartCard } from './card-shell';
import { CategoryDonut, LegendButtons, toneVar, type Cat } from './chart-kit';
import type { ChartProps } from './types';

export function HealthDonut({ filter, toggle }: ChartProps) {
  const rows = healthDistribution(applyPortfolioFilter(PORTFOLIO, omitKey(filter, 'health')));
  const total = rows.reduce((a, d) => a + d.count, 0);
  const data: Cat[] = rows.map(d => ({
    key: d.health, label: d.health, value: d.count, color: toneVar(d.tone),
    selected: filter.health === d.health, onPick: () => toggle('health', d.health),
  }));
  return (
    <ChartCard title="Estado de proyectos" subtitle="Distribución de la cartera por estado." hint={filter.health}>
      <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
        <CategoryDonut data={data} unit="proyectos" ariaLabel="Gráfico de estado de proyectos" center={{ value: total, label: 'proyectos' }} />
        <LegendButtons data={data} unit="proyectos" ariaLabel="Estado de proyectos" />
      </div>
    </ChartCard>
  );
}
