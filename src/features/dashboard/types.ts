import type { FilterKey, PortfolioFilter } from '@/lib/portfolio-analytics';

export type ToggleFn = <K extends FilterKey>(key: K, value: NonNullable<PortfolioFilter[K]>) => void;
export type ChartProps = { filter: PortfolioFilter; toggle: ToggleFn };
