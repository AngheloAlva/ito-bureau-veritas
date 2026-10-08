'use client';

import { useState, type FormEvent } from 'react';
import { PaperclipIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { FormDialog } from '@/components/shared/form-dialog';
import { ValidatedForm, FormError } from '@/components/shared/validated-form';
import { TextField } from '@/components/shared/text-field';
import type { Evidence, Finding } from '@/domain/types';
import { addEvidenceReference } from '@/lib/evidence-reference';

export function EvidenceDialog({ finding, phase, onAdded }: {
  finding: Finding; phase: Evidence['phase']; onAdded?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return <FormDialog title={`Adjuntar respaldo de ${phase}`} description={`${finding.code} · ${finding.title}`}
    open={open} onOpenChange={setOpen}
    trigger={<Button type="button" variant="outline" size="sm"><PaperclipIcon data-icon="inline-start" />Adjuntar respaldo de {phase}</Button>}>
    {open ? <EvidenceForm finding={finding} phase={phase} onSaved={id => { onAdded?.(id); setOpen(false); }} /> : null}
  </FormDialog>;
}

function EvidenceForm({ finding, phase, onSaved }: {
  finding: Finding; phase: Evidence['phase']; onSaved: (id: string) => void;
}) {
  const d = useDemo();
  const [name, setName] = useState(`Respaldo ficticio de ${phase}`);
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      let addedId = '';
      d.apply(data => {
        const next = addEvidenceReference(data, finding.id, d.user.id, phase, name);
        addedId = next.evidence.at(-1)!.id;
        return next;
      });
      d.run(() => {}, `Respaldo de ${phase} agregado.`);
      onSaved(addedId);
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo adjuntar.'); }
  }
  return <ValidatedForm onSubmit={submit}>
    <FieldGroup>
      <FormError message={error} />
      <div className="flex items-center gap-2"><Badge variant="secondary">Simulación</Badge><span className="text-sm text-muted-foreground">Referencia de ejemplo; no carga archivos.</span></div>
      <TextField name="name" label="Nombre del respaldo" required value={name} onChange={e => setName(e.target.value)} />
      <FieldGroup className="grid sm:grid-cols-2">
        <TextField name="type" label="Tipo" value="Texto" readOnly />
        <TextField name="phase" label="Fase" value={phase} readOnly />
      </FieldGroup>
      <TextField name="reference" label="Referencia local" value="/demo/evidencia.txt" readOnly />
      <p className="text-sm text-muted-foreground">Registrado por <strong className="text-foreground">{d.user.name}</strong> · {finding.code}</p>
      <Button type="submit" className="w-fit"><PaperclipIcon data-icon="inline-start" />Adjuntar referencia</Button>
    </FieldGroup>
  </ValidatedForm>;
}
