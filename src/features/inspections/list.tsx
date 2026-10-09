'use client';

import { pluralize } from '@/lib/format';
import { useSearchParams } from 'next/navigation';
import { useDemo } from '@/components/demo-provider';
import { Heading, InspectionTable } from '@/components/records';
import { FormDialog } from '@/components/shared/form-dialog';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { SelectField } from '@/components/shared/select-field';
import { DateField } from '@/components/shared/date-field';
import { FilterToolbar } from '@/components/shared/filter-toolbar';
import { parseListFilters, updateListFilters, clearListFilters } from '@/lib/list-filters';
import { calendarLabel } from '@/lib/date-fields';
import { InspectionForm } from '../forms/inspection-form';

export function Inspections() {
  const d = useDemo();
  const params = useSearchParams();
  const projects = d.data.projects.map(p => ({ value: p.id, label: `${p.code} · ${p.name}` }));
  const inspectors = d.data.users.filter(u => u.role === 'Inspector').map(u => ({ value: u.id, label: u.name }));
  const specialties = [...new Set(d.data.inspections.map(i => i.specialty))];
  const visitStates = ['Programada', 'Completada'];
  const visitOptions = visitStates.map(value => ({ value, label: value }));
  const f = parseListFilters(params.toString(), {
    project: projects.map(p => p.value), inspector: inspectors.map(u => u.value), specialty: specialties, visitState: visitStates,
  }, d.projectId);
  const { project: p, from, to, inspector, specialty, visitState, page } = f;
  const show = params.get('new') === '1';
  function change(key: string, value: string) {
    window.history.pushState(null, '', updateListFilters(window.location.href, { [key]: value }));
  }
  const labels: Record<string, string> = {
    visitState: `Visita: ${visitState}`,
    project: `Proyecto: ${projects.find(v => v.value === p)?.label}`,
    from: `Desde: ${calendarLabel(from)}`, to: `Hasta: ${calendarLabel(to)}`,
    inspector: `Inspector: ${inspectors.find(v => v.value === inspector)?.label}`, specialty: `Especialidad: ${specialty}`,
  };
  const chips = Object.keys(labels).filter(key => f[key]).map(key => ({ key, label: labels[key] }));
  const rows = d.data.inspections.filter(i => (!p || i.projectId === p) && (!from || i.date >= from)
    && (!to || i.date <= to) && (!inspector || i.inspectorId === inspector) && (!specialty || i.specialty === specialty)
    && (!visitState || i.visitState === visitState));
  const count = `${pluralize(rows.length, 'inspección', 'inspecciones')} ${rows.length === 1 ? 'encontrada' : 'encontradas'}`;
  return <div className="flex min-w-0 flex-col gap-6">
    <Heading eyebrow="Registro de visitas" title="Inspecciones">
      <FormDialog title="Nueva inspección"
        description="Registre una visita programada en el proyecto seleccionado."
        trigger={<Button>Crear inspección</Button>} open={show}
        onOpenChange={open => change('new', open ? '1' : '')}>
        <InspectionForm projectId={p} />
      </FormDialog>
    </Heading>
    <p className="text-sm text-muted-foreground">{p ? d.data.projects.find(item => item.id === p)?.name : 'Cartera completa'} · Visita y cierre de hallazgos son independientes.</p>
    <FilterToolbar title="Filtros de visita" count={count} chips={chips} onRemove={key => change(key, '')}
      onClear={() => window.history.pushState(null, '', clearListFilters(window.location.href, 'inspections'))}>
      <FieldGroup>
        <SelectField name="visitState" label="Visita" value={visitState} placeholder="Todas" options={visitOptions} onValueChange={v => change('visitState', v)} />
        <SelectField name="project" label="Proyecto" value={p} placeholder="Todos" onValueChange={v => change('project', v)} options={projects} />
        <DateField name="from" label="Desde" value={from} onValueChange={v => change('from', v)} />
        <DateField name="to" label="Hasta" value={to} onValueChange={v => change('to', v)} />
        <SelectField name="inspector" label="Inspector" value={inspector} onValueChange={v => change('inspector', v)} placeholder="Todos" options={inspectors} />
        <SelectField name="specialty" label="Especialidad" value={specialty} onValueChange={v => change('specialty', v)} placeholder="Todas" options={specialties.map(s => ({ value: s, label: s }))} />
      </FieldGroup>
    </FilterToolbar>
    <p role="status" className="text-sm text-muted-foreground tabular-nums">{count}</p>
    <InspectionTable inspections={rows} filters={{
      date: { from, to, onChange: change },
      visitState: { value: visitState, options: visitOptions, onChange: value => change('visitState', value) },
      project: { value: p, options: projects, onChange: value => change('project', value) },
      inspector: { value: inspector, options: inspectors, onChange: value => change('inspector', value) },
      specialty: { value: specialty, options: specialties.map(s => ({ value: s, label: s })), onChange: value => change('specialty', value) },
    }} control={{ page: Number(page || 1), onPageChange: value => change('page', value > 1 ? String(value) : '') }} />
  </div>;
}
