'use client';

import Link from 'next/link';
import { useDemo } from '@/components/demo-provider';
import { Heading, Assets, FindingTable, Empty, date, InspectionHistory } from '@/components/records';
import { Panel } from '@/components/records/presentation';
import { Button } from '@/components/ui/button';
import { completeInspection } from '@/domain/core';
import { FindingForm } from '../forms/finding-form';
import { FormDialog } from '@/components/shared/form-dialog';
import { useRecordPreview } from '@/components/shared/record-preview';

export function InspectionDetail({ id }: { id: string }) {
  const d = useDemo();
  const preview = useRecordPreview();
  const i = d.data.inspections.find(i => i.id === id);
  if (!i) return <Empty>Inspección no encontrada. {preview ? 'Cierre esta consulta para volver al contexto.' : <Link href="/inspecciones">Volver a inspecciones</Link>}</Empty>;
  const p = d.data.projects.find(p => p.id === i.projectId)!;
  return <div className="flex flex-col gap-6">
    <Heading eyebrow={`${i.code} · ${p.code} · ${date(i.date)}`} title={i.activity} />
    <p className="text-sm text-muted-foreground"><Link className="record-link" href={`/proyectos/${p.id}`}>{p.name}</Link> · Contexto de esta inspección, independiente del selector de cartera.</p>
    <Panel title="Acta de visita">
      <dl className="grid gap-5 sm:grid-cols-2">
        <div><dt className="text-xs text-muted-foreground">Sector / especialidad</dt><dd>{i.sector} · {i.specialty}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Inspector</dt><dd>{d.data.users.find(u => u.id === i.inspectorId)?.name}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Resultado general</dt><dd>{i.result}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Estado de visita</dt><dd>{i.visitState}</dd></div>
      </dl>
      {d.user.role === 'Inspector' ? <div className="flex flex-wrap gap-3">
        {i.visitState === 'Programada' ? <Button onClick={() => d.run(() => d.apply(data => completeInspection(data, id, d.user.id)), 'Visita completada. Los hallazgos asociados conservan su estado.')}>Completar visita</Button> : null}
        <FormDialog title={`Registrar hallazgo en ${i.code}`}
          description={`${p.code} · ${p.name}. El hallazgo quedará vinculado a esta inspección.`}
          trigger={<Button variant="outline">Registrar hallazgo</Button>}>
          <FindingForm inspectionId={id} />
        </FormDialog>
      </div> : <p className="text-sm text-muted-foreground">Cambie al rol Inspector para registrar hallazgos o completar visitas.</p>}
      <p className="text-sm text-muted-foreground">Completar la visita no cierra los pendientes asociados.</p>
    </Panel>
    <InspectionHistory inspectionId={id} />
    <Panel title="Hallazgos vinculados"><FindingTable findings={d.data.findings.filter(f => f.inspectionId === id)} /></Panel>
    <Panel title="Evidencias y documentos"><Assets evidence={d.data.evidence.filter(e => e.inspectionId === id)} documents={d.data.documents.filter(doc => doc.projectId === i.projectId && (!doc.inspectionId || doc.inspectionId === id))} /></Panel>
  </div>;
}
