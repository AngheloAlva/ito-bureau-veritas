import Link from 'next/link';
import type { Data, Project } from '@/domain/types';
import { indicators } from '@/domain/core';
import { Badge, Panel } from '@/components/records/presentation';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';

export function ProjectContext({ project, data }: { project: Project; data: Data }) {
  const stats = indicators(data, project.id);
  return (
    <Panel title="Contexto de obra">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Badge>{project.status}</Badge>
        <div className="w-full min-w-0 sm:w-48">
          <Progress tone="teal" value={project.physicalProgress}><ProgressLabel>Avance físico registrado</ProgressLabel><ProgressValue /></Progress>
        </div>
      </div>
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div><dt className="text-xs text-muted-foreground">Ubicación</dt><dd className="mt-1 text-sm font-medium">{project.location}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Especialidad</dt><dd className="mt-1 text-sm font-medium">{project.specialty}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Coordinación</dt><dd className="mt-1 text-sm font-medium">{data.users.find(user => user.id === project.responsibleId)?.name}</dd></div>
      </dl>
      <nav aria-label="Hallazgos del proyecto" className="flex flex-wrap gap-4 bg-muted p-3 text-sm">
        <Link className="record-link" href={`/hallazgos?project=${project.id}&active=1`}><strong className="tabular-nums">{stats.active}</strong> activos</Link>
        <Link className="record-link record-warning-link" href={`/hallazgos?project=${project.id}&due=overdue`}><strong className="tabular-nums">{stats.overdue}</strong> vencidos</Link>
      </nav>
      <Link className="analysis-action inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href={`/analisis?project=${project.id}`}>Analizar proyecto →</Link>
    </Panel>
  );
}
