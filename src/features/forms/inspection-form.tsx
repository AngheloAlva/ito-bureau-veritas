'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/components/demo-provider';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { FormActions } from '@/components/shared/form-dialog';
import { ValidatedForm, FormError } from '@/components/shared/validated-form';
import { SelectField } from '@/components/shared/select-field';
import { TextField } from '@/components/shared/text-field';
import { DateField } from '@/components/shared/date-field';
import { formValue } from '@/lib/form-validation';
import { createInspection } from '@/domain/core';
import { REFERENCE_DATE } from '@/domain/types';

export function InspectionForm({ projectId }: { projectId: string }) {
  const d = useDemo();
  const router = useRouter();
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    try {
      d.apply(data => createInspection(data, d.user.id, {
        projectId: formValue(form, 'project'), sector: formValue(form, 'sector'),
        date: formValue(form, 'date'), specialty: formValue(form, 'specialty'),
        inspectorId: formValue(form, 'inspector'), activity: formValue(form, 'activity'),
        result: formValue(form, 'result'), visitState: 'Programada',
      }));
      setError('');
      d.run(() => {}, 'Inspección registrada. Complete la visita cuando corresponda.');
      router.push(`/inspecciones/i${d.data.inspections.length + 1}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar.'); }
  }
  return <ValidatedForm onSubmit={submit}>
    <FieldGroup>
      <FormError message={error} />
      <FieldGroup className="grid md:grid-cols-2">
        <SelectField name="project" label="Proyecto" required defaultValue={projectId} placeholder="Seleccione proyecto"
          options={d.data.projects.map(p => ({ value: p.id, label: `${p.code} · ${p.name}` }))} />
        <TextField name="sector" label="Sector" required />
        <DateField name="date" label="Fecha de visita" required defaultValue={REFERENCE_DATE} />
        <TextField name="specialty" label="Especialidad" required placeholder="Mecánica, civil, eléctrica…" />
        <SelectField name="inspector" label="Inspector" required defaultValue={d.user.id}
          options={d.data.users.filter(u => u.role === 'Inspector').map(u => ({ value: u.id, label: u.name }))} />
        <TextField name="activity" label="Actividad inspeccionada" required />
      </FieldGroup>
      <TextField name="result" label="Resultado general" required multiline />
      <FormActions helper="Se crea como visita programada; los hallazgos se registran en su detalle.">
        <Button type="submit" className="min-h-11">Guardar inspección</Button>
      </FormActions>
    </FieldGroup>
  </ValidatedForm>;
}
