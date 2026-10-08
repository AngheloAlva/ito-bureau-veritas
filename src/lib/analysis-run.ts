import { analyze } from '../domain/core.ts';
import type { Analysis, Data } from '../domain/types.ts';

export interface Scheduler { schedule(callback: () => void, delay: number): () => void }
export interface RunState {
  running: boolean;
  stage: number;
  key: string;
  version: number;
  result?: Analysis;
  data?: Data;
  reason?: 'cancelled' | 'changed';
}
export const ANALYSIS_STAGES = [
  'Organizar visitas', 'Revisar severidad y plazos',
  'Vincular fuentes', 'Preparar prioridades',
] as const;
const IDLE: RunState = { running: false, stage: 0, key: '', version: -1 };

// All delayed effects pass the same context + generation gate, even if a scheduler
// delivers a callback after cancellation. Neither input nor prior results are edited.
export function createAnalysisRun(scheduler: Scheduler, save: (key: string, result: Analysis) => void, now = () => new Date().toISOString()) {
  let state = IDLE;
  let context = { key: '', version: -1 };
  let generation = 0;
  let disposed = false;
  let timers: (() => void)[] = [];
  const listeners = new Set<() => void>();
  function publish(next: RunState) {
    state = next;
    listeners.forEach(listener => listener());
  }
  function clear() {
    generation++;
    timers.forEach(cancel => cancel());
    timers = [];
  }
  function cancel(reason: RunState['reason'] = 'cancelled') {
    clear();
    publish({ ...IDLE, key: context.key, version: context.version, reason: state.running ? reason : undefined });
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    setContext(key: string, version: number) {
      if (context.key === key && context.version === version) return;
      const changed = context.version !== version;
      context = { key, version };
      cancel(changed && state.running ? 'changed' : undefined);
    },
    invalidateVersion(version: number) {
      if (version !== context.version) this.setContext(context.key, version);
    },
    cancel,
    dispose() { clear(); disposed = true; publish(IDLE); listeners.clear(); },
    start(input: Data, projectId: string) {
      if (disposed) return;
      const key = projectId || 'cartera';
      if (context.key !== key || context.version !== input.version) return;
      clear();
      const token = generation;
      const data = structuredClone(input);
      const result = analyze(data, projectId || undefined, now());
      const valid = () => !disposed && token === generation && context.key === key && context.version === data.version;
      publish({ running: true, stage: 0, key, version: data.version });
      timers = [1, 2, 3, 4].map(stage => scheduler.schedule(() => {
        if (!valid() || stage <= state.stage) return;
        if (stage === 4) { save(key, result); clear(); }
        publish({ running: stage < 4, stage, key, version: data.version, result, data });
      }, stage * 800));
    },
  };
}
export type AnalysisRun = ReturnType<typeof createAnalysisRun>;
export const browserScheduler: Scheduler = {
  schedule(callback, delay) {
    const timer = setTimeout(callback, delay);
    return () => clearTimeout(timer);
  },
};
