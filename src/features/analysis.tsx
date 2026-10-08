'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClipboardTextIcon, SparkleIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Heading, Panel, time } from '@/components/records/presentation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isAnalysisStale } from '@/domain/core';
import type { Analysis } from '@/domain/types';
import { useAnalysisStore } from './analysis/store';
import { AnalysisConcentrations, AnalysisPriorities } from './analysis/priorities';
import { AnalysisReport } from './analysis/report';
import { AnalysisEmpty, AnalysisProgress } from './analysis/experience';
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
  const preview = running ? state.result : undefined;
  const analysis = preview ?? cached;
  const sourceData = preview ? state.data! : demo.data;
  const [reportFor, setReportFor] = useState<Analysis | null>(null);
  const report = !running && !!analysis && reportFor === analysis;
  const project = demo.data.projects.find(item => item.id === projectId);
  const scope = projectId ? project?.name ?? 'Proyecto no disponible' : 'la cartera completa';
  const inspections = demo.data.inspections.filter(item => !projectId || item.projectId === projectId);
  const inspectionIds = new Set(inspections.map(item => item.id));
  const findings = demo.data.findings.filter(item => inspectionIds.has(item.inspectionId));
  const coverage = `${inspections.length} visitas · ${findings.length} hallazgos vinculados`;
  const stale = analysis ? isAnalysisStale(analysis, demo.data) : false;
  const showPriorities = !preview || state.stage >= 2;
  const showSupporting = !preview || state.stage >= 3;

  function start() {
    setReportFor(null);
    controller.setContext(key, demo.data.version);
    controller.start(demo.data, projectId);
  }

  return <div className="analysis-view">
    <div className="analysis-workspace flex flex-col gap-6">
      <div className="flex items-start gap-3"><ClipboardTextIcon className="mt-7 shrink-0 text-muted-foreground" size={28} aria-hidden="true" /><div className="min-w-0 flex-1"><Heading eyebrow="Visitas, hallazgos y fuentes" title="Análisis asistido">
        <div className="flex flex-wrap items-center gap-3"><Badge variant="secondary">Simulado</Badge>{cached ? <Button className="analysis-action no-print" onClick={start} disabled={running || !demo.hydrated}><SparkleIcon data-icon="inline-start" />Analizar registros</Button> : null}</div>
      </Heading></div></div>
      <p className="text-sm text-muted-foreground">Alcance: {scope} <span className="mx-2" aria-hidden="true">·</span><span className="tabular-nums">{coverage}</span></p>
      {running ? <AnalysisProgress state={state} onCancel={() => controller.cancel()} /> : null}
      {!running && current && state.reason ? <p role="status" className="text-sm text-muted-foreground">{state.reason === 'changed' ? 'Los registros cambiaron. Vuelve a analizar para incluir los cambios.' : 'Análisis cancelado. Puedes volver a intentarlo.'}</p> : null}
      <div aria-busy={running} className="flex flex-col gap-6">
        {!analysis && !running ? <AnalysisEmpty scope={scope} coverage={coverage} onStart={start} disabled={!demo.hydrated} /> : null}
        {analysis ? <>
          {stale ? <div className="rounded-lg bg-warning-surface p-4 text-sm text-warning"><strong>Análisis desactualizado.</strong> Los registros cambiaron; vuelve a analizar para actualizar las prioridades.</div> : null}
          <div className={preview ? 'analysis-reveal' : undefined}>
            <Panel title="Lectura operacional" description={`Generado ${time(analysis.generatedAt)} · datos v${analysis.dataVersion}`}>
              <p className="text-lg font-medium leading-relaxed">{analysis.summary.replace('Análisis simulado: ', '')}</p>
              <p className="text-xs text-muted-foreground">{preview ? coverage : 'Resultado disponible en esta sesión, también al volver a este alcance.'}</p>
            </Panel>
          </div>
          {showPriorities ? <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
            <div className={preview ? 'analysis-reveal' : undefined}><AnalysisPriorities analysis={analysis} data={sourceData} /></div>
            {showSupporting ? <div className={preview ? 'analysis-reveal' : undefined}><AnalysisConcentrations analysis={analysis} data={sourceData} /></div> : null}
          </div> : null}
          {showSupporting ? <div className={preview ? 'analysis-reveal' : undefined}><Panel title="Siguientes pasos"><ul className="flex list-disc flex-col gap-3 pl-5 text-sm leading-relaxed">{analysis.recommendations.map(text => <li key={text}>{text}</li>)}</ul></Panel></div> : null}
          {!running ? <div className="no-print flex flex-wrap gap-3"><Button variant="outline" onClick={() => setReportFor(report ? null : analysis)} aria-expanded={report} aria-controls="analysis-draft"><ClipboardTextIcon data-icon="inline-start" />{report ? 'Ocultar borrador' : 'Generar borrador de informe'}</Button>{report ? <Button onClick={() => window.print()}>Imprimir informe</Button> : null}</div> : null}
        </> : null}
      </div>
    </div>
    {analysis && report ? <div id="analysis-draft" className="mt-6"><AnalysisReport analysis={analysis} scope={project?.code ?? 'Cartera'} stale={stale} /></div> : null}
  </div>;
}
