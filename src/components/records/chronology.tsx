'use client';

import { CalendarCheckIcon, ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { RecordLink } from '@/components/shared/record-preview';
import type { ReactNode } from 'react';
import { useDemo } from '@/components/demo-provider';
import { Badge, date, Empty, Panel, time } from './presentation';

export function ChronologyEvent({ at, actor, title, children }: { at: string; actor?: string; title: string; children?: ReactNode }) {
  return (
    <li className="relative flex flex-col gap-2 border-l-2 border-border pb-6 pl-5 last:pb-0 before:absolute before:-left-1 before:top-1 before:size-1.5 before:bg-muted-foreground">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><time dateTime={at} className="font-mono tabular-nums">{time(at)}</time>{actor ? <span>{actor}</span> : null}</div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </li>
  );
}

export function InspectionHistory({ inspectionId }: { inspectionId: string }) {
  const { data } = useDemo();
  const events = data.inspectionEvents.filter(event => event.inspectionId === inspectionId).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  return (
    <Panel title="Cronología de visita" description="Registro inalterable desde la interfaz · hora America/Santiago">
      {!events.some(event => event.type === 'creación') ? <Empty>Visita anterior al registro de historial: no hay actor ni fecha de creación registrados. No se reconstruyen eventos históricos.</Empty> : null}
      {events.length ? <ol className="ml-1">{events.map(event => <ChronologyEvent key={event.id} at={event.at} actor={data.users.find(user => user.id === event.actorId)?.name} title={`${event.type === 'creación' ? 'Creación de inspección' : 'Visita completada'} · ${event.previousState ?? 'Sin registro previo'} → ${event.newState}`}><p className="text-xs text-muted-foreground">{data.inspections.find(item => item.id === event.inspectionId)?.code}</p></ChronologyEvent>)}</ol> : null}
    </Panel>
  );
}

export function ProjectChronology({ projectId }: { projectId: string }) {
  const { data } = useDemo();
  const inspections = data.inspections.filter(inspection => inspection.projectId === projectId);
  const findings = data.findings.filter(finding => inspections.some(inspection => inspection.id === finding.inspectionId));
  const visits = data.inspectionEvents.filter(event => inspections.some(inspection => inspection.id === event.inspectionId)).map(event => ({ id: event.id, at: event.at, actorId: event.actorId, title: `${event.type === 'creación' ? 'Visita registrada' : 'Visita completada'} · ${inspections.find(inspection => inspection.id === event.inspectionId)?.code}`, kind: 'inspection' as const, recordId: event.inspectionId }));
  const corrections = data.events.filter(event => findings.some(finding => finding.id === event.findingId)).map(event => {
    const finding = findings.find(item => item.id === event.findingId)!;
    const visit = inspections.find(item => item.id === finding.inspectionId)!;
    return { id: event.id, at: event.at, actorId: event.actorId, title: `${visit.code} → ${finding.code} · ${event.type === 'transición' ? `${event.previousState} → ${event.newState}` : event.comment || event.type}`, kind: 'finding' as const, recordId: event.findingId };
  });
  const events = [...visits, ...corrections].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return (
    <Panel title="De la visita al cierre" description="Visita → hallazgo → corrección → verificación. Registros más recientes primero.">
      {inspections.length ? <ol className="flex flex-col gap-3">{[...inspections].sort((a, b) => b.date.localeCompare(a.date)).map(inspection => {
        const linked = findings.filter(finding => finding.inspectionId === inspection.id);
        return <li key={inspection.id} className="flex min-w-0 flex-col gap-2 rounded-sm border bg-muted/50 p-3">
          <RecordLink kind="inspection" id={inspection.id}><span className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarCheckIcon aria-hidden="true" />{inspection.code} · {date(inspection.date)}</span><span className="block mt-1">{inspection.activity}</span></RecordLink>
          <Badge>{inspection.visitState}</Badge>
          {linked.length ? <ul className="flex flex-col gap-2">{linked.map(finding => {
            const verification = data.events.filter(event => event.findingId === finding.id && event.type === 'transición' && event.previousState === 'Pendiente de verificación').sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];
            return (
              <li key={finding.id} className="flex min-w-0 flex-col gap-1 bg-card p-3 text-sm">
                <div className="flex flex-col items-start gap-2">
                  <RecordLink kind="finding" id={finding.id}><span className="font-mono text-xs tabular-nums text-muted-foreground">{finding.code} · </span>{finding.title}</RecordLink>
                  <div className="flex flex-wrap gap-1"><Badge>{finding.state}</Badge><Badge>{finding.severity}</Badge></div>
                </div>
                <details className="operational-disclosure">
                  <summary>Corrección y verificación · {finding.code}</summary>
                  <dl className="grid gap-3 border-l pl-3 pb-2 text-xs">
                  <div><dt className="font-medium">Corrección registrada</dt><dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{finding.correctiveAction || 'Sin registro.'}</dd></div>
                  <div><dt className="font-medium">Última verificación registrada</dt><dd className="mt-1 text-muted-foreground">{verification ? <><span className="block">{verification.newState} · {time(verification.at)}</span><span className="block">{data.users.find(user => user.id === verification.actorId)?.name}</span><span className="block whitespace-pre-wrap">{verification.comment}</span></> : 'Sin registro.'}</dd></div>
                  </dl>
                </details>
              </li>
            );
          })}</ul> : <p className="text-xs text-muted-foreground">Sin hallazgos asociados.</p>}
        </li>;
      })}</ol> : <Empty>No hay visitas registradas en este proyecto.</Empty>}
      <details className="operational-disclosure border-t">
        <summary><ClockCounterClockwiseIcon aria-hidden="true" className="mr-2 inline" />Últimos movimientos · {Math.min(8, events.length)} de {events.length}</summary>
      {events.length ? <ol className="ml-1">{events.slice(0, 8).map(event => <ChronologyEvent key={event.id} at={event.at} actor={data.users.find(user => user.id === event.actorId)?.name} title={event.title}><RecordLink kind={event.kind} id={event.recordId}>Consultar registro de origen →</RecordLink></ChronologyEvent>)}</ol> : <p className="text-xs text-muted-foreground">Sin movimientos registrados.</p>}
      {events.length > 8 ? <p className="text-xs text-muted-foreground">Mostrando 8 de {events.length} eventos. Consulte cada registro para ver su historial completo.</p> : null}
      </details>
    </Panel>
  );
}
