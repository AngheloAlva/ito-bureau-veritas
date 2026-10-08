'use client';

import { useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClipboardTextIcon, SparkleIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Heading, Panel, time } from '@/components/records/presentation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { indicators, isActive, isAnalysisStale, isOverdue } from '@/domain/core';
import type { Analysis } from '@/domain/types';
import { useAnalysisStore } from './analysis/store';
import { concentrationMatrix } from '@/domain/analysis-matrix';
import { ConcentrationHeatmap } from './analysis/heatmap';
import { AnalysisPriorities } from './analysis/priorities';
import { AnalysisReport } from './analysis/report';
import { AnalysisEmpty, AnalysisProgress, type ScopeCounts } from './analysis/experience';
import { useAnalysisRun } from './analysis/use-analysis-run';

export { AnalysisStore } from './analysis/store';

export function AnalysisView() {
  const demo = useDemo();
  const params = useSearchParams();
  const projectId = params.get('project') ?? demo.projectId;
  return <AnalysisWorkspace key={projectId || 'cartera'} projectId={projectId} />;
}

function AnalysisWorkspace({ projectId }: { projectId: string }) {
  const demo = useDemo();
  const store = useAnalysisStore();
  const key = projectId || 'cartera';
  const cached = store.analyses[key];
  const { state, controller } = useAnalysisRun(key, demo.data.version);
  const current = state.key === key && state.version === demo.data.version;
  const running = current && state.running;
  const analysis = running ? undefined : cached;
  const sourceData = demo.data;
  const [reportFor, setReportFor] = useState<Analysis | null>(null);
  const report = !!analysis && reportFor === analysis;
  const project = demo.data.projects.find(item => item.id === projectId);
  const scope = projectId ? project?.name ?? 'Proyecto no disponible' : 'la cartera completa';
  const inspections = demo.data.inspections.filter(item => !projectId || item.projectId === projectId);
  const inspectionIds = new Set(inspections.map(item => item.id));
  const findings = demo.data.findings.filter(item => inspectionIds.has(item.inspectionId));
  const evidenceCount = demo.data.evidence.filter(item => item.findingId && findings.some(f => f.id === item.findingId)).length;
  const matrix = concentrationMatrix(demo.data, projectId || undefined);
  const counts: ScopeCounts = { inspections: inspections.length, findings: findings.length, evidence: evidenceCount, active: findings.filter(isActive).length, overdue: findings.filter(f => isOverdue(f)).length, groups: matrix.cells.length };
  const coverage = `${inspections.length} visitas · ${findings.length} hallazgos vinculados`;
  const stale = analysis ? isAnalysisStale(analysis, demo.data) : false;
  const [animate, setAnimate] = useState(false);
  const stats = analysis ? indicators(demo.data, projectId || undefined) : null;

  function start() {
    setReportFor(null);
    setAnimate(true);
    controller.setContext(key, demo.data.version);
    controller.start(demo.data, projectId);
  }

  return <div className="analysis-view">
    <div className="analysis-workspace flex flex-col gap-6">
      <div className="flex items-start gap-3"><ClipboardTextIcon className="mt-7 shrink-0 text-muted-foreground" size={28} aria-hidden="true" /><div className="min-w-0 flex-1"><Heading eyebrow="Visitas, hallazgos y fuentes" title="Análisis asistido">
        <div className="flex flex-wrap items-center gap-3"><Badge variant="secondary">Simulado</Badge>{cached ? <Button className="analysis-action no-print" onClick={start} disabled={running || !demo.hydrated}><SparkleIcon data-icon="inline-start" />Analizar registros</Button> : null}</div>
      </Heading></div></div>
      <p className="text-sm text-muted-foreground">Alcance: {scope} <span className="mx-2" aria-hidden="true">·</span><span className="tabular-nums">{coverage}</span></p>
      {running ? <AnalysisProgress state={state} counts={counts} onCancel={() => controller.cancel()} /> : null}
      {!running && current && state.reason ? <p role="status" className="text-sm text-muted-foreground">{state.reason === 'changed' ? 'Los registros cambiaron. Vuelve a analizar para incluir los cambios.' : 'Análisis cancelado. Puedes volver a intentarlo.'}</p> : null}
      <div aria-busy={running} className="flex flex-col gap-6">
        {!analysis && !running ? <AnalysisEmpty scope={scope} counts={counts} onStart={start} disabled={!demo.hydrated} /> : null}
        {analysis && stats ? <>
          {stale ? <div className="rounded-sm bg-warning-surface p-4 text-sm text-warning"><strong>Análisis desactualizado.</strong> Los registros cambiaron; vuelve a analizar para actualizar las prioridades.</div> : null}
          <div className={animate ? 'analysis-enter' : undefined}>
            <Panel rule title="Resumen del análisis" description={`Generado ${time(analysis.generatedAt)} · datos v${analysis.dataVersion}`}>
              <div className="flex flex-wrap items-center gap-3"><Badge variant="secondary">Análisis simulado para demostración</Badge></div>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[['Activos', stats.active], ['Vencidos', stats.overdue], ['Críticos activos', stats.criticalActive], ['Prioridades', analysis.priorities.length]].map(([label, value]) => <div key={label} className="flex flex-col gap-1 rounded-sm border p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-mono text-2xl font-semibold tabular-nums">{value}</dd></div>)}</dl>
            </Panel>
          </div>
          <AnalysisPriorities analysis={analysis} data={sourceData} animate={animate} />
          <div className={animate ? 'analysis-enter' : undefined} style={animate ? { '--i': Math.min(analysis.priorities.length, 8) } as CSSProperties : undefined}><ConcentrationHeatmap data={sourceData} projectId={projectId || undefined} /></div>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Panel title="Siguientes pasos"><ul className="flex list-disc flex-col gap-3 pl-5 text-sm leading-relaxed">{analysis.recommendations.map(text => <li key={text}>{text}</li>)}</ul></Panel>
            <Panel title="Limitaciones"><ul className="flex list-disc flex-col gap-3 pl-5 text-sm leading-relaxed">{analysis.limitations.map(text => <li key={text}>{text}</li>)}</ul></Panel>
          </div>
          <div className="no-print flex flex-wrap gap-3"><Button variant="outline" onClick={() => setReportFor(report ? null : analysis)} aria-expanded={report} aria-controls="analysis-draft"><ClipboardTextIcon data-icon="inline-start" />{report ? 'Ocultar borrador' : 'Generar borrador de informe'}</Button>{report ? <Button onClick={() => window.print()}>Imprimir informe</Button> : null}</div>
        </> : null}
      </div>
    </div>
    {analysis && report ? <div id="analysis-draft" className="mt-6"><AnalysisReport analysis={analysis} scope={project?.code ?? 'Cartera'} stale={stale} /></div> : null}
  </div>;
}
