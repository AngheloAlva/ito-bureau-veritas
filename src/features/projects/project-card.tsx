import Link from 'next/link';
import type { Data, Project } from '@/domain/types';
import { indicators } from '@/domain/core';
import { Badge } from '@/components/records/presentation';
import { ProjectIllustration } from '@/components/illustrations';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';

export function ProjectCard({ project, data }: { project: Project; data: Data }) {
  const stats = indicators(data, project.id);
  return (
    <article>
      <Card size="sm" className="h-full">
        <div className="blueprint-surface mx-3 mt-3 flex h-28 items-center justify-center overflow-hidden rounded-sm text-primary/70" aria-hidden="true"><ProjectIllustration projectId={project.id} specialty={project.specialty} className="h-full w-auto max-w-full" /></div>
        <CardHeader className="gap-1">
          <div className="flex items-center justify-between gap-3"><span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">{project.code}</span><Badge>{project.status}</Badge></div>
          <h2 className="text-xl font-semibold tracking-tight"><Link className="record-link" href={`/proyectos/${project.id}`}>{project.name} →</Link></h2>
          <CardDescription>{project.location} · {project.specialty} · Coordinación: <span className="text-foreground">{data.users.find(user => user.id === project.responsibleId)?.name}</span></CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Progress tone="teal" value={project.physicalProgress}><ProgressLabel>Avance físico registrado</ProgressLabel><ProgressValue /></Progress>
          <div className="flex flex-wrap gap-6 bg-muted p-3 text-sm">
            <Link className="record-link text-muted-foreground" href={`/hallazgos?project=${project.id}&active=1`}><strong className="text-lg tabular-nums">{stats.active}</strong> activos</Link>
            <Link className="record-link record-warning-link" href={`/hallazgos?project=${project.id}&due=overdue`}><strong className="text-lg tabular-nums">{stats.overdue}</strong> vencidos</Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
