'use client';

import { useRef } from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Panel } from '@/components/records/presentation';
import { Button } from '@/components/ui/button';
import { STATES, type Finding } from '@/domain/types';
import { transitionFinding } from '@/domain/core';
import { Correction } from './correction';
import { Verification } from './verification';

export function Workflow({ finding: f, evidenceId, onEvidenceChange }: {
  finding: Finding; evidenceId: string; onEvidenceChange: (id: string) => void;
}) {
  const d = useDemo();
  const focusReturnRef = useRef<HTMLParagraphElement | null>(null);
  const own = d.user.role === 'Responsable de corrección' && d.user.id === f.responsibleId;
  const inspector = d.user.role === 'Inspector';
  const responsible = d.data.users.find(u => u.id === f.responsibleId)?.name;
  const canVerify = inspector && f.state === 'Pendiente de verificación';
  const title = inspector ? 'Revisión del inspector' : d.user.role === 'Responsable de corrección' ? 'Corrección del responsable' : 'Seguimiento del hallazgo';
  const nextStep = f.state === 'Cerrado' ? 'Verificación completada. Consulte el respaldo y la cronología.'
    : f.state === 'Pendiente de verificación' ? 'Inspector: revisar evidencias y cerrar o devolver con comentario.'
    : f.state === 'En corrección' ? `${responsible}: registrar la acción, seleccionar evidencia y remitir.`
    : `${responsible}: iniciar la corrección.`;
  return <Panel title={title}>
    <p ref={focusReturnRef} tabIndex={-1} className="text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">{f.code} · {nextStep}</p>
    <ol className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Etapas del hallazgo">
      {STATES.map((state, index) => <li key={state} aria-current={f.state === state ? 'step' : undefined}
        className="flex items-center gap-2 text-xs text-muted-foreground aria-[current=step]:font-semibold aria-[current=step]:text-foreground">
        <span className="flex size-5 items-center justify-center rounded-full bg-muted tabular-nums">{index + 1}</span>{state}
      </li>)}
    </ol>
    {f.state === 'Abierto' && own ? <Button size="sm" className="w-fit" onClick={() => d.run(() => d.apply(data => transitionFinding(data, f.id, d.user.id, 'En corrección', { action: f.correctiveAction, evidenceId: '', comment: '' })), 'Estado actualizado: En corrección.')}><ArrowRightIcon data-icon="inline-start" />Iniciar corrección</Button> : null}
    {f.state === 'En corrección' && own ? <div className="flex flex-col items-start gap-2"><Correction finding={f} evidenceId={evidenceId} onEvidenceChange={onEvidenceChange} focusReturnRef={focusReturnRef} />{evidenceId && d.data.evidence.some(e => e.id === evidenceId && e.findingId === f.id && e.phase === 'corrección') ? <p className="max-w-full min-w-0 text-xs text-muted-foreground [overflow-wrap:anywhere]">Respaldo seleccionado para remitir: {d.data.evidence.find(e => e.id === evidenceId)?.name}</p> : null}</div> : null}
    {canVerify ? <div className="flex items-start"><Verification finding={f} focusReturnRef={focusReturnRef} /></div> : null}
  </Panel>;
}
