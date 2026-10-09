'use client';

import Link from 'next/link';
import { useDemo } from '@/components/demo-provider';
import { Heading } from '@/components/records/presentation';
import { indicators, scopedFindings, isOverdue, isActive } from '@/domain/core';
import { overviewTraceability } from '@/lib/overview-traceability';
import { OperationalMetrics } from './overview/metrics';
import { PendingQueue } from './overview/pending-queue';
import { SeverityChart, ProjectChart } from './overview/distributions';
import { Lifecycle } from './overview/lifecycle';
import { projectBreakdown } from '@/lib/overview-charts';
import { Traceability } from './overview/traceability';

export function Overview() {
  const { data, projectId } = useDemo();
  const stats = indicators(data, projectId || undefined);
  const trace = overviewTraceability(data, projectId || undefined);
  const scope = projectId ? `project=${encodeURIComponent(projectId)}&` : '';
  const alerts = scopedFindings(data, projectId || undefined).filter(finding => isOverdue(finding) || (isActive(finding) && finding.severity === 'Crítica'));
  const project = data.projects.find(item => item.id === projectId);

  return (
    <>
      <Heading eyebrow="Resumen · corte 08 octubre 2026" title="Control de pendientes" />
      <p className="text-sm text-muted-foreground">{project ? `${project.code} · ${project.name}` : 'Cartera completa'} · Priorizar compromisos, revisar el origen y acreditar el cierre.</p>
      <OperationalMetrics stats={stats} scope={scope} />
      <Lifecycle byState={stats.byState} total={stats.total} scope={scope} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]">
        <PendingQueue findings={alerts} scope={scope} data={data} />
        <aside aria-label="Gráficos del alcance" className="flex min-w-0 flex-col gap-6">
          <SeverityChart counts={stats.bySeverity} total={stats.total} scope={scope} />
          <ProjectChart rows={projectBreakdown(data, projectId || undefined)} />
          <Link className="record-link inline-flex min-h-10 items-center px-1 text-sm" href={`/analisis${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`}>Abrir Análisis IA →</Link>
        </aside>
      </div>
      <Traceability trace={trace} />
    </>
  );
}
