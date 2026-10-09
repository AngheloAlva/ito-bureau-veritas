'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDemo } from '@/components/demo-provider';
import { isOverdue } from '@/domain/core';
import { REFERENCE_DATE, type Finding, type Inspection } from '@/domain/types';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { pluralize } from '@/lib/format';
import { paginate } from '@/lib/paginate';
import { Pagination } from './pagination';
import { Badge, date, Empty } from './presentation';
import { RecordLink } from '@/components/shared/record-preview';
import { ColumnFilter, SelectColumnFilter } from '@/components/shared/column-filter';
import { DateField } from '@/components/shared/date-field';
import { FieldGroup } from '@/components/ui/field';
import type { SelectOption } from '@/components/shared/select-field';

type ChoiceFilter = { value: string; options: SelectOption[]; onChange: (value: string) => void };
export type FindingColumnFilters = Partial<Record<'severity' | 'state' | 'due' | 'project' | 'responsible', ChoiceFilter>>;
export type PageControl = { page: number; onPageChange: (page: number) => void };
export type InspectionColumnFilters = {
  visitState?: ChoiceFilter;
  project?: ChoiceFilter;
  inspector?: ChoiceFilter;
  specialty?: ChoiceFilter;
  date?: { from: string; to: string; onChange: (key: 'from' | 'to', value: string) => void };
};

/** URL-controlled when `control` is given; otherwise local state (embedded tables). */
function usePage(total: number, control?: PageControl) {
  const [local, setLocal] = useState(1);
  const current = control?.page ?? local;
  return { current, set: control?.onPageChange ?? setLocal, total };
}

const cell = 'h-11 py-0 align-middle';
const sticky = 'sticky left-0 z-10 bg-card';

export function FindingTable({ findings: all, filters, control }: { findings: Finding[]; filters?: FindingColumnFilters; control?: PageControl }) {
  const { data } = useDemo();
  const pager = usePage(all.length, control);
  const pg = paginate(all, pager.current);
  const findings = pg.items;
  if (!all.length && !filters) return <Empty />;
  const rowData = findings.map(finding => {
    const inspection = data.inspections.find(item => item.id === finding.inspectionId);
    return { finding, inspection, project: data.projects.find(item => item.id === inspection?.projectId), overdue: isOverdue(finding), responsible: data.users.find(user => user.id === finding.responsibleId)?.name };
  });
  return (<>
    {findings.length ? <div className="flex flex-col gap-3 md:hidden">
      <p className="text-xs text-muted-foreground">{pluralize(all.length, 'hallazgo')} del alcance seleccionado · plazos al {date(REFERENCE_DATE)}</p>
      <ul className="flex flex-col gap-3">{rowData.map(({ finding, inspection, project, overdue, responsible }) => <li key={finding.id} className="flex min-w-0 flex-col gap-3 rounded-sm border bg-card p-4 text-sm">
        <RecordLink kind="finding" id={finding.id}><span className="block font-mono text-xs font-normal tabular-nums text-muted-foreground">{finding.code}</span>{finding.title}</RecordLink>
        <div className="flex flex-wrap items-center gap-2"><Badge>{finding.severity}</Badge><Badge>{finding.state}</Badge>{overdue ? <Badge>Vencido</Badge> : finding.state !== 'Cerrado' && finding.dueDate === REFERENCE_DATE ? <Badge>Vence hoy</Badge> : null}</div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div><dt className="text-muted-foreground">Plazo</dt><dd className="mt-0.5 font-mono tabular-nums"><time dateTime={finding.dueDate}>{date(finding.dueDate)}</time></dd></div>
          <div><dt className="text-muted-foreground">Proyecto</dt><dd className="mt-0.5">{project ? <Link className="record-link font-mono tabular-nums" href={`/proyectos/${project.id}`}>{project.code}</Link> : 'Sin proyecto'}</dd></div>
          <div className="col-span-2"><dt className="text-muted-foreground">Responsable</dt><dd className="mt-0.5">{responsible}</dd></div>
          {inspection ? <div className="col-span-2"><dt className="text-muted-foreground">Visita</dt><dd className="mt-0.5"><RecordLink kind="inspection" id={inspection.id}><span className="font-mono tabular-nums">{inspection.code} · {date(inspection.date)}</span></RecordLink></dd></div> : null}
        </dl>
      </li>)}</ul>
    </div> : null}
    <div className={findings.length ? 'hidden md:block' : undefined}>
    <Table className="min-w-max">
      <TableCaption>{pluralize(all.length, 'hallazgo')} del alcance seleccionado · plazos al {date(REFERENCE_DATE)}</TableCaption>
      <TableHeader><TableRow>{(['Código', 'Hallazgo', 'Origen', 'Proyecto', 'Responsable', 'Severidad', 'Estado', 'Plazo'] as const).map(label => {
        const key = ({ Severidad: 'severity', Estado: 'state', Plazo: 'due', Proyecto: 'project', Responsable: 'responsible' } as const)[label as 'Severidad'];
        const filter = key ? filters?.[key] : undefined;
        return <TableHead key={label} scope="col" className={label === 'Código' ? sticky.replace('bg-card', 'bg-muted') : undefined}>{filter ? <SelectColumnFilter label={label} name={`column-${key}`} {...filter} /> : label}</TableHead>;
      })}</TableRow></TableHeader>
      <TableBody>
        {!all.length ? <TableRow><TableCell colSpan={8}>Sin hallazgos para estos filtros. Cambie o quite un filtro.</TableCell></TableRow> : null}
        {rowData.map(({ finding, inspection, project, overdue, responsible }) => (
          <TableRow key={finding.id}>
            <TableCell className={`${cell} ${sticky} font-mono text-xs tabular-nums`}><RecordLink kind="finding" id={finding.id}>{finding.code}</RecordLink></TableCell>
            <TableCell className={`${cell} min-w-[280px] max-w-[420px] truncate`} title={finding.title}>{finding.title}</TableCell>
            <TableCell className={`${cell} font-mono text-xs tabular-nums`}>{inspection ? <RecordLink kind="inspection" id={inspection.id}>{inspection.code} · {date(inspection.date)}</RecordLink> : '—'}</TableCell>
            <TableCell className={cell}>{project ? <Link className="record-link font-mono tabular-nums" href={`/proyectos/${project.id}`}>{project.code}</Link> : 'Sin proyecto'}</TableCell>
            <TableCell className={cell}>{responsible}</TableCell>
            <TableCell className={cell}><Badge>{finding.severity}</Badge></TableCell>
            <TableCell className={cell}><Badge>{finding.state}</Badge></TableCell>
            <TableCell className={cell}><span className="inline-flex items-center gap-2"><time className="font-mono text-xs tabular-nums" dateTime={finding.dueDate}>{date(finding.dueDate)}</time>{overdue ? <Badge>Vencido</Badge> : finding.state !== 'Cerrado' && finding.dueDate === REFERENCE_DATE ? <Badge>Vence hoy</Badge> : null}</span></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
    <Pagination page={pg} onPageChange={pager.set} label="hallazgos" />
  </>);
}

export function InspectionTable({ inspections: all, showProject = true, filters, control }: { inspections: Inspection[]; showProject?: boolean; filters?: InspectionColumnFilters; control?: PageControl }) {
  const { data } = useDemo();
  const pager = usePage(all.length, control);
  const pg = paginate(all, pager.current);
  if (!all.length && !filters) return <Empty />;
  const labels = ['Código', 'Actividad', ...(showProject ? ['Proyecto'] : []), 'Fecha', 'Sector', 'Especialidad', 'Inspector', 'Visita', 'Hallazgos'];
  const choice = { Proyecto: filters?.project, Especialidad: filters?.specialty, Inspector: filters?.inspector, Visita: filters?.visitState } as Record<string, ChoiceFilter | undefined>;
  const names = { Proyecto: 'project', Especialidad: 'specialty', Inspector: 'inspector', Visita: 'visitState' } as Record<string, string>;
  return (<>
    <Table className="min-w-max">
      <TableCaption>{pluralize(all.length, 'visita')} e inspecciones del alcance seleccionado</TableCaption>
      <TableHeader><TableRow>{labels.map(label => <TableHead key={label} scope="col" className={label === 'Hallazgos' ? 'text-right' : label === 'Código' ? sticky.replace('bg-card', 'bg-muted') : undefined}>
        {choice[label] ? <SelectColumnFilter label={label} name={`column-${names[label]}`} {...choice[label]!} />
          : label === 'Fecha' && filters?.date ? <ColumnFilter label="Fecha" active={Boolean(filters.date.from || filters.date.to)}>
            <FieldGroup>
              <DateField name="column-from" label="Desde" value={filters.date.from} onValueChange={value => filters.date!.onChange('from', value)} />
              <DateField name="column-to" label="Hasta" value={filters.date.to} onValueChange={value => filters.date!.onChange('to', value)} />
            </FieldGroup>
          </ColumnFilter> : label}
      </TableHead>)}</TableRow></TableHeader>
      <TableBody>
        {!all.length ? <TableRow><TableCell colSpan={labels.length}>Sin visitas para estos filtros. Cambie o quite un filtro.</TableCell></TableRow> : null}
        {pg.items.map(inspection => (
          <TableRow key={inspection.id}>
            <TableCell className={`${cell} ${sticky} font-mono text-xs tabular-nums`}><RecordLink kind="inspection" id={inspection.id}>{inspection.code}</RecordLink></TableCell>
            <TableCell className={`${cell} min-w-[240px] max-w-[380px] truncate`} title={inspection.activity}>{inspection.activity}</TableCell>
            {showProject ? <TableCell className={`${cell} font-mono text-xs tabular-nums`}><Link className="record-link" href={`/proyectos/${inspection.projectId}`}>{data.projects.find(project => project.id === inspection.projectId)?.code}</Link></TableCell> : null}
            <TableCell className={`${cell} font-mono text-xs tabular-nums`}><time dateTime={inspection.date}>{date(inspection.date)}</time></TableCell>
            <TableCell className={cell}>{inspection.sector}</TableCell>
            <TableCell className={`${cell} text-muted-foreground`}>{inspection.specialty}</TableCell>
            <TableCell className={cell}>{data.users.find(user => user.id === inspection.inspectorId)?.name}</TableCell>
            <TableCell className={cell}><Badge>{inspection.visitState}</Badge></TableCell>
            <TableCell className={`${cell} text-right tabular-nums`}><RecordLink kind="inspection" id={inspection.id}>{pluralize(data.findings.filter(finding => finding.inspectionId === inspection.id).length, 'hallazgo')}</RecordLink></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <Pagination page={pg} onPageChange={pager.set} label="visitas" />
  </>);
}
