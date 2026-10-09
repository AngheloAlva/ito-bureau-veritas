'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PORTFOLIO } from '@/data/portfolio';
import {
  applyPortfolioFilter, parsePortfolioFilter, serializePortfolioFilter,
  type FilterKey, type PortfolioFilter,
} from '@/lib/portfolio-analytics';

const URL_KEYS = ['estado', 'cliente', 'situacion', 'tramo', 'proyecto', 'hito'];

export function usePortfolioFilter() {
  const params = useSearchParams();
  const search = params.toString();
  const filter = useMemo(() => parsePortfolioFilter(new URLSearchParams(search), PORTFOLIO), [search]);
  const view = useMemo(() => applyPortfolioFilter(PORTFOLIO, filter), [filter]);

  const write = useCallback((next: PortfolioFilter) => {
    const sp = new URLSearchParams(window.location.search);
    URL_KEYS.forEach(k => sp.delete(k));
    Object.entries(serializePortfolioFilter(next)).forEach(([k, v]) => sp.set(k, v));
    const qs = sp.toString();
    window.history.pushState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, []);

  const setFilter = useCallback((patch: Partial<PortfolioFilter>) => write({ ...filter, ...patch }), [filter, write]);
  /** Click on the already selected value removes it. */
  const toggle = useCallback(<K extends FilterKey>(key: K, value: NonNullable<PortfolioFilter[K]>) => {
    const next = { ...filter };
    if (next[key] === value) delete next[key]; else (next as Record<string, unknown>)[key] = value;
    write(next);
  }, [filter, write]);
  const remove = useCallback((key: FilterKey) => { const n = { ...filter }; delete n[key]; write(n); }, [filter, write]);
  const clear = useCallback(() => write({}), [write]);
  return { filter, view, setFilter, toggle, remove, clear };
}
