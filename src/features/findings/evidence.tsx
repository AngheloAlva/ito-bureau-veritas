'use client';

import { useDemo } from '@/components/demo-provider';
import { Assets } from '@/components/records';
import { Panel } from '@/components/records/presentation';
import { isActive } from '@/domain/core';
import { EvidenceDialog } from './evidence-dialog';

export function FindingEvidence({ findingId, projectId, inspectionId, onCorrectionAdded }: {
  findingId: string; projectId: string; inspectionId: string; onCorrectionAdded: (id: string) => void;
}) {
  const d = useDemo();
  const f = d.data.findings.find(f => f.id === findingId)!;
  const correcting = f.state === 'En corrección';
  return <Panel rule title="Evidencias y documentos">
    {isActive(f) ? <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">Respaldos asociados a {f.code}</p>
      <EvidenceDialog key={`${f.id}-${f.state}`} finding={f} phase={correcting ? 'corrección' : 'detección'} onAdded={correcting ? onCorrectionAdded : undefined} />
    </div> : null}
    <Assets evidence={d.data.evidence.filter(e => e.findingId === findingId)} documents={d.data.documents.filter(doc => doc.projectId === projectId && (!doc.inspectionId || doc.inspectionId === inspectionId))} />
  </Panel>;
}
