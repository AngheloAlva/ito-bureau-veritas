import { REFERENCE_DATE } from '../domain/types.ts';
import type { Data, Severity } from '../domain/types.ts';
import { indicators, isActive, isOverdue, scopedFindings } from '../domain/core.ts';
import type { Portfolio } from '../domain/portfolio.ts';
import {
  applyPortfolioFilter, clientBreakdown, milestoneDelay, portfolioKpis, problemProjects, progressCurve, serializePortfolioFilter,
} from './portfolio-analytics.ts';
import type { PortfolioFilter } from './portfolio-analytics.ts';
import type { Tone } from './tones.ts';

export type Intent = 'analysis' | 'summary' | 'risk' | 'severity' | 'milestones' | 'clients' | 'upcoming' | 'reminder';
export type MatchedIntent = Intent | 'unknown';

export const INTENT_PROMPTS: Record<Intent, string> = {
  analysis: 'Analizar registros y priorizar',
  summary: 'Resumen ejecutivo del mes',
  risk: '¿Qué proyectos están en riesgo?',
  severity: 'Hallazgos activos por severidad',
  milestones: '¿Cómo va el cumplimiento de hitos?',
  clients: 'Compare clientes por atraso',
  upcoming: 'Hitos que vencen en los próximos 15 días',
  reminder: 'Redacte un recordatorio para los responsables de hallazgos vencidos',
};

export type Series = { label: string; value: number; tone: Tone; href?: string };
type Linked = { dashboardHref?: string };
export type Artifact =
  | ({ kind: 'kpis'; items: { label: string; value: string; tone: Tone; hint: string }[] } & Linked)
  | ({ kind: 'bar'; title: string; orientation: 'vertical' | 'horizontal'; unit: string; series: Series[] } & Linked)
  | ({ kind: 'donut'; title: string; series: Omit<Series, 'href'>[] } & Linked)
  | ({ kind: 'line'; title: string; points: { label: string; planned: number; actual: number | null }[] } & Linked)
  | ({ kind: 'table'; title: string; columns: string[]; rows: { cells: string[]; href?: string }[] } & Linked)
  | ({ kind: 'draft'; title: string; body: string } & Linked);

export type AssistantContext = { data: Data; portfolio: Portfolio; scope: string };
export type Answer = { text: string; artifact?: Artifact; followUps: string[] };

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function matchIntent(text: string): MatchedIntent {
  const t = norm(text);
  if (!t) return 'unknown';
  if (/priori|analizar registros|analisis de registros/.test(t)) return 'analysis';
  if (/recordatorio|redact|correo|mensaje a los responsables/.test(t)) return 'reminder';
  if (/proxim|vencen|vencer|15 dias/.test(t)) return 'upcoming';
  if (/severidad|gravedad|criticos/.test(t)) return 'severity';
  if (/cliente/.test(t)) return 'clients';
  if (/riesgo|problema|en peligro/.test(t)) return 'risk';
  if (/resumen|ejecutivo|panorama|situacion general/.test(t)) return 'summary';
  if (/cumplimiento|hito|avance|curva|programa/.test(t)) return 'milestones';
  if (/hallazgo/.test(t)) return 'severity';
  if (/atraso|retraso/.test(t)) return 'clients';
  return 'unknown';
}

const ddmmyyyy = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function scopeFilter(scope: string): PortfolioFilter { return scope ? { projectId: scope } : {}; }
function href(filter: PortfolioFilter): string {
  const q = new URLSearchParams(serializePortfolioFilter(filter)).toString();
  return q ? `/tablero?${q}` : '/tablero';
}
function scopeName(ctx: AssistantContext): string {
  const p = ctx.portfolio.projects.find(x => x.id === ctx.scope);
  return ctx.scope && p ? `${p.code} · ${p.name}` : 'la cartera completa';
}
const delayTone = (d: number): Tone => (d > 30 ? 'red' : d > 15 ? 'orange' : 'amber');

const FOLLOW: Record<Intent, Intent[]> = {
  analysis: ['reminder', 'risk', 'summary'],
  summary: ['risk', 'severity', 'milestones'],
  risk: ['upcoming', 'clients', 'reminder'],
  severity: ['reminder', 'risk', 'summary'],
  milestones: ['upcoming', 'risk', 'clients'],
  clients: ['risk', 'milestones', 'summary'],
  upcoming: ['risk', 'reminder', 'milestones'],
  reminder: ['severity', 'summary', 'upcoming'],
};
const followUps = (i: Intent) => FOLLOW[i].map(k => INTENT_PROMPTS[k]);

export function buildAnswer(intent: MatchedIntent, ctx: AssistantContext): Answer {
  const view = applyPortfolioFilter(ctx.portfolio, scopeFilter(ctx.scope));
  const live = scopedFindings(ctx.data, ctx.scope || undefined);
  const name = scopeName(ctx);
  const baseFilter = scopeFilter(ctx.scope);

  switch (intent) {
    case 'analysis':
      // The deterministic run is executed by the chat view; this is the fallback text.
      return { text: `Analicé los registros de ${name} y prioricé lo que requiere atención.`, followUps: followUps('analysis') };
    case 'summary': {
      const k = portfolioKpis(view);
      const ind = indicators(ctx.data, ctx.scope || undefined);
      return {
        text: `En ${name} hay ${plural(k.projects, 'proyecto', 'proyectos')} y ${k.milestones} hitos; ${k.completionRate}% de los proyectos está completado y el avance promedio es ${k.avgProgress}%. Hay ${plural(k.delayedMilestones, 'hito atrasado', 'hitos atrasados')} y ${plural(ind.active, 'hallazgo activo', 'hallazgos activos')}, de los cuales ${ind.criticalActive} son críticos.`,
        artifact: {
          kind: 'kpis', dashboardHref: href(baseFilter),
          items: [
            { label: 'Proyectos', value: String(k.projects), tone: 'blue', hint: `${k.byHealth['En curso']} en curso` },
            { label: 'Completados', value: `${k.completionRate}%`, tone: 'green', hint: `${k.byHealth.Completado} de ${k.projects}` },
            { label: 'Hitos atrasados', value: String(k.delayedMilestones), tone: k.delayedMilestones ? 'red' : 'green', hint: `de ${k.milestones} hitos` },
            { label: 'Hallazgos activos', value: String(ind.active), tone: 'orange', hint: `${ind.overdue} vencidos` },
            { label: 'Críticos activos', value: String(ind.criticalActive), tone: ind.criticalActive ? 'red' : 'green', hint: 'severidad crítica' },
          ],
        },
        followUps: followUps('summary'),
      };
    }
    case 'risk': {
      const rows = problemProjects(view).filter(r => r.daysOpen > 0).slice(0, 6);
      const top = rows[0];
      return {
        text: rows.length
          ? `En ${name} hay ${plural(rows.length, 'proyecto con hito atrasado', 'proyectos con hitos atrasados')}. El mayor atraso es ${top.code} · ${top.name} con ${top.daysOpen} días (${top.problem.toLowerCase()}). Se recomienda priorizar la gestión con ${top.responsible}.`
          : `En ${name} no hay proyectos con hitos atrasados a la fecha de referencia (${ddmmyyyy(REFERENCE_DATE)}). Se sugiere vigilar los hitos con holgura menor a 5 días.`,
        artifact: rows.length ? {
          kind: 'bar', title: 'Días de atraso del hito más crítico por proyecto', orientation: 'horizontal', unit: 'd',
          dashboardHref: href({ ...baseFilter, health: 'Atrasado' }),
          series: rows.map(r => ({ label: r.code, value: r.daysOpen, tone: delayTone(r.daysOpen), href: href({ projectId: r.projectId }) })),
        } : undefined,
        followUps: followUps('risk'),
      };
    }
    case 'severity': {
      const active = live.filter(isActive);
      const order: Severity[] = ['Crítica', 'Alta', 'Media', 'Baja'];
      const tones: Record<Severity, Tone> = { Crítica: 'red', Alta: 'orange', Media: 'amber', Baja: 'slate' };
      const series = order.map(s => ({ label: s, value: active.filter(f => f.severity === s).length, tone: tones[s] }));
      const crit = series[0].value, alta = series[1].value;
      return {
        text: `En ${name} hay ${plural(active.length, 'hallazgo activo', 'hallazgos activos')}. ${crit} son de severidad crítica y ${alta} de severidad alta, que concentran ${active.length ? Math.round((crit + alta) / active.length * 100) : 0}% de los casos abiertos. ${live.filter(f => isOverdue(f)).length} ya superaron su plazo.`,
        artifact: { kind: 'donut', title: 'Hallazgos activos por severidad', series, dashboardHref: href(baseFilter) },
        followUps: followUps('severity'),
      };
    }
    case 'milestones': {
      const curve = progressCurve(view).filter(p => p.plannedCompleted > 0 || p.actualCompleted);
      const last = [...curve].reverse().find(p => p.actualCompleted !== null);
      const gap = last ? last.plannedCompleted - (last.actualCompleted ?? 0) : 0;
      const k = portfolioKpis(view);
      return {
        text: last
          ? `En ${name} se esperaba tener ${last.plannedCompleted} hitos cerrados a ${last.label} y hay ${last.actualCompleted}; ${gap > 0 ? `la desviación es de ${plural(gap, 'hito', 'hitos')} por debajo del programa` : 'el programa se cumple o se supera'}. ${k.onTimeMilestoneRate}% de los hitos está dentro de plazo.`
          : `No hay hitos programados para ${name}.`,
        artifact: curve.length ? {
          kind: 'line', title: 'Hitos cerrados acumulados: programado vs real', dashboardHref: href(baseFilter),
          points: curve.map(p => ({ label: p.label, planned: p.plannedCompleted, actual: p.actualCompleted })),
        } : undefined,
        followUps: followUps('milestones'),
      };
    }
    case 'clients': {
      const rows = clientBreakdown(view, ctx.portfolio.clients).filter(c => c.total > 0).sort((a, b) => b.avgDelayDays - a.avgDelayDays || a.short.localeCompare(b.short));
      const top = rows[0];
      return {
        text: top
          ? `Entre los clientes de ${name}, ${top.name} presenta el mayor atraso promedio con ${top.avgDelayDays} días en hitos abiertos vencidos. ${rows.filter(r => r.avgDelayDays === 0).length} de ${rows.length} clientes no tienen hitos vencidos.`
          : `No hay clientes con proyectos en ${name}.`,
        artifact: top ? {
          kind: 'bar', title: 'Atraso promedio por cliente (días)', orientation: 'horizontal', unit: 'd',
          dashboardHref: href(baseFilter),
          series: rows.map(r => ({ label: r.short, value: r.avgDelayDays, tone: r.avgDelayDays ? delayTone(r.avgDelayDays) : 'green', href: href({ clientId: r.clientId }) })),
        } : undefined,
        followUps: followUps('clients'),
      };
    }
    case 'upcoming': {
      const byId = new Map(view.projects.map(p => [p.id, p]));
      const ms = view.milestones.filter(m => !m.actualEnd && milestoneDelay(m) <= 0 && milestoneDelay(m) >= -15)
        .sort((a, b) => a.plannedEnd.localeCompare(b.plannedEnd) || a.id.localeCompare(b.id));
      return {
        text: ms.length
          ? `En ${name} hay ${plural(ms.length, 'hito que vence', 'hitos que vencen')} en los próximos 15 días desde el ${ddmmyyyy(REFERENCE_DATE)}. El primero es «${ms[0].name}» de ${byId.get(ms[0].projectId)?.code} el ${ddmmyyyy(ms[0].plannedEnd)}.`
          : `En ${name} no hay hitos que venzan en los próximos 15 días desde el ${ddmmyyyy(REFERENCE_DATE)}.`,
        artifact: ms.length ? {
          kind: 'table', title: 'Hitos con vencimiento en 15 días', columns: ['Proyecto', 'Hito', 'Fecha', 'Responsable'],
          dashboardHref: href(baseFilter),
          rows: ms.slice(0, 12).map(m => ({ cells: [byId.get(m.projectId)?.code ?? m.projectId, m.name, ddmmyyyy(m.plannedEnd), m.responsible], href: href({ projectId: m.projectId, milestoneId: m.id }) })),
        } : undefined,
        followUps: followUps('upcoming'),
      };
    }
    case 'reminder': {
      const over = live.filter(f => isOverdue(f)).sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.code.localeCompare(b.code));
      const user = (id: string) => ctx.data.users.find(u => u.id === id)?.name ?? 'Sin asignar';
      const names = [...new Set(over.map(f => user(f.responsibleId)))];
      const body = over.length
        ? [`Asunto: Recordatorio de hallazgos con plazo vencido (${ddmmyyyy(REFERENCE_DATE)})`, '',
          `Estimados ${names.join(', ')}:`, '',
          `Al ${ddmmyyyy(REFERENCE_DATE)} registramos ${plural(over.length, 'hallazgo vencido', 'hallazgos vencidos')} bajo su responsabilidad en ${name}:`, '',
          ...over.slice(0, 10).map(f => `- ${f.code} · ${f.title} (severidad ${f.severity}) — plazo ${ddmmyyyy(f.dueDate)} — ${user(f.responsibleId)}`),
          ...(over.length > 10 ? [`- … y ${over.length - 10} más`] : []), '',
          'Les solicitamos informar el avance de la corrección y adjuntar la evidencia correspondiente, o bien proponer una nueva fecha comprometida.', '',
          'Saludos cordiales,', 'Equipo de inspección técnica (ITO)'].join('\n')
        : `No hay hallazgos vencidos en ${name} al ${ddmmyyyy(REFERENCE_DATE)}; no es necesario enviar recordatorios.`;
      return {
        text: over.length
          ? `Redacté un recordatorio para ${plural(names.length, 'responsable', 'responsables')} con ${plural(over.length, 'hallazgo vencido', 'hallazgos vencidos')} en ${name}. Revise el texto y cópielo antes de enviarlo; el asistente no envía correos.`
          : `En ${name} no hay hallazgos vencidos al ${ddmmyyyy(REFERENCE_DATE)}, por lo que no se requiere un recordatorio.`,
        artifact: over.length ? { kind: 'draft', title: 'Borrador de recordatorio', body } : undefined,
        followUps: followUps('reminder'),
      };
    }
    default:
      return {
        text: 'No logré asociar su consulta con un análisis disponible. Puedo resumir la cartera, detectar riesgos, comparar clientes o redactar recordatorios. Pruebe con alguna de estas opciones.',
        followUps: (Object.keys(INTENT_PROMPTS) as Intent[]).slice(0, 4).map(k => INTENT_PROMPTS[k]),
      };
  }
}
