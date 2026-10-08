'use client';

import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, UserSwitchIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Badge, date } from '@/components/records/presentation';
import { Button } from '@/components/ui/button';
import { isOverdue } from '@/domain/core';
import { STATES, REFERENCE_DATE, type Finding, type Inspection, type Project } from '@/domain/types';
import { primaryActionFor } from '@/lib/finding-actions';
import { RecordLink } from '@/components/shared/record-preview';

function daysLate(due: string) {
  return Math.round((Date.parse(REFERENCE_DATE) - Date.parse(due)) / 86400000);
}

export function FindingHero({ finding: f, project: p, inspection: i }: { finding: Finding; project: Project; inspection: Inspection }) {
  const d = useDemo();
  const responsible = d.data.users.find(u => u.id === f.responsibleId)?.name;
  const current = STATES.indexOf(f.state);
  const action = primaryActionFor(d.data, f, d.user.id);
  const actor = action ? d.data.users.find(u => u.id === action.actorId) : null;
  const overdue = isOverdue(f);

  function run() {
    const target = document.querySelector<HTMLElement>('#finding-workflow [data-workflow-action]');
    target?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    target?.click();
  }

  return <section aria-label="Resumen del hallazgo" className="flex flex-col gap-5 rounded-sm border bg-card p-5 lg:p-6">
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs font-semibold tracking-wide text-muted-foreground tabular-nums">{f.code} · {p.code}</p>
      <h1 className="bv-title text-2xl font-semibold tracking-tight text-balance lg:text-3xl">{f.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{f.state}</Badge><Badge>{`Severidad ${f.severity}`}</Badge>{overdue ? <Badge>Vencido</Badge> : null}
      </div>
      <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-xs text-muted-foreground">Proyecto</dt><dd className="mt-0.5 font-medium"><Link className="record-link" href={`/proyectos/${p.id}`}>{p.name}</Link></dd></div>
        <div><dt className="text-xs text-muted-foreground">Visita de origen</dt><dd className="mt-0.5 font-medium"><RecordLink kind="inspection" id={i.id}><span className="font-mono tabular-nums">{i.code}</span> · <span className="font-mono tabular-nums">{date(i.date)}</span></RecordLink></dd></div>
        <div><dt className="text-xs text-muted-foreground">Responsable</dt><dd className="mt-0.5 font-medium">{responsible}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Fecha compromiso</dt><dd className="mt-0.5 font-medium"><span className="font-mono tabular-nums">{date(f.dueDate)}</span>{overdue ? <span className="text-destructive"> · Vencido hace {daysLate(f.dueDate)} d</span> : f.state === 'Cerrado' ? <span className="text-muted-foreground"> · Cerrado</span> : null}</dd></div>
      </dl>
    </div>
    <div className="flex flex-col gap-4 border-t pt-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      <ol aria-label="Etapas del hallazgo" className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
        {STATES.map((state, index) => {
          const done = index < current || f.state === 'Cerrado';
          const here = index === current && f.state !== 'Cerrado';
          return <li key={state} aria-current={here ? 'step' : undefined} className={`flex min-w-0 items-center gap-2 text-xs ${index < STATES.length - 1 ? 'sm:flex-1' : ''}`}>
            <span aria-hidden="true" className={`flex size-6 shrink-0 items-center justify-center rounded-full font-mono tabular-nums ${here ? 'bg-[var(--brand-blue)] text-white' : done ? 'bg-success-surface text-success' : 'bg-muted text-muted-foreground'}`}>{done ? <CheckIcon weight="bold" /> : index + 1}</span>
            <span className={here ? 'font-semibold text-foreground' : done ? 'text-foreground' : 'text-muted-foreground'}>{state}<span className="sr-only">{done ? ' (completado)' : here ? ' (etapa actual)' : ' (pendiente)'}</span></span>
            {index < STATES.length - 1 ? <span aria-hidden="true" className={`hidden h-px min-w-4 flex-1 sm:mx-3 sm:block ${done ? 'bg-[var(--brand-blue)]' : 'bg-border'}`} /> : null}
          </li>;
        })}
      </ol>
      <div className="flex shrink-0 flex-col gap-2 lg:items-end">
        {action?.canAct ? <Button type="button" className="min-h-11 bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue)]/90" onClick={run}><ArrowRightIcon data-icon="inline-start" />{action.label}</Button>
          : action && actor ? <div className="flex flex-col gap-2 text-sm lg:items-end">
            <p className="text-muted-foreground">Acción disponible para: <span className="font-medium text-foreground">{action.requiredRole} ({actor.name})</span></p>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => d.selectUser(actor.id)}><UserSwitchIcon data-icon="inline-start" />Cambiar a {action.requiredRole}</Button>
          </div>
          : <p className="text-sm text-muted-foreground">Hallazgo cerrado: no hay acciones pendientes.</p>}
      </div>
    </div>
  </section>;
}
