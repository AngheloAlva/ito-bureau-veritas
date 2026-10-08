import Link from 'next/link';
import type { Data, Project } from '@/domain/types';
import { indicators } from '@/domain/core';
import { Badge } from '@/components/records/presentation';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';

export function ProjectCard({ project, data }: { project: Project; data: Data }) {
  const stats = indicators(data, project.id);
  return (
    <article>
      <Card size="sm" className="h-full">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-semibold text-muted-foreground">{project.code}</span><Badge>{project.status}</Badge></div>
          <div className="w-full sm:ml-auto sm:w-48"><Progress tone="teal" value={project.physicalProgress}><ProgressLabel>Avance físico registrado</ProgressLabel><ProgressValue /></Progress></div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight"><Link className="record-link" href={`/proyectos/${project.id}`}>{project.name} →</Link></h2>
          <CardDescription>{project.location} · {project.specialty}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">Coordinación: <span className="text-foreground">{data.users.find(user => user.id === project.responsibleId)?.name}</span></p>
          <div className="flex flex-wrap gap-6 bg-muted p-3 text-sm">
            <Link className="record-link text-muted-foreground" href={`/hallazgos?project=${project.id}&active=1`}><strong className="text-lg tabular-nums">{stats.active}</strong> activos</Link>
            <Link className="record-link record-warning-link" href={`/hallazgos?project=${project.id}&due=overdue`}><strong className="text-lg tabular-nums">{stats.overdue}</strong> vencidos</Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
