import { REFERENCE_DATE } from '../domain/types.ts';
import { DURATION_BUCKETS, MILESTONE_SITUATIONS, PROJECT_HEALTHS } from '../domain/portfolio.ts';
import type {
  Client, DurationBucket, Milestone, MilestoneSituation, MilestoneStatus, Portfolio, PortfolioProject, ProjectHealth,
} from '../domain/portfolio.ts';

export type PortfolioView = Portfolio;
export type Tone = 'green' | 'blue' | 'red' | 'amber' | 'orange' | 'slate' | 'sky' | 'violet' | 'teal';

export const HEALTH_TONE: Record<ProjectHealth, Tone> = { Completado: 'green', 'En curso': 'blue', Atrasado: 'red' };
export const SITUATION_TONE: Record<MilestoneSituation, Tone> = {
  'Cerrado en plazo': 'green', 'Cerrado con atraso': 'violet', 'Holgura > 30 d': 'sky', 'Holgura 6–30 d': 'teal',
  'Holgura ≤ 5 d': 'amber', 'Atraso 1–15 d': 'orange', 'Atraso 16–30 d': 'red', 'Atraso > 30 d': 'red',
};

// ---- date math (UTC-safe, calendar dates) ----
const toUtc = (d: string) => { const [y, m, day] = d.split('-').map(Number); return Date.UTC(y, m - 1, day); };
const fromUtc = (t: number) => new Date(t).toISOString().slice(0, 10);
export function daysBetween(a: string, b: string): number { return Math.round((toUtc(b) - toUtc(a)) / 86400000); }
export function addDays(d: string, n: number): string { return fromUtc(toUtc(d) + n * 86400000); }

// ---- milestone metrics ----
export function milestoneDelay(m: Milestone, ref: string = REFERENCE_DATE): number {
  return daysBetween(m.plannedEnd, m.actualEnd ?? ref);
}
export function milestoneSituation(m: Milestone, ref: string = REFERENCE_DATE): MilestoneSituation {
  const d = milestoneDelay(m, ref);
  if (m.actualEnd) return d <= 0 ? 'Cerrado en plazo' : 'Cerrado con atraso';
  if (d > 30) return 'Atraso > 30 d';
  if (d > 15) return 'Atraso 16–30 d';
  if (d > 0) return 'Atraso 1–15 d';
  const slack = -d;
  if (slack <= 5) return 'Holgura ≤ 5 d';
  if (slack <= 30) return 'Holgura 6–30 d';
  return 'Holgura > 30 d';
}
export function milestoneDuration(m: Milestone, ref: string = REFERENCE_DATE): number {
  if (!m.actualStart && !m.actualEnd) return daysBetween(m.plannedStart, m.plannedEnd);
  return daysBetween(m.actualStart ?? m.plannedStart, m.actualEnd ?? ref);
}
export function durationBucket(days: number): DurationBucket {
  if (days <= 3) return '0–3 d';
  if (days <= 7) return '4–7 d';
  if (days <= 10) return '8–10 d';
  if (days <= 15) return '11–15 d';
  if (days <= 30) return '16–30 d';
  return '> 30 d';
}
const isOpenLate = (m: Milestone) => !m.actualEnd && m.plannedEnd < REFERENCE_DATE;

// ---- filter ----
export type PortfolioFilter = {
  health?: ProjectHealth; clientId?: string; situation?: MilestoneSituation; bucket?: DurationBucket;
  projectId?: string; milestoneId?: string;
};
export type FilterKey = keyof PortfolioFilter;
const FILTER_KEYS: FilterKey[] = ['health', 'clientId', 'situation', 'bucket', 'projectId', 'milestoneId'];

export function applyPortfolioFilter(portfolio: Portfolio, filter: PortfolioFilter): PortfolioView {
  let projects = portfolio.projects.filter(p =>
    (!filter.health || p.health === filter.health) &&
    (!filter.clientId || p.clientId === filter.clientId) &&
    (!filter.projectId || p.id === filter.projectId));
  const ids = new Set(projects.map(p => p.id));
  const milestones = portfolio.milestones.filter(m =>
    ids.has(m.projectId) &&
    (!filter.situation || milestoneSituation(m) === filter.situation) &&
    (!filter.bucket || durationBucket(milestoneDuration(m)) === filter.bucket) &&
    (!filter.milestoneId || m.id === filter.milestoneId));
  if (filter.situation || filter.bucket || filter.milestoneId) {
    const withMs = new Set(milestones.map(m => m.projectId));
    projects = projects.filter(p => withMs.has(p.id));
  }
  return { clients: portfolio.clients, projects, milestones };
}
export function omitKey(filter: PortfolioFilter, key: FilterKey): PortfolioFilter {
  const copy = { ...filter };
  delete copy[key];
  return copy;
}

const PARAM_KEYS: Record<FilterKey, string> = {
  health: 'estado', clientId: 'cliente', situation: 'situacion', bucket: 'tramo', projectId: 'proyecto', milestoneId: 'hito',
};
export function serializePortfolioFilter(filter: PortfolioFilter): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of FILTER_KEYS) { const v = filter[k]; if (v) out[PARAM_KEYS[k]] = v; }
  return out;
}
export function parsePortfolioFilter(
  params: URLSearchParams | Record<string, string | undefined>, portfolio: Portfolio,
): PortfolioFilter {
  const get = (k: string): string | undefined =>
    typeof (params as URLSearchParams).get === 'function' ? ((params as URLSearchParams).get(k) ?? undefined) : (params as Record<string, string | undefined>)[k];
  const f: PortfolioFilter = {};
  const health = get('estado'); if (health && (PROJECT_HEALTHS as readonly string[]).includes(health)) f.health = health as ProjectHealth;
  const cli = get('cliente'); if (cli && portfolio.clients.some(c => c.id === cli)) f.clientId = cli;
  const sit = get('situacion'); if (sit && (MILESTONE_SITUATIONS as readonly string[]).includes(sit)) f.situation = sit as MilestoneSituation;
  const bk = get('tramo'); if (bk && (DURATION_BUCKETS as readonly string[]).includes(bk)) f.bucket = bk as DurationBucket;
  const pr = get('proyecto'); if (pr && portfolio.projects.some(p => p.id === pr)) f.projectId = pr;
  const ms = get('hito'); if (ms && portfolio.milestones.some(m => m.id === ms)) f.milestoneId = ms;
  return f;
}
export function describeFilter(filter: PortfolioFilter, portfolio: Portfolio): { key: FilterKey; label: string }[] {
  const chips: { key: FilterKey; label: string }[] = [];
  if (filter.health) chips.push({ key: 'health', label: `Estado: ${filter.health}` });
  if (filter.clientId) chips.push({ key: 'clientId', label: `Cliente: ${portfolio.clients.find(c => c.id === filter.clientId)?.name ?? filter.clientId}` });
  if (filter.situation) chips.push({ key: 'situation', label: `Situación: ${filter.situation}` });
  if (filter.bucket) chips.push({ key: 'bucket', label: `Tiempo de ejecución: ${filter.bucket}` });
  if (filter.projectId) {
    const p = portfolio.projects.find(x => x.id === filter.projectId);
    chips.push({ key: 'projectId', label: `Proyecto: ${p ? `${p.code} · ${p.name}` : filter.projectId}` });
  }
  if (filter.milestoneId) {
    const m = portfolio.milestones.find(x => x.id === filter.milestoneId);
    chips.push({ key: 'milestoneId', label: `Hito: ${m ? `${m.seq} · ${m.name}` : filter.milestoneId}` });
  }
  return chips;
}

// ---- KPIs & distributions ----
export type PortfolioKpis = {
  projects: number; milestones: number; clients: number; byHealth: Record<ProjectHealth, number>;
  completionRate: number; avgProgress: number; delayedMilestones: number; onTimeMilestoneRate: number; budgetMusd: number;
};
export function portfolioKpis(view: PortfolioView): PortfolioKpis {
  const byHealth: Record<ProjectHealth, number> = { Completado: 0, 'En curso': 0, Atrasado: 0 };
  for (const p of view.projects) byHealth[p.health]++;
  const n = view.projects.length, mn = view.milestones.length;
  const bad = view.milestones.filter(m => { const s = milestoneSituation(m); return s === 'Cerrado con atraso' || s.startsWith('Atraso'); }).length;
  return {
    projects: n, milestones: mn, clients: new Set(view.projects.map(p => p.clientId)).size, byHealth,
    completionRate: n ? Math.round(byHealth.Completado / n * 100) : 0,
    avgProgress: n ? Math.round(view.projects.reduce((a, p) => a + p.progress, 0) / n) : 0,
    delayedMilestones: view.milestones.filter(isOpenLate).length,
    onTimeMilestoneRate: mn ? Math.round((mn - bad) / mn * 100) : 0,
    budgetMusd: Math.round(view.projects.reduce((a, p) => a + p.budgetMusd, 0) * 10) / 10,
  };
}
export function healthDistribution(view: PortfolioView): { health: ProjectHealth; count: number; tone: Tone }[] {
  return PROJECT_HEALTHS.map(h => ({ health: h, count: view.projects.filter(p => p.health === h).length, tone: HEALTH_TONE[h] }));
}
export function situationDistribution(view: PortfolioView): { situation: MilestoneSituation; count: number; tone: Tone }[] {
  const c = new Map<MilestoneSituation, number>();
  for (const m of view.milestones) { const s = milestoneSituation(m); c.set(s, (c.get(s) ?? 0) + 1); }
  return MILESTONE_SITUATIONS.map(s => ({ situation: s, count: c.get(s) ?? 0, tone: SITUATION_TONE[s] }));
}
export function durationHistogram(view: PortfolioView): { bucket: DurationBucket; count: number }[] {
  const c = new Map<DurationBucket, number>();
  for (const m of view.milestones) { const b = durationBucket(milestoneDuration(m)); c.set(b, (c.get(b) ?? 0) + 1); }
  return DURATION_BUCKETS.map(b => ({ bucket: b, count: c.get(b) ?? 0 }));
}
export type ClientRow = {
  clientId: string; name: string; short: string; total: number; byHealth: Record<ProjectHealth, number>; avgDelayDays: number;
};
export function clientBreakdown(view: PortfolioView, clients: Client[]): ClientRow[] {
  const rows = clients.map(c => {
    const ps = view.projects.filter(p => p.clientId === c.id);
    const byHealth: Record<ProjectHealth, number> = { Completado: 0, 'En curso': 0, Atrasado: 0 };
    for (const p of ps) byHealth[p.health]++;
    const ids = new Set(ps.map(p => p.id));
    const late = view.milestones.filter(m => ids.has(m.projectId) && isOpenLate(m)).map(m => milestoneDelay(m));
    return { clientId: c.id, name: c.name, short: c.short, total: ps.length, byHealth, avgDelayDays: late.length ? Math.round(late.reduce((a, b) => a + b, 0) / late.length) : 0 };
  });
  return rows.sort((a, b) => b.total - a.total);
}

// ---- decomposition tree ----
export type DecompositionDetail = {
  plannedEnd: string; ref: string; delay: number; responsible: string; note: string;
  projectId: string; milestoneId: string; projectName: string;
};
export type DecompositionNode = {
  id: string; level: 'root' | 'health' | 'situation' | 'milestone'; label: string; sublabel?: string; count: number;
  tone: Tone; filter: Partial<PortfolioFilter>; children?: DecompositionNode[]; detail?: DecompositionDetail;
};
export function decompositionTree(view: PortfolioView): DecompositionNode {
  const byId = new Map<string, PortfolioProject>(view.projects.map(p => [p.id, p]));
  const healthNodes: DecompositionNode[] = [];
  for (const h of PROJECT_HEALTHS) {
    const ps = view.projects.filter(p => p.health === h);
    if (!ps.length) continue;
    const ms = view.milestones.filter(m => byId.get(m.projectId)?.health === h);
    const sitNodes: DecompositionNode[] = [];
    for (const s of MILESTONE_SITUATIONS) {
      const sm = ms.filter(m => milestoneSituation(m) === s);
      if (!sm.length) continue;
      const top = [...sm].sort((a, b) => milestoneDelay(b) - milestoneDelay(a) || a.id.localeCompare(b.id)).slice(0, 8);
      sitNodes.push({
        id: `health:${h}/sit:${s}`, level: 'situation', label: s, count: sm.length, tone: SITUATION_TONE[s],
        filter: { health: h, situation: s },
        children: top.map(m => {
          const p = byId.get(m.projectId)!;
          return {
            id: `health:${h}/sit:${s}/ms:${m.id}`, level: 'milestone' as const, label: `Hito ${m.seq} · ${m.name}`,
            sublabel: `${p.code} · ${p.name}`, count: 1, tone: SITUATION_TONE[s], filter: { projectId: p.id, milestoneId: m.id },
            detail: { plannedEnd: m.plannedEnd, ref: REFERENCE_DATE, delay: milestoneDelay(m), responsible: m.responsible, note: m.note, projectId: p.id, milestoneId: m.id, projectName: p.name },
          };
        }),
      });
    }
    healthNodes.push({ id: `health:${h}`, level: 'health', label: h, count: ps.length, tone: HEALTH_TONE[h], filter: { health: h }, children: sitNodes });
  }
  return { id: 'root', level: 'root', label: 'Proyectos', count: view.projects.length, tone: 'slate', filter: {}, children: healthNodes };
}

// ---- problem projects ----
export type ProblemRow = {
  projectId: string; code: string; name: string; problem: string; daysOpen: number; responsible: string;
  clientShort: string; health: ProjectHealth; operational: boolean;
};
export function problemProjects(view: PortfolioView): ProblemRow[] {
  const rows: ProblemRow[] = [];
  for (const p of view.projects) {
    const ms = view.milestones.filter(m => m.projectId === p.id && !m.actualEnd);
    const late = ms.filter(isOpenLate).sort((a, b) => milestoneDelay(b) - milestoneDelay(a) || a.seq - b.seq)[0];
    const risk = ms.filter(m => milestoneSituation(m) === 'Holgura ≤ 5 d').sort((a, b) => milestoneDelay(b) - milestoneDelay(a) || a.seq - b.seq)[0];
    const short = view.clients.find(c => c.id === p.clientId)?.short ?? '';
    const base = { projectId: p.id, code: p.code, name: p.name, clientShort: short, health: p.health, operational: p.operational };
    if (late) {
      rows.push({ ...base, problem: `Hito «${late.name}» con ${milestoneDelay(late)} d de atraso`, daysOpen: milestoneDelay(late), responsible: late.responsible });
    } else if (risk) {
      const s = -milestoneDelay(risk);
      rows.push({ ...base, problem: `Hito «${risk.name}» ${s === 0 ? 'vence hoy' : `vence en ${s} d`}`, daysOpen: 0, responsible: risk.responsible });
    }
  }
  return rows.sort((a, b) => b.daysOpen - a.daysOpen || a.code.localeCompare(b.code));
}

// ---- progress curve ----
const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export type CurvePoint = { month: string; label: string; plannedCompleted: number; actualCompleted: number | null };
export function progressCurve(view: PortfolioView): CurvePoint[] {
  const out: CurvePoint[] = [];
  const refMonth = REFERENCE_DATE.slice(0, 7);
  for (let i = 0; i < 22; i++) {
    const y = 2025 + Math.floor((2 + i) / 12), mo = (2 + i) % 12;
    const month = `${y}-${String(mo + 1).padStart(2, '0')}`;
    const end = `${month}-31`; // lexicographic upper bound for any day of the month
    out.push({
      month, label: `${MONTH_NAMES[mo]} ${String(y).slice(2)}`,
      plannedCompleted: view.milestones.filter(m => m.plannedEnd <= end).length,
      actualCompleted: month > refMonth ? null : view.milestones.filter(m => m.actualEnd && m.actualEnd <= end).length,
    });
  }
  return out;
}

// ---- gantt ----
export type GanttMilestone = {
  id: string; seq: number; name: string; plannedStart: string; plannedEnd: string; actualStart?: string; actualEnd?: string;
  status: MilestoneStatus; responsible: string;
};
export type GanttRow = {
  projectId: string; code: string; name: string; health: ProjectHealth; clientShort: string;
  plannedStart: string; plannedEnd: string; actualStart: string; actualEnd?: string; progress: number; milestones: GanttMilestone[];
};
export function ganttRows(view: PortfolioView): GanttRow[] {
  return view.projects.map(p => {
    const ms = view.milestones.filter(m => m.projectId === p.id).sort((a, b) => a.seq - b.seq);
    const starts = ms.map(m => m.actualStart ?? m.plannedStart).sort();
    return {
      projectId: p.id, code: p.code, name: p.name, health: p.health,
      clientShort: view.clients.find(c => c.id === p.clientId)?.short ?? '',
      plannedStart: p.startDate, plannedEnd: p.plannedEndDate, actualStart: starts[0] ?? p.startDate, actualEnd: p.actualEndDate,
      progress: p.progress,
      milestones: ms.map(m => ({ id: m.id, seq: m.seq, name: m.name, plannedStart: m.plannedStart, plannedEnd: m.plannedEnd, actualStart: m.actualStart, actualEnd: m.actualEnd, status: m.status, responsible: m.responsible })),
    };
  }).sort((a, b) => a.plannedStart.localeCompare(b.plannedStart) || a.code.localeCompare(b.code));
}
