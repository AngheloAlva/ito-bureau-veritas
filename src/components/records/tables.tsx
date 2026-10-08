'use client';

import Link from 'next/link';
import { useDemo } from '@/components/demo-provider';
import { isOverdue } from '@/domain/core';
import { REFERENCE_DATE, type Finding, type Inspection } from '@/domain/types';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, date, Empty } from './presentation';
import { RecordLink } from '@/components/shared/record-preview';
import { ColumnFilter, SelectColumnFilter } from '@/components/shared/column-filter';
import { DateField } from '@/components/shared/date-field';
import { FieldGroup } from '@/components/ui/field';
import type { SelectOption } from '@/components/shared/select-field';

type ChoiceFilter = { value: string; options: SelectOption[]; onChange: (value: string) => void };
export type FindingColumnFilters = Partial<Record<'severity' | 'state' | 'due', ChoiceFilter>>;
export type InspectionColumnFilters = {
  visitState?: ChoiceFilter;
  date?: { from: string; to: string; onChange: (key: 'from' | 'to', value: string) => void };
};

export function FindingTable({ findings, filters }: { findings: Finding[]; filters?: FindingColumnFilters }) {
  const { data } = useDemo();
  if (!findings.length && !filters) return <Empty />;
  return (
    <Table>
      <TableCaption>{findings.length} hallazgos del alcance seleccionado · plazos al {date(REFERENCE_DATE)}</TableCaption>
      <TableHeader><TableRow>{(['Código / hallazgo', 'Proyecto', 'Responsable', 'Severidad', 'Estado', 'Plazo'] as const).map(label => {
        const key = label === 'Severidad' ? 'severity' : label === 'Estado' ? 'state' : label === 'Plazo' ? 'due' : undefined;
        const filter = key ? filters?.[key] : undefined;
        return <TableHead key={label} scope="col">{filter ? <SelectColumnFilter label={label} name={`column-${key}`} {...filter} /> : label}</TableHead>;
      })}</TableRow></TableHeader>
      <TableBody>
        {!findings.length ? <TableRow><TableCell colSpan={6}>Sin hallazgos para estos filtros. Cambie o quite un filtro.</TableCell></TableRow> : null}
        {findings.map(finding => {
          const inspection = data.inspections.find(item => item.id === finding.inspectionId);
          const project = data.projects.find(item => item.id === inspection?.projectId);
          const overdue = isOverdue(finding);
          return (
            <TableRow key={finding.id}>
              <TableCell className="min-w-64 max-w-96 whitespace-normal">
                <RecordLink kind="finding" id={finding.id}><span className="block font-mono text-xs font-normal tabular-nums text-muted-foreground">{finding.code}</span>{finding.title}</RecordLink>
                {inspection ? <div className="mt-2 text-xs text-muted-foreground"><RecordLink kind="inspection" id={inspection.id}>Visita {inspection.code} · {date(inspection.date)}</RecordLink></div> : null}
              </TableCell>
              <TableCell>{project ? <Link className="record-link font-mono tabular-nums" href={`/proyectos/${project.id}`}>{project.code}</Link> : 'Sin proyecto'}</TableCell>
              <TableCell>{data.users.find(user => user.id === finding.responsibleId)?.name}</TableCell>
              <TableCell><Badge>{finding.severity}</Badge></TableCell>
              <TableCell><Badge>{finding.state}</Badge></TableCell>
              <TableCell><time className="font-mono tabular-nums" dateTime={finding.dueDate}>{date(finding.dueDate)}</time><div className="mt-1">{overdue ? <Badge>Vencido</Badge> : finding.state !== 'Cerrado' && finding.dueDate === REFERENCE_DATE ? <Badge>Vence hoy</Badge> : null}</div></TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function InspectionTable({ inspections, showProject = true, filters }: { inspections: Inspection[]; showProject?: boolean; filters?: InspectionColumnFilters }) {
  const { data } = useDemo();
  if (!inspections.length && !filters) return <Empty />;
  return (
    <Table>
      <TableCaption>{inspections.length} visitas e inspecciones del alcance seleccionado</TableCaption>
      <TableHeader><TableRow>{['Inspección', ...(showProject ? ['Proyecto'] : []), 'Fecha', 'Sector / especialidad', 'Inspector', 'Visita', 'Hallazgos'].map(label => <TableHead key={label} scope="col" className={label === 'Hallazgos' ? 'text-right' : undefined}>
        {label === 'Visita' && filters?.visitState ? <SelectColumnFilter label="Visita" name="column-visitState" {...filters.visitState} />
          : label === 'Fecha' && filters?.date ? <ColumnFilter label="Fecha" active={Boolean(filters.date.from || filters.date.to)}>
            <FieldGroup>
              <DateField name="column-from" label="Desde" value={filters.date.from} onValueChange={value => filters.date!.onChange('from', value)} />
              <DateField name="column-to" label="Hasta" value={filters.date.to} onValueChange={value => filters.date!.onChange('to', value)} />
            </FieldGroup>
          </ColumnFilter> : label}
      </TableHead>)}</TableRow></TableHeader>
      <TableBody>
        {!inspections.length ? <TableRow><TableCell colSpan={showProject ? 7 : 6}>Sin visitas para estos filtros. Cambie o quite un filtro.</TableCell></TableRow> : null}
        {inspections.map(inspection => (
          <TableRow key={inspection.id}>
            <TableCell className="min-w-64 max-w-96 whitespace-normal"><RecordLink kind="inspection" id={inspection.id}><span className="block font-mono text-xs font-normal tabular-nums text-muted-foreground">{inspection.code}</span>{inspection.activity}</RecordLink></TableCell>
            {showProject ? <TableCell><Link className="record-link" href={`/proyectos/${inspection.projectId}`}>{data.projects.find(project => project.id === inspection.projectId)?.code}</Link></TableCell> : null}
            <TableCell className="font-mono tabular-nums"><time dateTime={inspection.date}>{date(inspection.date)}</time></TableCell>
            <TableCell>{inspection.sector}<span className="block text-xs text-muted-foreground">{inspection.specialty}</span></TableCell>
            <TableCell>{data.users.find(user => user.id === inspection.inspectorId)?.name}</TableCell>
            <TableCell><Badge>{inspection.visitState}</Badge></TableCell>
            <TableCell className="text-right tabular-nums"><RecordLink kind="inspection" id={inspection.id}>{data.findings.filter(finding => finding.inspectionId === inspection.id).length} hallazgos</RecordLink></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
