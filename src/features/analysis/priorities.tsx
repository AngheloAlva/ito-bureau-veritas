import type React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@phosphor-icons/react';
import type { Analysis, Data } from '@/domain/types';
import { Badge, date, Empty, Panel } from '@/components/records/presentation';

export function Sources({ ids, data }: { ids: string[]; data: Data }) {
  return <div className="flex flex-wrap items-center gap-3 text-xs"><span className="text-muted-foreground">Fuentes:</span>{ids.map(id => <Link key={id} className="record-link inline-flex min-h-10 items-center gap-2 rounded-md border px-3" href={id.startsWith('H-') ? `/hallazgos/${id}` : `/inspecciones/${id}`}>{id.startsWith('H-') ? id : data.inspections.find(inspection => inspection.id === id)?.code ?? id}<ArrowRightIcon aria-hidden="true" size={14} /></Link>)}</div>;
}

export function AnalysisPriorities({ analysis, data, animate = false }: { analysis: Analysis; data: Data; animate?: boolean }) {
  return (
    <Panel rule title="Prioridades justificadas" description={`${analysis.priorities.length} registros con fundamento y fuentes de origen.`}>
      {analysis.priorities.length ? <ol className="flex flex-col divide-y">{analysis.priorities.map((priority, index) => (
        <li key={priority.findingId} className={`flex gap-4 py-5 first:pt-0${animate ? ' analysis-enter' : ''}`} style={animate ? { '--i': index } as React.CSSProperties : undefined}>
          <span className="font-mono text-xl font-semibold text-muted-foreground tabular-nums" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h3 className="text-base font-semibold"><Link className="record-link" href={`/hallazgos/${priority.findingId}`}><span className="font-mono tabular-nums">{priority.code}</span> · {data.findings.find(finding => finding.id === priority.findingId)?.title}</Link></h3>
            <div className="flex flex-wrap gap-3"><Badge>{priority.state}</Badge><Badge>{priority.severity}</Badge><span className="text-xs text-muted-foreground">Plazo <time className="font-mono tabular-nums" dateTime={priority.dueDate}>{date(priority.dueDate)}</time></span></div>
            <p className="text-sm font-medium leading-relaxed">{priority.reason}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{priority.suggestion}</p>
            <Sources ids={priority.sourceIds} data={data} />
          </div>
        </li>
      ))}</ol> : <Empty>Sin críticos activos ni vencidos en este alcance.</Empty>}
    </Panel>
  );
}
