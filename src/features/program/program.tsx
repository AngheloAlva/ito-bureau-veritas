'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Heading } from '@/components/records/presentation';
import { PORTFOLIO } from '@/data/portfolio';
import { PROJECT_HEALTHS } from '@/domain/portfolio';
import { applyPortfolioFilter, ganttRows, parsePortfolioFilter, serializePortfolioFilter, HEALTH_TONE, type PortfolioFilter } from '@/lib/portfolio-analytics';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { GanttChart, GanttLegend, type GanttScale } from './gantt';

const ORDER = { Atrasado: 0, 'En curso': 1, Completado: 2 } as const;

export function Program() {
  const search = useSearchParams();
  const [scale, setScale] = useState<GanttScale>('mes');
  const [params, setParams] = useState<URLSearchParams | null>(null);
  const current = params ?? new URLSearchParams(search.toString());
  const filter = parsePortfolioFilter(current, PORTFOLIO);

  const update = (next: PortfolioFilter) => {
    const p = new URLSearchParams(current.toString());
    p.delete('estado'); p.delete('cliente');
    for (const [k, v] of Object.entries(serializePortfolioFilter({ health: next.health, clientId: next.clientId }))) p.set(k, v);
    setParams(p);
    const qs = p.toString();
    window.history.pushState(null, '', qs ? `?${qs}` : window.location.pathname);
  };

  const base = useMemo(() => applyPortfolioFilter(PORTFOLIO, { clientId: filter.clientId, projectId: filter.projectId }), [filter.clientId, filter.projectId]);
  const counts = useMemo(() => Object.fromEntries(PROJECT_HEALTHS.map(h => [h, base.projects.filter(p => p.health === h).length])), [base]);
  const rows = useMemo(() => {
    const view = applyPortfolioFilter(PORTFOLIO, filter);
    return ganttRows(view).sort((a, b) => ORDER[a.health] - ORDER[b.health] || a.plannedStart.localeCompare(b.plannedStart));
  }, [filter.health, filter.clientId, filter.projectId]); // eslint-disable-line react-hooks/exhaustive-deps
  const firstLate = rows.find(r => r.health === 'Atrasado')?.projectId;
  const initial = filter.projectId ? [filter.projectId] : firstLate ? [firstLate] : [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1"><Heading eyebrow="Cartera de proyectos · corte 08 oct 2026" title="Programa de trabajo" /></div>
      </div>
      <p className="text-sm text-muted-foreground">Planificado frente a real por proyecto e hito. Haga clic en un proyecto para ver sus hitos.</p>
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Filtrar por estado" className="inline-flex rounded-lg border bg-card p-0.5 shadow-xs">
          {([undefined, ...PROJECT_HEALTHS] as const).map(h => {
            const active = filter.health === h;
            const n = h ? counts[h] : base.projects.length;
            return (
              <button key={h ?? 'todos'} type="button" aria-pressed={active} onClick={() => update({ ...filter, health: h })}
                className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
                {h ? <span aria-hidden="true" className={cn('size-2 rounded-full', toneClasses(HEALTH_TONE[h]).solid)} /> : null}
                {h ?? 'Todos'} <span className="tabular-nums opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">Cliente
          <select value={filter.clientId ?? ''} onChange={e => update({ ...filter, clientId: e.target.value || undefined })}
            className="h-9 rounded-lg border bg-card px-2.5 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">Todos los clientes</option>
            {PORTFOLIO.clients.map(c => <option key={c.id} value={c.id}>{c.short} · {c.name}</option>)}
          </select>
        </label>
        <div role="group" aria-label="Escala" className="ml-auto inline-flex rounded-lg border bg-card p-0.5 shadow-xs">
          {(['mes', 'trimestre'] as const).map(s => (
            <button key={s} type="button" aria-pressed={scale === s} onClick={() => setScale(s)}
              className={cn('rounded-md px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring', scale === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
              {s === 'mes' ? 'Mes' : 'Trimestre'}
            </button>
          ))}
        </div>
      </div>
      {rows.length ? <GanttChart key={`${filter.health}-${filter.clientId}-${filter.projectId}`} rows={rows} scale={scale} initialExpanded={initial} /> : <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No hay proyectos con los filtros seleccionados.</p>}
      <GanttLegend />
    </>
  );
}
