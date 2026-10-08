import { REFERENCE_DATE } from './types.ts';
import type { Data } from './types.ts';

export interface MatrixCell { projectId: string; specialty: string; active: number; overdue: number }
export interface ConcentrationMatrix {
  projects: { id: string; code: string; name: string }[];
  specialties: string[];
  cells: MatrixCell[];
  max: number;
}

// Pure read-only count of active findings per project × specialty.
export function concentrationMatrix(data: Data, projectId?: string): ConcentrationMatrix {
  const map = new Map<string, MatrixCell>();
  for (const f of data.findings) {
    if (f.state === 'Cerrado') continue;
    const pid = data.inspections.find(i => i.id === f.inspectionId)?.projectId;
    if (!pid || (projectId && pid !== projectId)) continue;
    const key = pid + '|' + f.specialty;
    const cell = map.get(key) ?? { projectId: pid, specialty: f.specialty, active: 0, overdue: 0 };
    cell.active++;
    if (f.dueDate < REFERENCE_DATE) cell.overdue++;
    map.set(key, cell);
  }
  const cells = [...map.values()];
  const projects = data.projects.filter(p => !projectId || p.id === projectId).map(p => ({ id: p.id, code: p.code, name: p.name }));
  const specialties = [...new Set(cells.map(c => c.specialty))].sort((a, b) => a.localeCompare(b, 'es'));
  return { projects, specialties, cells, max: Math.max(0, ...cells.map(c => c.active)) };
}
