'use client';

import { useDemo } from '@/components/demo-provider';
import { time } from '@/components/records';
import { formatDatesInText } from '@/lib/format';
import { Panel } from '@/components/records/presentation';

const changeLabels: Record<string, string> = {
  state: 'Estado', responsibleId: 'Responsable', dueDate: 'Plazo',
  correctiveAction: 'Acción correctiva', evidenceId: 'Evidencia seleccionada',
};
export function FindingHistory({ findingId }: { findingId: string }) {
  const d = useDemo();
  return <Panel rule title="Cronología operacional" description="Hora America/Santiago">
    <ol className="finding-history text-sm break-words">
      {d.data.events.filter(e => e.findingId === findingId).map(event => <li key={event.id}>
        <div className="mb-1 flex flex-col gap-1 text-xs text-muted-foreground">
          <time className="tabular-nums" dateTime={event.at}>{time(event.at)}</time>
          <span>{d.data.users.find(u => u.id === event.actorId)?.name} · {event.type}</span>
        </div>
        {event.previousState !== event.newState ? <strong className="text-xs">{event.previousState} → {event.newState}</strong> : null}
        <p className="my-1">{event.comment}</p>
        {Object.entries(event.changes).filter(([key]) => !(key === 'state' && event.previousState !== event.newState)).map(([key, change]) => <small className="block text-xs text-muted-foreground" key={key}>
          {changeLabels[key] ?? key}: {key === 'responsibleId' ? d.data.users.find(u => u.id === change.before)?.name : (key === 'dueDate' ? formatDatesInText(change.before) : change.before) || 'Sin registro'} → {key === 'responsibleId' ? d.data.users.find(u => u.id === change.after)?.name : key === 'evidenceId' ?
            <a className="record-link" href={d.data.evidence.find(ev => ev.id === change.after)?.reference} target="_blank" rel="noreferrer">{d.data.evidence.find(ev => ev.id === change.after)?.name ?? change.after} ↗</a> : key === 'dueDate' ? formatDatesInText(change.after) : change.after}
        </small>)}
      </li>)}
    </ol>
  </Panel>;
}
