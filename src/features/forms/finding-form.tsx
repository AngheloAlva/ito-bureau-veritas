'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/components/demo-provider';
import { Button } from '@/components/ui/button';
import { FieldGroup, FieldDescription } from '@/components/ui/field';
import { ValidatedForm, FormError } from '@/components/shared/validated-form';
import { SelectField } from '@/components/shared/select-field';
import { TextField } from '@/components/shared/text-field';
import { DateField } from '@/components/shared/date-field';
import { CheckField } from '@/components/shared/check-field';
import { formValue } from '@/lib/form-validation';
import { createFinding } from '@/domain/core';
import { REFERENCE_DATE, SEVERITIES, type Severity } from '@/domain/types';

export function FindingForm({ inspectionId }: { inspectionId: string }) {
  const d = useDemo();
  const router = useRouter();
  const [due, setDue] = useState<string>(REFERENCE_DATE);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const inspection = d.data.inspections.find(i => i.id === inspectionId);
  function submit(event: FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    let id = '';
    try {
      d.apply(data => {
        const next = createFinding(data, d.user.id, {
          inspectionId, title: formValue(form, 'title'), description: formValue(form, 'description'),
          specialty: formValue(form, 'specialty'), location: formValue(form, 'location'),
          severity: formValue(form, 'severity') as Severity, responsibleId: formValue(form, 'responsible'), dueDate: due,
        }, confirmed);
        id = next.findings.at(-1)!.id;
        return next;
      });
      d.run(() => {}, 'Hallazgo registrado; indicadores actualizados.');
      router.push(`/hallazgos/${id}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar.'); }
  }
  return <ValidatedForm onSubmit={submit}>
    <FieldGroup>
      <FormError message={error} />
      <FieldDescription>Inspección de origen: {inspection?.code}. Código automático.</FieldDescription>
      <TextField name="title" label="Título" required />
      <TextField name="description" label="Descripción" required multiline />
      <FieldGroup className="grid md:grid-cols-2">
        <TextField name="specialty" label="Especialidad" defaultValue={inspection?.specialty} required />
        <TextField name="location" label="Ubicación / tramo" required />
        <SelectField name="severity" label="Severidad" defaultValue="Media"
          options={SEVERITIES.map(s => ({ value: s, label: s }))} />
        <SelectField name="responsible" label="Responsable" required
          defaultValue={d.data.users.find(u => u.role === 'Responsable de corrección')?.id}
          options={d.data.users.filter(u => u.role === 'Responsable de corrección').map(u => ({ value: u.id, label: u.name }))} />
        <DateField name="due" label="Fecha compromiso" value={due} required
          description={due && due < REFERENCE_DATE ? 'Fecha vencida: confirme explícitamente antes de registrar.' : undefined}
          onValueChange={next => { setDue(next); setConfirmed(false); }} />
      </FieldGroup>
      {due && due < REFERENCE_DATE ? <CheckField name="confirmed" required checked={confirmed} onCheckedChange={setConfirmed}
        label="Confirmo que esta fecha dejará el hallazgo vencido al 08/10/2026." /> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">Registrar hallazgo</Button>
        <FieldDescription>Estado inicial: Abierto. Sin cierre automático.</FieldDescription>
      </div>
    </FieldGroup>
  </ValidatedForm>;
}
