'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';
import { useAnalysisStore } from './store';

export function useAnalysisRun(key: string, version: number) {
  const { controller } = useAnalysisStore();
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  useLayoutEffect(() => () => controller.cancel(), [controller, key]);
  useLayoutEffect(() => { controller.setContext(key, version); }, [controller, key, version]);
  return { state, controller };
}
