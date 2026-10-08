'use client';

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useDemo } from '@/components/demo-provider';
import { browserScheduler, createAnalysisRun, type AnalysisRun } from '@/lib/analysis-run';
import type { Analysis } from '@/domain/types';

const AnalysisContext = createContext<{ analyses: Record<string, Analysis>; controller: AnalysisRun } | null>(null);

// Persistent session-only results. The mounted provider invalidates runs even
// when Next retains an inactive page and its context subscriptions are paused.
export function AnalysisStore({ children }: { children: ReactNode }) {
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [controller] = useState(() => createAnalysisRun(browserScheduler,
    (key, result) => setAnalyses(previous => ({ ...previous, [key]: result }))));
  const demo = useDemo();
  const pathname = usePathname();
  useLayoutEffect(() => { controller.invalidateVersion(demo.data.version); }, [controller, demo.data.version]);
  useLayoutEffect(() => { controller.cancel(); }, [controller, pathname, demo.projectId]);
  useLayoutEffect(() => () => controller.cancel(), [controller]);
  return <AnalysisContext.Provider value={{ analyses, controller }}>{children}</AnalysisContext.Provider>;
}

export function useAnalysisStore() {
  const store = useContext(AnalysisContext);
  if (!store) throw new Error('Proveedor de análisis no disponible.');
  return store;
}
