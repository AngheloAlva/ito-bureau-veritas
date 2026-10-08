import Link from 'next/link';
import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import type { Analysis, Data } from '@/domain/types';
import { Badge, date, Empty, Panel } from '@/components/records/presentation';

export function Sources({ ids, data }: { ids: string[]; data: Data }) {
  return <div className="flex flex-wrap items-center gap-3 text-xs"><span className="text-muted-foreground">Fuentes:</span>{ids.map(id => <Link key={id} className="record-link inline-flex min-h-10 items-center gap-2 rounded-md border px-3" href={id.startsWith('H-') ? `/hallazgos/${id}` : `/inspecciones/${id}`}>{id.startsWith('H-') ? id : data.inspections.find(inspection => inspection.id === id)?.code ?? id}<ArrowSquareOutIcon aria-hidden="true" size={14} /></Link>)}</div>;
}

export function AnalysisPriorities({ analysis, data }: { analysis: Analysis; data: Data }) {
  return (
    <Panel title="Prioridades justificadas" description={`${analysis.priorities.length} registros con fundamento y fuentes de origen.`}>
      {analysis.priorities.length ? <ol className="flex flex-col divide-y">{analysis.priorities.map((priority, index) => (
        <li key={priority.findingId} className="flex gap-4 py-5 first:pt-0">
          <span className="text-2xl font-semibold text-muted-foreground tabular-nums" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h3 className="text-base font-semibold"><Link className="record-link" href={`/hallazgos/${priority.findingId}`}>{priority.code} · {data.findings.find(finding => finding.id === priority.findingId)?.title}</Link></h3>
            <div className="flex flex-wrap gap-3"><Badge>{priority.state}</Badge><Badge>{priority.severity}</Badge><span className="text-xs text-muted-foreground">Plazo <time dateTime={priority.dueDate}>{date(priority.dueDate)}</time></span></div>
            <p className="font-semibold">{priority.reason}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{priority.suggestion}</p>
            <Sources ids={priority.sourceIds} data={data} />
          </div>
        </li>
      ))}</ol> : <Empty>Sin críticos activos ni vencidos en este alcance.</Empty>}
    </Panel>
  );
}

export function AnalysisConcentrations({ analysis, data }: { analysis: Analysis; data: Data }) {
  return (
    <Panel title="Concentración de pendientes" description="Hallazgos activos agrupados por proyecto y especialidad.">
      {analysis.concentrations.length ? <ul className="flex flex-col divide-y">{analysis.concentrations.map(concentration => <li key={concentration.projectId + concentration.specialty} className="flex flex-col gap-3 py-4 first:pt-0"><div className="flex justify-between gap-4"><h3 className="text-sm font-semibold">{data.projects.find(project => project.id === concentration.projectId)?.name}<span className="block font-normal text-muted-foreground">{concentration.specialty}</span></h3><span className="text-xl font-semibold tabular-nums">{concentration.count}<span className="block text-xs font-normal text-muted-foreground">activos</span></span></div><Sources ids={concentration.sourceIds} data={data} /></li>)}</ul> : <Empty>Sin pendientes.</Empty>}
    </Panel>
  );
}
