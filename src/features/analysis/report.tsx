import Link from 'next/link';
import type { Analysis } from '@/domain/types';
import { draftReport } from '@/domain/core';
import { Panel, time } from '@/components/records/presentation';

export function AnalysisReport({ analysis, scope, stale }: { analysis: Analysis; scope: string; stale: boolean }) {
  return (
    <section className="analysis-report" aria-label="Borrador de informe">
      <Panel title={`Informe operacional — ${scope}`} description="BORRADOR · REVISIÓN PROFESIONAL REQUERIDA">
        <p className="text-xs text-muted-foreground">Referencia: 08/10/2026 · generado {time(analysis.generatedAt)} · datos v{analysis.dataVersion}{stale ? ' · DESACTUALIZADO' : ''}</p>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-8">{draftReport(analysis)}</pre>
        <div className="flex flex-wrap gap-3 text-xs"><span className="text-muted-foreground">Fuentes:</span>{analysis.priorities.map(priority => <Link key={priority.findingId} className="record-link" href={`/hallazgos/${priority.findingId}`}>{priority.code}</Link>)}</div>
      </Panel>
    </section>
  );
}
