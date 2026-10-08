import Link from 'next/link';
import type { indicators } from '@/domain/core';
import { Panel } from '@/components/records/presentation';

export function OperationalMetrics({ stats, scope }: { stats: ReturnType<typeof indicators>; scope: string }) {
  const metrics = [
    { count: stats.overdue, label: 'Vencidos', href: `/hallazgos?${scope}due=overdue`, note: 'Plazo anterior al 08/10 · activos' },
    { count: stats.criticalActive, label: 'Críticos activos', href: `/hallazgos?${scope}active=1&severity=Crítica`, note: 'Pueden también estar vencidos' },
    { count: stats.active, label: 'Activos', href: `/hallazgos?${scope}active=1`, note: 'Incluye correcciones por verificar' },
  ];
  return (
    <Panel title="Balance del alcance" description={`${stats.total} hallazgos · estados actuales de la cartera seleccionada, sin filtro por persona.`}>
      <dl className="flex flex-col divide-y">
        {metrics.map(metric => <div key={metric.label} className="py-4 first:pt-0">
          <dt><Link href={metric.href} className="record-link flex min-h-10 items-center justify-between gap-4"><span>{metric.label}</span><span className="text-2xl font-semibold tabular-nums">{metric.count}</span></Link></dt>
          <dd className="text-xs text-muted-foreground">{metric.note}</dd>
        </div>)}
      </dl>
      <Link className="record-link text-sm" href={`/hallazgos?${scope}state=Cerrado`}>{stats.closed} en estado Cerrado →</Link>
      <p className="text-xs text-muted-foreground">El estado se consulta aquí; el respaldo del cierre se distingue en la trazabilidad inferior. El avance físico de obra es otra magnitud.</p>
    </Panel>
  );
}
