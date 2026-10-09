'use client';

import { CaretDownIcon, ClipboardTextIcon } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { indicators, isAnalysisStale } from '@/domain/core';
import type { Analysis, Data } from '@/domain/types';
import { time } from '@/components/records/presentation';
import { ConcentrationHeatmap } from '../analysis/heatmap';
import { AnalysisPriorities } from '../analysis/priorities';

function Fold({ title, items }: { title: string; items: string[] }) {
  return <details className="group rounded-lg border bg-muted/30 px-4 py-3 text-sm">
    <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-2 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden">
      {title}<CaretDownIcon size={14} aria-hidden="true" className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
    </summary>
    <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 leading-relaxed">{items.map(text => <li key={text}>{text}</li>)}</ul>
  </details>;
}

/** Rich chat answer for the deterministic analysis run. */
export function AnalysisArtifact({ analysis, data, projectId, reportOpen, onToggleReport }: {
  analysis: Analysis; data: Data; projectId: string; reportOpen: boolean; onToggleReport: () => void;
}) {
  const stale = isAnalysisStale(analysis, data);
  const stats = analysis.counts ?? indicators(data, projectId || undefined);
  const tiles: [string, number][] = [['Activos', stats.active], ['Vencidos', stats.overdue], ['Críticos activos', stats.criticalActive], ['Prioridades', analysis.priorities.length]];
  return <div className="flex w-full min-w-0 flex-col gap-4 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
    {stale ? <div role="status" className="rounded-lg bg-warning-surface p-3 text-sm text-warning"><strong>Análisis desactualizado.</strong> Los registros cambiaron; vuelva a analizar para actualizar las prioridades.</div> : null}
    <Card size="sm">
      <div className="flex flex-col gap-3 px-(--card-spacing)">
        <div className="flex flex-col gap-0.5"><h3 className="text-sm font-semibold">Resumen del análisis</h3><p className="text-xs text-muted-foreground">Generado {time(analysis.generatedAt)} · Generado por el asistente</p></div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{tiles.map(([label, value]) => <div key={label} className="flex flex-col gap-1 rounded-lg border p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-mono text-2xl font-semibold tabular-nums">{value}</dd></div>)}</dl>
      </div>
    </Card>
    <AnalysisPriorities analysis={analysis} data={data} />
    <ConcentrationHeatmap data={data} projectId={projectId || undefined} />
    <div className="grid items-start gap-3 sm:grid-cols-2">
      <Fold title="Siguientes pasos" items={analysis.recommendations} />
      <Fold title="Limitaciones" items={analysis.limitations} />
    </div>
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onToggleReport} aria-expanded={reportOpen} aria-controls="analysis-draft"><ClipboardTextIcon data-icon="inline-start" />{reportOpen ? 'Ocultar informe imprimible' : 'Ver informe imprimible'}</Button>
    </div>
  </div>;
}
