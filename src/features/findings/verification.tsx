'use client';

import { useState, type FormEvent, type RefObject } from 'react';
import { CheckCircleIcon, ArrowUUpLeftIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { ValidatedForm, FormError } from '@/components/shared/validated-form';
import { FormDialog } from '@/components/shared/form-dialog';
import { SelectField } from '@/components/shared/select-field';
import { TextField } from '@/components/shared/text-field';
import { transitionFinding } from '@/domain/core';
import type { Finding, State } from '@/domain/types';

export function Verification({ finding, focusReturnRef }: { finding: Finding; focusReturnRef?: RefObject<HTMLElement | null> }) {
  const [open, setOpen] = useState(false);
  return <FormDialog title="Revisión del inspector" description={`${finding.code} · Revise la acción y sus evidencias antes de cerrar o devolver.`}
    open={open} onOpenChange={setOpen} focusReturnRef={focusReturnRef}
    trigger={<Button type="button" size="sm"><CheckCircleIcon data-icon="inline-start" />Revisar corrección</Button>}>
    {open ? <VerificationForm finding={finding} onSaved={() => setOpen(false)} /> : null}
  </FormDialog>;
}

function VerificationForm({ finding: f, onSaved }: { finding: Finding; onSaved: () => void }) {
  const d = useDemo();
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const target: State = button?.value === 'return' ? 'En corrección' : 'Cerrado';
    try {
      d.apply(data => transitionFinding(data, f.id, d.user.id, target, { action: f.correctiveAction, evidenceId: '', comment }));
      setError('');
      d.run(() => {}, target === 'Cerrado' ? 'Hallazgo verificado y cerrado. Indicadores actualizados.' : `Estado actualizado: ${target}.`);
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo verificar.'); }
  }
  return <ValidatedForm onSubmit={submit}>
    <FieldGroup>
      <FormError message={error} />
      <SelectField name="verifier" label="Persona verificadora" value={d.user.id} onValueChange={d.selectUser}
        options={d.data.users.filter(u => u.role === 'Inspector').map(u => ({ value: u.id, label: u.name }))} />
      <TextField name="comment" label="Comentario de verificación / motivo de devolución" required multiline value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Describa la revisión; para devolver indique el motivo obligatorio." />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="close"><CheckCircleIcon data-icon="inline-start" />Verificar y cerrar</Button>
        <Button variant="outline" type="submit" name="intent" value="return"><ArrowUUpLeftIcon data-icon="inline-start" />Devolver a corrección</Button>
      </div>
    </FieldGroup>
  </ValidatedForm>;
}
