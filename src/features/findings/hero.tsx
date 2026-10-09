'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, WrenchIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Badge, date, time } from '@/components/records/presentation';
import { Button } from '@/components/ui/button';
import { isOverdue, transitionFinding } from '@/domain/core';
import { STATES, REFERENCE_DATE, type Finding, type Inspection, type Project } from '@/domain/types';
import { CorrectionForm as Correction } from './correction';
import { Verification } from './verification';
import { RecordLink } from '@/components/shared/record-preview';

function daysLate(due: string) {
  return Math.round((Date.parse(REFERENCE_DATE) - Date.parse(due)) / 86400000);
}

export function FindingHero({ finding: f, project: p, inspection: i, evidenceId, onEvidenceChange }: { finding: Finding; project: Project; inspection: Inspection; evidenceId: string; onEvidenceChange: (id: string) => void }) {
  const d = useDemo();
  const responsible = d.data.users.find(u => u.id === f.responsibleId)?.name;
  const current = STATES.indexOf(f.state);
  const overdue = isOverdue(f);

  const [editing, setEditing] = useState(false);
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  const hint = f.state === 'Abierto' ? `Responsable de la corrección: ${responsible}.`
    : f.state === 'En corrección' ? 'Para remitir: acción correctiva y evidencia de corrección.'
    : f.state === 'Pendiente de verificación' ? 'Para cerrar o devolver: comentario de verificación.' : '';
  const settle = () => { setEditing(false); requestAnimationFrame(() => statusRef.current?.focus()); };
  const start = () => d.run(() => d.apply(data => transitionFinding(data, f.id, d.user.id, 'En corrección', { action: f.correctiveAction, evidenceId: '', comment: '' })), 'Estado actualizado: En corrección.');

  return <section aria-label="Resumen del hallazgo" className="flex flex-col gap-4 rounded-sm border bg-card p-5 lg:p-6">
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs font-semibold tracking-wide text-muted-foreground tabular-nums">{f.code} · {p.code}</p>
      <h1 className="bv-title text-2xl font-semibold tracking-tight text-balance lg:text-3xl">{f.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{f.state}</Badge><Badge>{`Severidad ${f.severity}`}</Badge>{overdue ? <Badge>Vencido</Badge> : null}
      </div>
      <p className="text-sm text-muted-foreground">{f.location} · {f.specialty}</p>
      <p className="max-w-[70ch] leading-relaxed">{f.description}</p>
      <p className="text-xs text-muted-foreground">Detectado el {time(f.createdAt)}</p>
      <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-xs text-muted-foreground">Proyecto</dt><dd className="mt-0.5 font-medium"><Link className="record-link" href={`/proyectos/${p.id}`}>{p.name}</Link></dd></div>
        <div><dt className="text-xs text-muted-foreground">Visita de origen</dt><dd className="mt-0.5 font-medium"><RecordLink kind="inspection" id={i.id}><span className="font-mono tabular-nums">{i.code}</span> · <span className="font-mono tabular-nums">{date(i.date)}</span></RecordLink></dd></div>
        <div><dt className="text-xs text-muted-foreground">Responsable</dt><dd className="mt-0.5 font-medium">{responsible}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Fecha compromiso</dt><dd className="mt-0.5 font-medium"><span className="font-mono tabular-nums">{date(f.dueDate)}</span>{overdue ? <span className="text-destructive"> · Vencido hace {daysLate(f.dueDate)} d</span> : f.state === 'Cerrado' ? <span className="text-muted-foreground"> · Cerrado</span> : null}</dd></div>
      </dl>
    </div>
    <div className="flex flex-col gap-4 border-t pt-4">
      <ol aria-label="Etapas del hallazgo" className="grid min-w-0 grid-cols-4 gap-2 xl:flex xl:items-center xl:gap-0">
        {STATES.map((state, index) => {
          const done = index < current || f.state === 'Cerrado';
          const here = index === current && f.state !== 'Cerrado';
          return <li key={state} aria-current={here ? 'step' : undefined} className={`flex min-w-0 flex-col items-center gap-1.5 text-center text-xs xl:flex-row xl:text-left ${index < STATES.length - 1 ? 'xl:flex-1' : ''}`}>
            <span aria-hidden="true" className={`flex size-6 shrink-0 items-center justify-center rounded-full font-mono tabular-nums ${here ? 'bg-[var(--brand-blue)] text-white' : done ? 'bg-success-surface text-success' : 'bg-muted text-muted-foreground'}`}>{done ? <CheckIcon weight="bold" /> : index + 1}</span>
            <span className={here ? 'font-semibold text-foreground' : done ? 'text-foreground' : 'text-muted-foreground'}>{state}<span className="sr-only">{done ? ' (completado)' : here ? ' (etapa actual)' : ' (pendiente)'}</span></span>
            {index < STATES.length - 1 ? <span aria-hidden="true" className={`hidden h-px min-w-4 flex-1 xl:mx-3 xl:block ${done ? 'bg-[var(--brand-blue)]' : 'bg-border'}`} /> : null}
          </li>;
        })}
      </ol>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {f.state === 'Abierto' ? <Button type="button" className="min-h-11 bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue)]/90" onClick={start}><ArrowRightIcon data-icon="inline-start" />Iniciar corrección</Button> : null}
          {f.state === 'En corrección' && !editing ? <Button type="button" className="min-h-11 bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue)]/90" aria-expanded={false} aria-controls="finding-correction" onClick={() => setEditing(true)}><WrenchIcon data-icon="inline-start" />Preparar corrección</Button> : null}
          <p ref={statusRef} tabIndex={-1} className="text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">{f.state === 'Cerrado' ? 'Hallazgo cerrado: no hay acciones pendientes.' : hint}</p>
        </div>
        {f.state === 'En corrección' && editing ? <div id="finding-correction" className="max-w-2xl border-t pt-4"><Correction key={f.id} finding={f} evidenceId={evidenceId} onEvidenceChange={onEvidenceChange} onSaved={settle} /></div> : null}
        {f.state === 'Pendiente de verificación' ? <div className="max-w-2xl"><Verification key={f.id} finding={f} onSaved={settle} /></div> : null}
      </div>
    </div>
  </section>;
}
