'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { CUSTOM_CHARTS_KEY, loadCustomCharts, saveCustomCharts, type CustomChart } from '@/lib/chart-builder';

const EVENT = 'ito-custom-charts-change';
const subscribe = (cb: () => void) => {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENT, cb);
  return () => { window.removeEventListener('storage', cb); window.removeEventListener(EVENT, cb); };
};
const read = () => { try { return window.localStorage.getItem(CUSTOM_CHARTS_KEY) ?? ''; } catch { return ''; } };

/** `charts` is null on the server and during hydration, then the persisted list. */
export function useCustomCharts() {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const charts = useMemo(() => (raw === null ? null : loadCustomCharts({ getItem: () => raw, setItem: () => undefined })), [raw]);
  const write = useCallback((next: CustomChart[]) => {
    saveCustomCharts(window.localStorage, next);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { charts, write };
}
