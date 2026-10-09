'use client';

import { applyPortfolioFilter, durationHistogram, omitKey } from '@/lib/portfolio-analytics';
import { PORTFOLIO } from '@/data/portfolio';
import { ChartCard } from './card-shell';
import { CategoryBars, chartVar, type Cat } from './chart-kit';
import type { ChartProps } from './types';

export function DurationHistogram({ filter, toggle }: ChartProps) {
  const rows = durationHistogram(applyPortfolioFilter(PORTFOLIO, omitKey(filter, 'bucket')));
  const data: Cat[] = rows.map(d => ({
    key: d.bucket, label: d.bucket, value: d.count, color: chartVar(1),
    selected: filter.bucket === d.bucket, onPick: () => toggle('bucket', d.bucket),
  }));
  return (
    <ChartCard title="Tiempo de ejecución de hitos" subtitle="Hitos según días de ejecución." hint={filter.bucket}>
      <CategoryBars data={data} orientation="vertical" unit="hitos" height={272} ariaLabel="Histograma de tiempo de ejecución" />
    </ChartCard>
  );
}
