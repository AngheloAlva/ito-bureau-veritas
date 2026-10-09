'use client';

import { useState, type FormEvent, type RefObject } from 'react';
import { CheckCircleIcon, ArrowUUpLeftIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { FormError } from '@/components/shared/validated-form';
import { FormDialog } from '@/components/shared/form-dialog';
import { LiveValidatedForm } from './live-validated-form';
import { date } from '@/components/records/presentation';
import { TextField } from '@/components/shared/text-field';
import { transitionFinding } from '@/domain/core';
import type { Finding, State } from '@/domain/types';

export function Verification({ finding, focusReturnRef }: { finding: Finding; focusReturnRef?: RefObject<HTMLElement | null> }) {
  const [open, setOpen] = useState(false);
  return <FormDialog title="Revisión del inspector" description={`${finding.code} · Revise la acción y sus evidencias antes de cerrar o devolver.`}
    open={open} onOpenChange={setOpen} focusReturnRef={focusReturnRef}
    trigger={<Button type="button" size="sm" data-workflow-action><CheckCircleIcon data-icon="inline-start" />Revisar corrección</Button>}>
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
  const submitted = d.data.events.filter(e => e.findingId === f.id && e.changes.evidenceId).sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];
  const evidence = d.data.evidence.find(e => e.id === submitted?.changes.evidenceId?.after);
  return <LiveValidatedForm valid={Boolean(comment.trim())} onSubmit={submit}>
    <FieldGroup>
      <FormError message={error} />
      <section aria-label="Acción y evidencia registradas" className="flex flex-col gap-3 rounded-sm border bg-muted/30 p-3 text-sm">
        <div><h3 className="text-xs font-medium text-muted-foreground">Acción correctiva registrada</h3><p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{f.correctiveAction || 'Sin registro.'}</p></div>
        <div><h3 className="text-xs font-medium text-muted-foreground">Evidencia de corrección</h3><p className="mt-1 [overflow-wrap:anywhere]">{evidence ? <a className="record-link" href={evidence.reference} target="_blank" rel="noreferrer">{evidence.name} ↗</a> : 'Sin evidencia seleccionada.'}{evidence ? <span className="block text-xs text-muted-foreground">{evidence.phase} · {date(evidence.addedAt)}</span> : null}</p></div>
      </section>
      <TextField name="comment" label="Comentario de verificación / motivo de devolución" required multiline value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Describa la revisión; para devolver indique el motivo obligatorio." />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="close"><CheckCircleIcon data-icon="inline-start" />Verificar y cerrar</Button>
        <Button variant="outline" type="submit" name="intent" value="return"><ArrowUUpLeftIcon data-icon="inline-start" />Devolver a corrección</Button>
      </div>
    </FieldGroup>
  </LiveValidatedForm>;
}
