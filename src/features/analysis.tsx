'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChatsCircleIcon, ClipboardTextIcon, SparkleIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Heading, Panel, time } from '@/components/records/presentation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { indicators, isActive, isAnalysisStale, isOverdue } from '@/domain/core';
import type { Analysis } from '@/domain/types';
import { pluralize } from '@/lib/format';
import { useAnalysisStore } from './analysis/store';
import { concentrationMatrix } from '@/domain/analysis-matrix';
import { ConcentrationHeatmap } from './analysis/heatmap';
import { AnalysisPriorities } from './analysis/priorities';
import { AnalysisReport } from './analysis/report';
import { AnalysisEmpty, AnalysisProgress, type ScopeCounts } from './analysis/experience';
import { useAnalysisRun } from './analysis/use-analysis-run';
import { ScopePicker } from './assistant/scope-picker';

export { AnalysisStore } from './analysis/store';

export function AnalysisView() {
  const demo = useDemo();
  const params = useSearchParams();
  const raw = params.get('project');
  // `project=all` makes the full portfolio explicit; no param falls back to the header scope.
  const projectId = raw === 'all' ? '' : raw ?? demo.projectId;
  function changeScope(id: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('project', id || 'all');
    window.history.pushState(null, '', url);
    demo.setProjectId(id);
  }
  return <div className="flex flex-col gap-6">
    <section className="no-print flex flex-col gap-3" aria-label="Alcance del análisis"><h2 className="text-sm font-semibold">Alcance del análisis</h2><ScopePicker compact value={projectId} onChange={changeScope} /></section>
    <Link href="/asistente" className="no-print flex items-center gap-3 rounded-lg border border-copper/30 bg-copper-surface p-4 text-sm outline-none transition-colors hover:border-copper focus-visible:ring-2 focus-visible:ring-ring/40"><ChatsCircleIcon size={24} className="shrink-0 text-copper" aria-hidden="true" /><span><strong className="font-semibold">¿Prefiere preguntar?</strong> Abra el asistente de análisis para obtener respuestas y gráficos.</span></Link>
    <AnalysisWorkspace key={projectId || 'cartera'} projectId={projectId} />
  </div>;
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
  const coverage = `${pluralize(inspections.length, 'visita')} · ${findings.length} ${findings.length === 1 ? 'hallazgo vinculado' : 'hallazgos vinculados'}`;
  const stale = analysis ? isAnalysisStale(analysis, demo.data) : false;
  const [animate, setAnimate] = useState(false);
  // Tiles come from the analysis snapshot; caches without counts fall back to live data.
  const stats = analysis ? (analysis.counts ?? indicators(demo.data, projectId || undefined)) : null;

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
      <p className="text-sm text-muted-foreground">Alcance: {scope} · <span className="tabular-nums">{coverage}</span></p>
      {running ? <AnalysisProgress state={state} counts={counts} onCancel={() => controller.cancel()} /> : null}
      {!running && current && state.reason ? <p role="status" className="text-sm text-muted-foreground">{state.reason === 'changed' ? 'Los registros cambiaron. Vuelva a analizar para incluir los cambios.' : 'Análisis cancelado. Puede volver a intentarlo.'}</p> : null}
      <div aria-busy={running} className="flex flex-col gap-6">
        {!analysis && !running ? <AnalysisEmpty scope={scope} counts={counts} onStart={start} disabled={!demo.hydrated} /> : null}
        {analysis && stats ? <>
          {stale ? <div className="rounded-sm bg-warning-surface p-4 text-sm text-warning"><strong>Análisis desactualizado.</strong> Los registros cambiaron; vuelva a analizar para actualizar las prioridades.</div> : null}
          <div className={animate ? 'analysis-enter' : undefined}>
            <Panel rule title="Resumen del análisis" description={`Generado ${time(analysis.generatedAt)}`}>
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
