'use client';

import { useState, type FormEvent } from 'react';
import { PencilSimpleIcon, UserCircleIcon, CalendarBlankIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { date } from '@/components/records';
import { Panel } from '@/components/records/presentation';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { FormDialog } from '@/components/shared/form-dialog';
import { ValidatedForm, FormError } from '@/components/shared/validated-form';
import { SelectField } from '@/components/shared/select-field';
import { DateField } from '@/components/shared/date-field';
import { CheckField } from '@/components/shared/check-field';
import { REFERENCE_DATE, type Finding } from '@/domain/types';
import { assignFinding, changeDueDate, isOverdue } from '@/domain/core';

export function Assignment({ finding: f }: { finding: Finding }) {
  const d = useDemo();
  return <Panel title="Responsable y plazo">
    <dl className="flex flex-col gap-4 text-sm">
      <div><dt className="flex items-center gap-2 text-xs text-muted-foreground"><UserCircleIcon aria-hidden="true" />Responsable de corrección</dt><dd className="mt-1 font-medium">{d.data.users.find(u => u.id === f.responsibleId)?.name}</dd></div>
      <div><dt className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarBlankIcon aria-hidden="true" />Fecha compromiso</dt><dd className="mt-1 font-mono font-medium tabular-nums">{date(f.dueDate)}{isOverdue(f) ? ' · Vencido' : ''}</dd></div>
    </dl>
    {d.user.role === 'Inspector' && f.state !== 'Cerrado' ? <AssignmentDialog key={`${f.id}-${d.user.id}`} finding={f} /> : null}
  </Panel>;
}

function AssignmentDialog({ finding }: { finding: Finding }) {
  const [open, setOpen] = useState(false);
  return <FormDialog title="Editar responsable y plazo" description={`${finding.code} · Los cambios se registran en la cronología.`}
    open={open} onOpenChange={setOpen}
    trigger={<Button type="button" variant="outline" size="sm"><PencilSimpleIcon data-icon="inline-start" />Editar asignación</Button>}>
    {open ? <AssignmentForm key={`${finding.id}-${finding.responsibleId}-${finding.dueDate}`} finding={finding} onSaved={() => setOpen(false)} /> : null}
  </FormDialog>;
}

function AssignmentForm({ finding: f, onSaved }: { finding: Finding; onSaved: () => void }) {
  const d = useDemo();
  const [responsible, setResponsible] = useState(f.responsibleId);
  const [due, setDue] = useState(f.dueDate);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      d.apply(data => {
        let next = data;
        if (responsible !== f.responsibleId) next = assignFinding(next, f.id, d.user.id, responsible);
        if (due !== f.dueDate) next = changeDueDate(next, f.id, d.user.id, due, confirmed);
        if (next === data) throw new Error('No hay cambios de responsable o plazo.');
        return next;
      });
      setError('');
      d.run(() => {}, 'Asignación y plazo actualizados con historial.');
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar.'); }
  }
  return <ValidatedForm onSubmit={submit}>
    <FieldGroup>
      <FormError message={error} />
      <SelectField name="responsible" label="Responsable" value={responsible} onValueChange={setResponsible}
        options={d.data.users.filter(u => u.role === 'Responsable de corrección').map(u => ({ value: u.id, label: u.name }))} />
      <DateField name="due" label="Fecha compromiso" value={due} required onValueChange={next => { setDue(next); setConfirmed(false); }} />
      {due && due < REFERENCE_DATE && due !== f.dueDate ? <CheckField name="confirmed" required checked={confirmed} onCheckedChange={setConfirmed} label="Confirmo el plazo vencido al 08/10/2026." /> : null}
      <Button type="submit" className="h-auto min-h-11 w-fit max-w-full min-w-0 py-2 whitespace-normal [overflow-wrap:anywhere]">Guardar asignación y plazo</Button>
    </FieldGroup>
  </ValidatedForm>;
}
