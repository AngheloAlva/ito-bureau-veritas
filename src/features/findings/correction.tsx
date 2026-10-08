'use client';

import { useState, type FormEvent, type RefObject } from 'react';
import { ArrowRightIcon, WrenchIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Button } from '@/components/ui/button';
import { FieldGroup, FieldDescription } from '@/components/ui/field';
import { FormDialog } from '@/components/shared/form-dialog';
import { ValidatedForm, FormError } from '@/components/shared/validated-form';
import { SelectField } from '@/components/shared/select-field';
import { TextField } from '@/components/shared/text-field';
import { transitionFinding } from '@/domain/core';
import type { Finding } from '@/domain/types';
import { EvidenceDialog } from './evidence-dialog';

type Props = { finding: Finding; evidenceId: string; onEvidenceChange: (id: string) => void; focusReturnRef?: RefObject<HTMLElement | null> };

export function Correction(props: Props) {
  const [open, setOpen] = useState(false);
  return <FormDialog title="Corrección del responsable" description={`${props.finding.code} · Registre la acción y seleccione su respaldo para remitir.`}
    open={open} onOpenChange={setOpen} focusReturnRef={props.focusReturnRef}
    trigger={<Button type="button" size="sm"><WrenchIcon data-icon="inline-start" />Preparar corrección</Button>}>
    {open ? <CorrectionForm {...props} onSaved={() => setOpen(false)} /> : null}
  </FormDialog>;
}

function CorrectionForm({ finding: f, evidenceId, onEvidenceChange, onSaved }: Props & { onSaved: () => void }) {
  const d = useDemo();
  const [action, setAction] = useState(f.correctiveAction);
  const [error, setError] = useState('');
  const evidence = d.data.evidence.filter(e => e.findingId === f.id && e.phase === 'corrección');
  const selected = evidence.find(e => e.id === evidenceId);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      d.apply(data => transitionFinding(data, f.id, d.user.id, 'Pendiente de verificación', { action, evidenceId, comment: '' }));
      setError('');
      d.run(() => {}, 'Estado actualizado: Pendiente de verificación.');
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo remitir.'); }
  }
  return <div className="flex w-full min-w-0 flex-col items-start gap-4"><ValidatedForm onSubmit={submit}>
    <FieldGroup className="w-full min-w-0">
      <FormError message={error} />
      <TextField name="action" label="Acción correctiva" required multiline value={action} onChange={e => setAction(e.target.value)} placeholder="Solicitar el registro firmado y contrastarlo con el tramo…" />
      <SelectField name="evidenceId" label="Evidencia de corrección" required value={selected?.id ?? ''} onValueChange={onEvidenceChange}
        placeholder="Seleccione respaldo para remitir" options={evidence.map(e => ({ value: e.id, label: `${e.name} · ${e.id}` }))} />
      {selected ? <p className="min-w-0 text-sm [overflow-wrap:anywhere]">Respaldo seleccionado: <a className="record-link" href={selected.reference} target="_blank" rel="noreferrer">{selected.name} ↗</a></p> : null}
      <FieldDescription>El respaldo adjunto queda seleccionado. Remitir solicita la revisión del inspector; no cierra el hallazgo.</FieldDescription>
      <Button type="submit" className="h-auto min-h-11 w-fit max-w-full min-w-0 py-2 whitespace-normal [overflow-wrap:anywhere]"><ArrowRightIcon data-icon="inline-start" />Remitir a verificación</Button>
    </FieldGroup>
  </ValidatedForm>
    <EvidenceDialog finding={f} phase="corrección" onAdded={onEvidenceChange} />
  </div>;
}
