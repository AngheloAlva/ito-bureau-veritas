'use client';

import { useDemo } from '@/components/demo-provider';
import { Assets, time } from '@/components/records';
import { Panel } from '@/components/records/presentation';
import { isActive } from '@/domain/core';
import type { Finding } from '@/domain/types';
import { EvidenceDialog } from './evidence-dialog';

export function Detection({ finding: f }: { finding: Finding }) {
  return <Panel title="Descripción del hallazgo" description={`${f.location} · ${f.specialty}`}>
    <p className="leading-relaxed">{f.description}</p>
    <p className="text-xs text-muted-foreground">Detectado el {time(f.createdAt)}</p>
    {f.correctiveAction ? <div className="flex flex-col gap-1"><h3 className="text-sm font-medium">Acción correctiva registrada</h3><p className="text-sm leading-relaxed">{f.correctiveAction}</p></div> : null}
  </Panel>;
}

export function FindingEvidence({ findingId, projectId, inspectionId, onCorrectionAdded }: {
  findingId: string; projectId: string; inspectionId: string; onCorrectionAdded: (id: string) => void;
}) {
  const d = useDemo();
  const f = d.data.findings.find(f => f.id === findingId)!;
  const inspector = d.user.role === 'Inspector';
  const own = d.user.role === 'Responsable de corrección' && d.user.id === f.responsibleId;
  return <Panel title="Evidencias y documentos">
    {isActive(f) && (inspector || own) ? <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">Respaldos asociados a {f.code}</p>
      <EvidenceDialog key={`${f.id}-${d.user.id}`} finding={f} phase={inspector ? 'detección' : 'corrección'} onAdded={own ? onCorrectionAdded : undefined} />
    </div> : null}
    <Assets evidence={d.data.evidence.filter(e => e.findingId === findingId)} documents={d.data.documents.filter(doc => doc.projectId === projectId && (!doc.inspectionId || doc.inspectionId === inspectionId))} />
  </Panel>;
}
