'use client';

import { useSearchParams } from 'next/navigation';
import { useDemo } from '@/components/demo-provider';
import { Heading, FindingTable } from '@/components/records';
import { FieldGroup } from '@/components/ui/field';
import { SelectField } from '@/components/shared/select-field';
import { TextField } from '@/components/shared/text-field';
import { CheckField } from '@/components/shared/check-field';
import { FilterToolbar } from '@/components/shared/filter-toolbar';
import { parseListFilters, updateListFilters, clearListFilters } from '@/lib/list-filters';
import { STATES, SEVERITIES, REFERENCE_DATE } from '@/domain/types';
import { scopedFindings, isActive, isOverdue } from '@/domain/core';

export function Findings() {
  const d = useDemo();
  const params = useSearchParams();
  const projects = d.data.projects.map(p => ({ value: p.id, label: `${p.code} · ${p.name}` }));
  const users = d.data.users.filter(u => u.role === 'Responsable de corrección').map(u => ({ value: u.id, label: u.name }));
  const dues = [{ value: 'overdue', label: 'Vencidos activos' }, { value: 'today', label: 'Vencen hoy' }];
  const f = parseListFilters(params.toString(), {
    project: projects.map(p => p.value), state: STATES, severity: SEVERITIES,
    responsible: users.map(u => u.value), due: dues.map(v => v.value),
  }, d.projectId);
  const { project: p, state, severity, responsible, due, active, query } = f;
  function change(key: string, value: string) {
    const href = updateListFilters(window.location.href, { [key]: value });
    if (key === 'query') window.history.replaceState(null, '', href);
    else window.history.pushState(null, '', href);
  }
  const labels: Record<string, string> = {
    project: `Proyecto: ${projects.find(v => v.value === p)?.label}`,
    state: `Estado: ${state}`, severity: `Severidad: ${severity}`,
    responsible: `Responsable: ${users.find(v => v.value === responsible)?.label}`,
    due: `Vencimiento: ${dues.find(v => v.value === due)?.label}`, active: 'Solo activos', query: `Búsqueda: ${query}`,
  };
  const chips = Object.keys(labels).filter(key => f[key]).map(key => ({ key, label: labels[key] }));
  const rows = scopedFindings(d.data, p || undefined).filter(item => (!state || item.state === state)
    && (!severity || item.severity === severity) && (!responsible || item.responsibleId === responsible)
    && (!active || isActive(item)) && (!due || (due === 'overdue' ? isOverdue(item) : isActive(item) && item.dueDate === REFERENCE_DATE))
    && `${item.code} ${item.title}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
  const count = `${rows.length} hallazgos encontrados`;
  return <div className="flex min-w-0 flex-col gap-6">
    <Heading eyebrow="Seguimiento de correcciones" title="Hallazgos" />
    <p className="text-sm text-muted-foreground">{p ? d.data.projects.find(item => item.id === p)?.name : 'Cartera completa'} · Vencimiento al 08/10/2026.</p>
    <FilterToolbar title="Filtros de hallazgos" count={count} chips={chips} onRemove={key => change(key, '')}
      onClear={() => window.history.pushState(null, '', clearListFilters(window.location.href, 'findings'))}
      search={<TextField name="query" label="Código o título" type="search" value={query} onChange={e => change('query', e.target.value)} placeholder="H-001 o estanqueidad" />}>
      <FieldGroup>
        <SelectField name="project" label="Proyecto" value={p} placeholder="Todos" onValueChange={v => change('project', v)} options={projects} />
        <SelectField name="state" label="Estado" value={state} onValueChange={v => change('state', v)} placeholder="Todos" options={STATES.map(s => ({ value: s, label: s }))} />
        <SelectField name="severity" label="Severidad" value={severity} onValueChange={v => change('severity', v)} placeholder="Todas" options={SEVERITIES.map(s => ({ value: s, label: s }))} />
        <SelectField name="responsible" label="Responsable" value={responsible} onValueChange={v => change('responsible', v)} placeholder="Todos" options={users} />
        <SelectField name="due" label="Vencimiento" value={due} onValueChange={v => change('due', v)} placeholder="Todos los plazos" options={dues} />
        <CheckField name="active" label="Solo activos" checked={active === '1'} onCheckedChange={v => change('active', v ? '1' : '')} />
      </FieldGroup>
    </FilterToolbar>
    <p role="status" className="text-sm text-muted-foreground tabular-nums">{count} · Un pendiente de verificación sigue activo.</p>
    <FindingTable findings={rows} filters={{
      state: { value: state, options: STATES.map(value => ({ value, label: value })), onChange: value => change('state', value) },
      severity: { value: severity, options: SEVERITIES.map(value => ({ value, label: value })), onChange: value => change('severity', value) },
      due: { value: due, options: dues, onChange: value => change('due', value) },
    }} />
  </div>;
}
