import { DURATION_BUCKETS, MILESTONE_SITUATIONS, PROJECT_HEALTHS } from '../domain/portfolio.ts';
import type { Milestone, PortfolioProject } from '../domain/portfolio.ts';
import {
  durationBucket, HEALTH_TONE, milestoneDelay, milestoneDuration, milestoneSituation, SITUATION_TONE,
} from './portfolio-analytics.ts';
import type { PortfolioFilter, PortfolioView, Tone } from './portfolio-analytics.ts';
import { REFERENCE_DATE } from '../domain/types.ts';
import type { Artifact } from './assistant-intents.ts';

export const METRICS = [
  { id: 'projects', label: 'Proyectos', unit: '' },
  { id: 'milestones', label: 'Hitos', unit: '' },
  { id: 'delayedMilestones', label: 'Hitos atrasados', unit: '' },
  { id: 'avgDelay', label: 'Atraso promedio', unit: 'd' },
  { id: 'avgProgress', label: 'Avance físico promedio', unit: '%' },
  { id: 'budget', label: 'Presupuesto', unit: 'MUSD' },
] as const;
export const DIMENSIONS = [
  { id: 'health', label: 'Estado', by: 'estado' },
  { id: 'client', label: 'Cliente', by: 'cliente' },
  { id: 'situation', label: 'Situación del hito', by: 'situación del hito' },
  { id: 'bucket', label: 'Tramo de duración', by: 'tramo de duración' },
  { id: 'specialty', label: 'Especialidad', by: 'especialidad' },
  { id: 'manager', label: 'Jefe de proyecto', by: 'jefe de proyecto' },
  { id: 'plannedEndMonth', label: 'Mes de término planificado', by: 'mes de término planificado' },
] as const;
export const CHART_TYPES = [
  { id: 'bar', label: 'Barras' }, { id: 'hbar', label: 'Barras horizontales' },
  { id: 'donut', label: 'Dona' }, { id: 'line', label: 'Línea' },
] as const;

export type MetricId = (typeof METRICS)[number]['id'];
export type DimensionId = (typeof DIMENSIONS)[number]['id'];
export type ChartTypeId = (typeof CHART_TYPES)[number]['id'];
export type MetricSpec = { metric: MetricId; dimension: DimensionId };
export type ChartSpec = MetricSpec & { chart: ChartTypeId };
export type DataPoint = { key: string; label: string; value: number; tone?: Tone; filter?: Partial<PortfolioFilter> };

const MILESTONE_DIMS: DimensionId[] = ['situation', 'bucket'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const monthLabel = (k: string) => `${MONTHS[Number(k.slice(5, 7)) - 1]} ${k.slice(2, 4)}`;
const isOpenLate = (m: Milestone) => !m.actualEnd && m.plannedEnd < REFERENCE_DATE;
const round1 = (n: number) => Math.round(n * 10) / 10;

type Group = { key: string; label: string; tone?: Tone; filter?: Partial<PortfolioFilter>; projects: Map<string, PortfolioProject>; milestones: Milestone[] };

function projectKey(dim: DimensionId, p: PortfolioProject, view: PortfolioView): Omit<Group, 'projects' | 'milestones'> {
  switch (dim) {
    case 'health': return { key: p.health, label: p.health, tone: HEALTH_TONE[p.health], filter: { health: p.health } };
    case 'client': return { key: p.clientId, label: view.clients.find(c => c.id === p.clientId)?.short ?? p.clientId, filter: { clientId: p.clientId } };
    case 'specialty': return { key: p.specialty, label: p.specialty };
    case 'manager': return { key: p.manager, label: p.manager };
    default: { const k = p.plannedEndDate.slice(0, 7); return { key: k, label: monthLabel(k) }; }
  }
}

function metricValue(metric: MetricId, g: Group): number {
  const ps = [...g.projects.values()];
  switch (metric) {
    case 'projects': return ps.length;
    case 'milestones': return g.milestones.length;
    case 'delayedMilestones': return g.milestones.filter(isOpenLate).length;
    case 'avgDelay': {
      const d = g.milestones.filter(isOpenLate).map(m => milestoneDelay(m));
      return d.length ? Math.round(d.reduce((a, b) => a + b, 0) / d.length) : 0;
    }
    case 'avgProgress': return ps.length ? Math.round(ps.reduce((a, p) => a + p.progress, 0) / ps.length) : 0;
    case 'budget': return round1(ps.reduce((a, p) => a + p.budgetMusd, 0));
  }
}

export function aggregate(view: PortfolioView, spec: MetricSpec): DataPoint[] {
  const { metric, dimension } = spec;
  const groups = new Map<string, Group>();
  const byId = new Map(view.projects.map(p => [p.id, p]));
  const ensure = (base: Omit<Group, 'projects' | 'milestones'>) => {
    let g = groups.get(base.key);
    if (!g) { g = { ...base, projects: new Map(), milestones: [] }; groups.set(base.key, g); }
    return g;
  };
  if (MILESTONE_DIMS.includes(dimension)) {
    for (const m of view.milestones) {
      const p = byId.get(m.projectId);
      const key = dimension === 'situation' ? milestoneSituation(m) : durationBucket(milestoneDuration(m));
      const g = ensure(dimension === 'situation'
        ? { key, label: key, tone: SITUATION_TONE[key as keyof typeof SITUATION_TONE], filter: { situation: key as PortfolioFilter['situation'] } }
        : { key, label: key, filter: { bucket: key as PortfolioFilter['bucket'] } });
      g.milestones.push(m);
      if (p) g.projects.set(p.id, p);
    }
  } else {
    for (const p of view.projects) ensure(projectKey(dimension, p, view)).projects.set(p.id, p);
    for (const m of view.milestones) { const p = byId.get(m.projectId); if (p) groups.get(projectKey(dimension, p, view).key)?.milestones.push(m); }
  }
  const fixed: readonly string[] | null = dimension === 'health' ? PROJECT_HEALTHS : dimension === 'situation' ? MILESTONE_SITUATIONS : dimension === 'bucket' ? DURATION_BUCKETS : null;
  if (fixed) {
    if (view.projects.length === 0 && view.milestones.length === 0) {
      return fixed.map(k => ({ key: k, label: k, value: 0, ...(dimension === 'health' ? { tone: HEALTH_TONE[k as keyof typeof HEALTH_TONE] } : dimension === 'situation' ? { tone: SITUATION_TONE[k as keyof typeof SITUATION_TONE] } : {}) }));
    }
    return fixed.map(k => {
      const g = groups.get(k);
      if (g) return { key: g.key, label: g.label, value: metricValue(metric, g), tone: g.tone, filter: g.filter };
      const filter = dimension === 'health' ? { health: k as PortfolioFilter['health'] } : dimension === 'situation' ? { situation: k as PortfolioFilter['situation'] } : { bucket: k as PortfolioFilter['bucket'] };
      return { key: k, label: k, value: 0, tone: dimension === 'health' ? HEALTH_TONE[k as keyof typeof HEALTH_TONE] : dimension === 'situation' ? SITUATION_TONE[k as keyof typeof SITUATION_TONE] : undefined, filter };
    });
  }
  const rows: DataPoint[] = [...groups.values()].map(g => ({ key: g.key, label: g.label, value: metricValue(metric, g), tone: g.tone, filter: g.filter }));
  if (dimension === 'plannedEndMonth') return rows.sort((a, b) => a.key.localeCompare(b.key));
  return rows.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

export function isCompatible(spec: ChartSpec): { ok: true } | { ok: false; reason: string } {
  if (spec.chart === 'donut' && (spec.metric === 'avgDelay' || spec.metric === 'avgProgress')) {
    return { ok: false, reason: 'La dona solo admite totales; use barras o línea para promedios.' };
  }
  return { ok: true };
}

export function describeSpec(spec: MetricSpec): string {
  const m = METRICS.find(x => x.id === spec.metric)!.label;
  const d = DIMENSIONS.find(x => x.id === spec.dimension)!.by;
  return `${m} por ${d}`;
}
export const metricUnit = (id: MetricId): string => METRICS.find(x => x.id === id)?.unit ?? '';

export type SnapshotArtifact = Extract<Artifact, { kind: 'bar' | 'donut' | 'line' }>;
export type CustomChart =
  | { id: string; title: string; spec: ChartSpec; createdAt: string; kind?: undefined }
  | { id: string; title: string; kind: 'snapshot'; source: 'asistente'; artifact: SnapshotArtifact; createdAt: string };

export const CUSTOM_CHARTS_KEY = 'ito-dashboard:custom-charts:v1';
export const MAX_CUSTOM_CHARTS = 12;
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const has = <T extends readonly { id: string }[]>(list: T, v: unknown) => typeof v === 'string' && list.some(x => x.id === v);
function valid(c: unknown): c is CustomChart {
  if (!c || typeof c !== 'object') return false;
  const o = c as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.title !== 'string' || typeof o.createdAt !== 'string') return false;
  if (o.kind === 'snapshot') {
    const a = o.artifact as { kind?: unknown } | undefined;
    return o.source === 'asistente' && !!a && (a.kind === 'bar' || a.kind === 'donut' || a.kind === 'line');
  }
  const s = o.spec as Record<string, unknown> | undefined;
  return !!s && has(METRICS, s.metric) && has(DIMENSIONS, s.dimension) && has(CHART_TYPES, s.chart);
}

export function loadCustomCharts(storage: StorageLike | null | undefined): CustomChart[] {
  try {
    const raw = storage?.getItem(CUSTOM_CHARTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(valid) ? parsed.slice(0, MAX_CUSTOM_CHARTS) : [];
  } catch { return []; }
}
export function saveCustomCharts(storage: StorageLike | null | undefined, list: CustomChart[]): void {
  try { storage?.setItem(CUSTOM_CHARTS_KEY, JSON.stringify(list.slice(0, MAX_CUSTOM_CHARTS))); } catch { /* quota or privacy mode */ }
}
