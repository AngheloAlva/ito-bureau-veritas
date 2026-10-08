'use client';

import Link from 'next/link';
import { useDemo } from '@/components/demo-provider';
import { Heading } from '@/components/records/presentation';
import type { ProgressTone } from '@/components/ui/progress';
import { indicators, scopedFindings, isOverdue, isActive } from '@/domain/core';
import { overviewTraceability } from '@/lib/overview-traceability';
import { OperationalMetrics } from './overview/metrics';
import { PendingQueue } from './overview/pending-queue';
import { Distribution } from './overview/distributions';
import { Traceability } from './overview/traceability';

const stateTones: Record<string, ProgressTone> = {
  Abierto: 'neutral', 'En corrección': 'warning', 'Pendiente de verificación': 'teal', Cerrado: 'success',
};
const severityTones: Record<string, ProgressTone> = { Crítica: 'danger', Alta: 'warning' };

export function Overview() {
  const { data, projectId } = useDemo();
  const stats = indicators(data, projectId || undefined);
  const trace = overviewTraceability(data, projectId || undefined);
  const scope = projectId ? `project=${encodeURIComponent(projectId)}&` : '';
  const alerts = scopedFindings(data, projectId || undefined).filter(finding => isOverdue(finding) || (isActive(finding) && finding.severity === 'Crítica'));
  const project = data.projects.find(item => item.id === projectId);

  return (
    <>
      <Heading eyebrow="Bitácora operacional · corte 08 octubre 2026" title="Control de pendientes" />
      <p className="text-sm text-muted-foreground">{project ? `${project.code} · ${project.name}` : 'Cartera completa'} · Priorizar compromisos, revisar el origen y acreditar el cierre.</p>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(16rem,2fr)]">
        <PendingQueue findings={alerts} scope={scope} data={data} />
        <aside aria-label="Balance y análisis" className="flex min-w-0 flex-col gap-6">
          <OperationalMetrics stats={stats} scope={scope} />
          <div className="flex flex-col gap-2 px-1">
            <h2 className="text-sm font-semibold">Preparar la revisión</h2>
            <p className="text-xs text-muted-foreground">Reglas deterministas con fuentes; sin predicciones ni servicios externos.</p>
            <Link className="record-link inline-flex min-h-10 items-center text-sm" href={`/analisis${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`}>Abrir análisis simulado →</Link>
          </div>
        </aside>
      </div>
      <Traceability trace={trace} />
      <section aria-labelledby="overview-distributions" className="flex flex-col gap-4 pt-2">
        <div><h2 id="overview-distributions" className="text-lg font-semibold">Lectura de la cartera</h2><p className="text-xs text-muted-foreground">Distribuciones actuales del alcance completo; no representan avance físico ni tendencia.</p></div>
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <Distribution title="Por estado" tone={key => stateTones[key] ?? 'neutral'} counts={stats.byState} total={stats.total} href={key => `/hallazgos?${scope}state=${encodeURIComponent(key)}`} />
          <Distribution title="Por severidad" tone={key => severityTones[key] ?? 'neutral'} counts={stats.bySeverity} total={stats.total} href={key => `/hallazgos?${scope}severity=${encodeURIComponent(key)}`} />
          <Distribution title="Por proyecto" counts={stats.byProject} total={stats.total} href={key => `/hallazgos?project=${encodeURIComponent(key)}`} label={key => data.projects.find(item => item.id === key)?.code ?? key} />
        </div>
      </section>
    </>
  );
}
