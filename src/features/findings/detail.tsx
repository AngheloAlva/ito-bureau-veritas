'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDemo } from '@/components/demo-provider';
import { Empty } from '@/components/records';
import { FindingHero } from './hero';
import { Workflow } from './workflow';
import { Assignment } from './assignment';
import { Detection, FindingEvidence } from './evidence';
import { FindingHistory } from './history';
import { useRecordPreview } from '@/components/shared/record-preview';

export function FindingDetail({ id }: { id: string }) {
  const d = useDemo();
  const preview = useRecordPreview();
  const [selected, setSelected] = useState<{ findingId: string; evidenceId: string } | null>(null);
  const f = d.data.findings.find(f => f.id === id);
  if (!f) return <Empty>Hallazgo no encontrado. {preview ? 'Cierre esta consulta para volver al contexto.' : <Link href="/hallazgos">Volver a hallazgos</Link>}</Empty>;
  const i = d.data.inspections.find(i => i.id === f.inspectionId)!;
  const p = d.data.projects.find(p => p.id === i.projectId)!;
  const evidenceId = selected?.findingId === f.id ? selected.evidenceId : '';
  const selectEvidence = (evidenceId: string) => setSelected({ findingId: f.id, evidenceId });
  return <div className="flex flex-col gap-6">
    <FindingHero finding={f} project={p} inspection={i} />
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-6">
        <Detection finding={f} />
        <Workflow key={`${f.id}-${d.user.role}`} finding={f} evidenceId={evidenceId} onEvidenceChange={selectEvidence} />
        <FindingEvidence findingId={f.id} projectId={p.id} inspectionId={i.id} onCorrectionAdded={selectEvidence} />
      </div>
      <aside className="flex min-w-0 flex-col gap-6" aria-label="Contexto y cronología del hallazgo">
        <Assignment finding={f} />
        <FindingHistory findingId={f.id} />
      </aside>
    </div>
  </div>;
}
