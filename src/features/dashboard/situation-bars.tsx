'use client';

import { applyPortfolioFilter, omitKey, situationDistribution } from '@/lib/portfolio-analytics';
import { PORTFOLIO } from '@/data/portfolio';
import { ChartCard } from './card-shell';
import { CategoryBars, toneVar, type Cat } from './chart-kit';
import type { ChartProps } from './types';

export function SituationBars({ filter, toggle }: ChartProps) {
  const rows = situationDistribution(applyPortfolioFilter(PORTFOLIO, omitKey(filter, 'situation')));
  const data: Cat[] = rows.map(d => ({
    key: d.situation, label: d.situation, value: d.count, color: toneVar(d.tone),
    selected: filter.situation === d.situation, onPick: () => toggle('situation', d.situation),
  }));
  return (
    <ChartCard title="Situación de hitos" subtitle="Cierre, holgura o atraso a la fecha de corte." hint={filter.situation}>
      <CategoryBars data={data} orientation="horizontal" unit="hitos" height={272} labelWidth={142} ariaLabel="Situación de hitos" />
    </ChartCard>
  );
}
