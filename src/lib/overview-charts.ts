import { STATES } from '../domain/types.ts';
import type { Data, State } from '../domain/types.ts';

export const easeOutCubic = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;

/** Integer shown at `progress` (0..1, clamped) of a count-up toward `target`. */
export const countUpValue = (target: number, progress: number) =>
  Math.round(target * easeOutCubic(progress));

export function lifecycleSteps(byState: Record<string, number>): { state: State; count: number }[] {
  return STATES.map(state => ({ state, count: byState[state] ?? 0 }));
}

/** Active (not Cerrado) vs closed findings per project, from current data. */
export function projectBreakdown(data: Data, projectId?: string) {
  return data.projects.filter(p => !projectId || p.id === projectId).map(project => {
    const own = data.findings.filter(f => data.inspections.find(i => i.id === f.inspectionId)?.projectId === project.id);
    const closed = own.filter(f => f.state === 'Cerrado').length;
    return { id: project.id, code: project.code, name: project.name, active: own.length - closed, closed };
  });
}
