'use client';

import Link from 'next/link';
import { useDemo } from '@/components/demo-provider';
import { Assets } from '@/components/records/assets';
import { Heading, Panel, Empty } from '@/components/records/presentation';
import { InspectionTable } from '@/components/records/tables';
import { ProjectChronology } from '@/components/records/chronology';
import { Button } from '@/components/ui/button';
import { CalendarPlusIcon } from '@phosphor-icons/react';
import { FormDialog } from '@/components/shared/form-dialog';
import { InspectionForm } from './forms/inspection-form';
import { ProjectCard } from './projects/project-card';
import { ProjectContext } from './projects/project-context';
import { ProjectMilestones } from './projects/milestones';

export function Projects() {
  const { data, projectId } = useDemo();
  const projects = data.projects.filter(project => !projectId || project.id === projectId);
  return (
    <>
      <Heading eyebrow="Proyectos" title="Cartera de proyectos" />
      <p className="text-sm text-muted-foreground">{projects.length} proyectos en el alcance · Acceda a visitas, compromisos y respaldo documental por obra.</p>
      {projects.length ? <div className="grid gap-6 xl:grid-cols-2">{projects.map(project => <ProjectCard key={project.id} project={project} data={data} />)}</div> : <Empty>No hay proyectos en este alcance.</Empty>}
    </>
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const { data } = useDemo();
  const project = data.projects.find(item => item.id === id);
  if (!project) return <Empty>Proyecto no encontrado. <Link className="record-link" href="/proyectos">Volver a proyectos</Link></Empty>;
  return (
    <>
      <nav aria-label="Ruta del proyecto" className="text-xs text-muted-foreground"><Link className="record-link" href="/proyectos">Proyectos</Link> / <span aria-current="page">{project.code}</span></nav>
      <Heading eyebrow={`${project.code} · contexto del proyecto`} title={project.name}>
        <FormDialog title={`Crear inspección · ${project.code}`} description="Registre la visita en esta obra. Al guardar se abre su acta completa." trigger={<Button><CalendarPlusIcon aria-hidden="true" data-icon="inline-start" />Crear inspección</Button>}><InspectionForm projectId={id} /></FormDialog>
      </Heading>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex min-w-0 flex-col gap-6"><ProjectContext project={project} data={data} /><ProjectMilestones projectId={id} /><Panel title="Visitas e inspecciones" description="Seleccione una visita para consultar su acta y los hallazgos asociados."><InspectionTable showProject={false} inspections={data.inspections.filter(inspection => inspection.projectId === id)} /></Panel><Panel title="Documentos de referencia"><Assets documents={data.documents.filter(document => document.projectId === id)} /></Panel></div>
        <ProjectChronology projectId={id} />
      </div>
    </>
  );
}
