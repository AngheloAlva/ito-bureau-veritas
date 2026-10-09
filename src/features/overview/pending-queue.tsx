import Link from 'next/link';
import { pluralize } from '@/lib/format';
import type { Finding, Data } from '@/domain/types';
import { isOverdue } from '@/domain/core';
import { Badge, date, Panel } from '@/components/records/presentation';
import { ClosedCheckIllustration } from '@/components/illustrations';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

export function PendingQueue({ findings, scope, data }: { findings: Finding[]; scope: string; data: Data }) {
  const ordered = [...findings].sort((a, b) => Number(b.severity === 'Crítica') - Number(a.severity === 'Crítica') || a.dueDate.localeCompare(b.dueDate) || a.code.localeCompare(b.code));
  const renderFinding = (finding: Finding) => {
    const inspection = data.inspections.find(item => item.id === finding.inspectionId);
    const project = data.projects.find(item => item.id === inspection?.projectId);
    const reason = [isOverdue(finding) ? 'Vencido' : '', finding.severity === 'Crítica' ? 'Crítico activo' : ''].filter(Boolean).join(' · ');
    return (
      <li key={finding.id} className={`grid gap-2 py-3 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] ${finding.id === 'H-001' ? 'rounded-xl border border-copper/30 bg-copper-surface px-3 first:pt-3' : ''}`}>
        <div className="flex min-w-0 flex-col gap-2">
          <Link href={`/hallazgos/${finding.id}`} className="record-link text-sm leading-snug"><span className="mr-2 font-mono text-xs text-muted-foreground">{finding.code}</span>{finding.title}</Link>
          {finding.id === 'H-001' ? <span className="w-fit rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">Caso de demostración · empezar aquí</span> : null}
          <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-destructive">{reason}</span><Badge>{finding.state}</Badge><Badge>{finding.severity}</Badge></div>
          <details className="operational-disclosure">
            <summary>Contexto y siguiente revisión · {finding.code}</summary>
            <div className="flex flex-col gap-2 pb-2 text-xs">
              <p className="text-muted-foreground">{project?.code ?? 'Proyecto no disponible'} · {finding.specialty} · {finding.location}</p>
              <p className="text-muted-foreground">Responsable: {data.users.find(user => user.id === finding.responsibleId)?.name ?? 'Sin registro'}</p>
              <p>{finding.state === 'Pendiente de verificación' ? 'Contrastar acción y respaldo antes de verificar.' : 'Confirmar acción correctiva, respaldo y compromiso.'}</p>
            </div>
          </details>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          <span className="text-xs text-muted-foreground">Compromiso</span>
          <time className="text-sm font-semibold tabular-nums" dateTime={finding.dueDate}>{date(finding.dueDate)}</time>
          <Link className="record-link inline-flex min-h-11 items-center text-xs" href={`/inspecciones/${finding.inspectionId}`}>Visita {inspection?.code ?? 'de origen'} →</Link>
        </div>
      </li>
    );
  };
  return (
    <div className="overview-attention">
      <Panel rule title="Atención prioritaria" description={`${pluralize(findings.length, 'hallazgo único', 'hallazgos únicos')} · críticos activos primero, luego fecha compromiso. Vencimiento y severidad pueden coincidir.`} footer={<Link className="record-link text-sm min-h-11 inline-flex items-center" href={`/hallazgos?${scope}active=1`}>Consultar todos los activos →</Link>}>
        {ordered.length ? (
          <div>
            <ol className="flex flex-col divide-y">{ordered.slice(0, 5).map(renderFinding)}</ol>
            {ordered.length > 5 ? (
              <details className="operational-disclosure border-t">
                <summary>Mostrar todos los {ordered.length} hallazgos · {ordered.length - 5} restantes</summary>
                <ol start={6} className="flex flex-col divide-y">{ordered.slice(5).map(renderFinding)}</ol>
              </details>
            ) : null}
          </div>
        ) : <Empty illustration={<ClosedCheckIllustration className="h-24 w-auto" />}><EmptyHeader><EmptyTitle>Sin pendientes</EmptyTitle><EmptyDescription>Sin vencidos ni críticos activos en este alcance.</EmptyDescription></EmptyHeader></Empty>}
        <p className="text-xs text-muted-foreground">Corte: 08/10/2026</p>
      </Panel>
    </div>
  );
}
