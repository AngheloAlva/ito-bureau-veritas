'use client';

import Link from 'next/link';
import { ArrowRightIcon, CheckIcon } from '@phosphor-icons/react';
import { Panel } from '@/components/records/presentation';
import { PORTFOLIO } from '@/data/portfolio';
import { REFERENCE_DATE } from '@/domain/types';
import { applyPortfolioFilter, daysBetween, ganttRows, type GanttMilestone } from '@/lib/portfolio-analytics';
import { cn } from '@/lib/utils';
import { fmtDate, GanttChart, GanttLegend } from '../program/gantt';

function sublabel(m: GanttMilestone): string {
  if (m.status === 'Atrasado') return `${Math.max(1, daysBetween(m.plannedEnd, m.actualEnd ?? REFERENCE_DATE))} d de atraso`;
  return `${Math.max(0, daysBetween(m.actualStart ?? m.plannedStart, REFERENCE_DATE))} d en curso`;
}

export function ProjectMilestones({ projectId }: { projectId: string }) {
  const rows = ganttRows(applyPortfolioFilter(PORTFOLIO, { projectId }));
  const row = rows[0];
  if (!row || !row.milestones.length) return null;
  const ms = row.milestones;
  const current = ms.find(m => m.status === 'En curso' || m.status === 'Atrasado');
  const done = ms.filter(m => m.status === 'Completado').length;

  return (
    <Panel title="Hitos del proyecto" description={`${done} de ${ms.length} hitos completados · avance ${row.progress}% · corte 08 oct 2026`}>
      <div className="flex flex-col gap-5">
        <ol aria-label="Línea de hitos" className="flex gap-0 overflow-x-auto pb-2">
          {ms.map((m, i) => {
            const isCurrent = m === current;
            const late = m.status === 'Atrasado';
            const isDone = m.status === 'Completado';
            return (
              <li key={m.id} className="relative flex min-w-[104px] flex-1 flex-col items-center gap-1.5 px-1 text-center" aria-current={isCurrent ? 'step' : undefined}>
                {i > 0 ? <span aria-hidden="true" className={cn('absolute top-[13px] right-1/2 h-0.5 w-full', ms[i - 1].status === 'Completado' ? 'bg-tone-green-solid' : 'bg-border')} /> : null}
                <span className="relative z-10 flex size-7 items-center justify-center">
                  {isCurrent ? <span aria-hidden="true" className={cn('absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping', late ? 'bg-tone-red-solid' : 'bg-tone-blue-solid')} /> : null}
                  {isDone ? <span className="flex size-6 items-center justify-center rounded-full bg-tone-green-solid text-white"><CheckIcon aria-hidden="true" weight="bold" className="size-3.5" /></span>
                    : isCurrent ? <span className={cn('size-6 rounded-full border-[3px] bg-card', late ? 'border-tone-red-solid' : 'border-tone-blue-solid')} />
                    : <span className="size-3 rounded-full bg-tone-slate-solid/40" />}
                </span>
                <span className="line-clamp-2 text-xs leading-tight font-medium" title={m.name}>{m.name}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">{fmtDate(m.actualEnd ?? m.plannedEnd)}</span>
                <span className={cn('text-[11px] font-medium', isCurrent ? (late ? 'text-tone-red-fg' : 'text-tone-blue-fg') : 'text-muted-foreground')}>
                  {isCurrent ? sublabel(m) : isDone ? 'Completado' : 'Pendiente'}
                </span>
              </li>
            );
          })}
        </ol>
        <GanttChart rows={rows} scale="mes" expandable={false} initialExpanded={[projectId]} label="Programa de hitos del proyecto" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <GanttLegend />
          <Link className="record-link inline-flex items-center gap-1 text-sm" href={`/programa?proyecto=${projectId}`}>Ver programa completo <ArrowRightIcon aria-hidden="true" className="size-3.5" /></Link>
        </div>
      </div>
    </Panel>
  );
}
