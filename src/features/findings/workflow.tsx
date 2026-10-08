'use client';

import { useRef } from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Panel } from '@/components/records/presentation';
import { Button } from '@/components/ui/button';
import type { Finding } from '@/domain/types';
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
  const title = f.state === 'Abierto' ? 'Siguiente paso: iniciar la corrección'
    : f.state === 'En corrección' ? 'Corrección del responsable'
    : f.state === 'Pendiente de verificación' ? 'Revisión del inspector' : 'Seguimiento del hallazgo';
  const nextStep = f.state === 'Cerrado' ? 'Verificación completada. Consulte el respaldo y la cronología.'
    : f.state === 'Pendiente de verificación' ? 'Inspector: revisar evidencias y cerrar o devolver con comentario.'
    : f.state === 'En corrección' ? `${responsible}: registrar la acción, seleccionar evidencia y remitir.`
    : `Responsable de la corrección: ${responsible}.`;
  return <div id="finding-workflow" className="scroll-mt-24"><Panel title={title} rule>
    <p ref={focusReturnRef} tabIndex={-1} className="text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">{f.code} · {nextStep}</p>
    {f.state === 'Abierto' && own ? <Button size="sm" className="w-fit" data-workflow-action onClick={() => d.run(() => d.apply(data => transitionFinding(data, f.id, d.user.id, 'En corrección', { action: f.correctiveAction, evidenceId: '', comment: '' })), 'Estado actualizado: En corrección.')}><ArrowRightIcon data-icon="inline-start" />Iniciar corrección</Button> : null}
    {f.state === 'En corrección' && own ? <div className="flex flex-col items-start gap-2"><Correction finding={f} evidenceId={evidenceId} onEvidenceChange={onEvidenceChange} focusReturnRef={focusReturnRef} />{evidenceId && d.data.evidence.some(e => e.id === evidenceId && e.findingId === f.id && e.phase === 'corrección') ? <p className="max-w-full min-w-0 text-xs text-muted-foreground [overflow-wrap:anywhere]">Respaldo seleccionado para remitir: {d.data.evidence.find(e => e.id === evidenceId)?.name}</p> : null}</div> : null}
    {canVerify ? <div className="flex items-start"><Verification finding={f} focusReturnRef={focusReturnRef} /></div> : null}
  </Panel></div>;
}
