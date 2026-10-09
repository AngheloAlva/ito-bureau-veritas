import { isActive, isOverdue } from '../domain/core.ts';
import type { Data, Finding } from '../domain/types.ts';

export type SiteComponentKind = 'pump' | 'tank' | 'valve' | 'gauge' | 'pipeline' | 'gallery';
export type SiteComponent = { id: string; label: string; projectId: string; kind: SiteComponentKind; name: string };
export type ComponentStatus = 'critical' | 'warning' | 'ok';

export const SITE_COMPONENTS: readonly SiteComponent[] = [
  { id: 'j101', label: 'J-101', name: 'Bomba J-101', projectId: 'p1', kind: 'pump' },
  { id: 'j102', label: 'J-102', name: 'Bomba J-102', projectId: 'p1', kind: 'pump' },
  { id: 'j103', label: 'J-103', name: 'Bomba J-103', projectId: 'p1', kind: 'pump' },
  { id: 'tk101', label: 'TK-101', name: 'Estanque TK-101', projectId: 'p1', kind: 'tank' },
  { id: 'v301', label: 'V-301', name: 'Válvula V-301', projectId: 'p3', kind: 'valve' },
  { id: 'v302', label: 'V-302', name: 'Válvula V-302', projectId: 'p3', kind: 'valve' },
  { id: 'pi310', label: 'PI-310', name: 'Manómetro PI-310', projectId: 'p3', kind: 'gauge' },
  { id: 'pl300', label: 'PL-300', name: 'Línea de conducción PL-300', projectId: 'p3', kind: 'pipeline' },
  { id: 'gal201', label: 'GAL-201', name: 'Galería de servicios GAL-201', projectId: 'p2', kind: 'gallery' },
];

/** Active findings of a project in inspection order, then finding order. */
function projectActiveFindings(data: Data, projectId: string): Finding[] {
  const order = new Map<string, number>();
  data.inspections.forEach((i, idx) => { if (i.projectId === projectId) order.set(i.id, idx); });
  return data.findings
    .map((f, idx) => ({ f, idx, o: order.get(f.inspectionId) }))
    .filter((x): x is { f: Finding; idx: number; o: number } => x.o !== undefined && isActive(x.f))
    .sort((a, b) => a.o - b.o || a.idx - b.idx)
    .map(x => x.f);
}

export function componentFindings(data: Data, componentId: string): Finding[] {
  const component = SITE_COMPONENTS.find(c => c.id === componentId);
  if (!component) return [];
  const siblings = SITE_COMPONENTS.filter(c => c.projectId === component.projectId);
  const slot = siblings.findIndex(c => c.id === componentId);
  return projectActiveFindings(data, component.projectId).filter((_, n) => n % siblings.length === slot);
}

export function componentStatus(data: Data, componentId: string): ComponentStatus {
  const fs = componentFindings(data, componentId);
  if (fs.some(f => f.severity === 'Crítica')) return 'critical';
  if (fs.some(f => f.severity === 'Alta' || isOverdue(f))) return 'warning';
  return 'ok';
}
