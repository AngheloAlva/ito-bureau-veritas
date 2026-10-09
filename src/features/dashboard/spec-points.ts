import { PORTFOLIO } from '@/data/portfolio';
import { aggregate, metricUnit, type ChartSpec } from '@/lib/chart-builder';
import { applyPortfolioFilter, omitKey, type FilterKey, type PortfolioFilter } from '@/lib/portfolio-analytics';
import type { ChartPoint } from './custom-chart';
import type { ToggleFn } from './types';

const DIM_KEY: Partial<Record<ChartSpec['dimension'], FilterKey>> = { health: 'health', client: 'clientId', situation: 'situation', bucket: 'bucket' };

/** Points for a spec over the filtered portfolio; the dimension's own filter is ignored (like the other cards). */
export function specPoints(spec: ChartSpec, filter: PortfolioFilter, toggle?: ToggleFn): { points: ChartPoint[]; unit: string } {
  const key = DIM_KEY[spec.dimension];
  const view = applyPortfolioFilter(PORTFOLIO, key ? omitKey(filter, key) : filter);
  const points = aggregate(view, spec).map(r => {
    const entry = r.filter ? (Object.entries(r.filter)[0] as [FilterKey, string] | undefined) : undefined;
    return {
      key: r.key, label: r.label, value: r.value, tone: r.tone,
      selected: !!entry && (filter as Record<string, string | undefined>)[entry[0]] === entry[1],
      onPick: entry && toggle ? () => toggle(entry[0], entry[1] as never) : undefined,
    };
  });
  return { points, unit: metricUnit(spec.metric) };
}
