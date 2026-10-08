import Link from 'next/link';
import { CalendarCheckIcon, WarningCircleIcon, WrenchIcon, SealCheckIcon } from '@phosphor-icons/react';
import { Panel } from '@/components/records/presentation';
import type { overviewTraceability } from '@/lib/overview-traceability';

type Trace = ReturnType<typeof overviewTraceability>;

export function Traceability({ trace }: { trace: Trace }) {
  const stages = [
    { title: 'Visita', icon: CalendarCheckIcon, value: trace.completedVisits.length, unit: 'completadas', note: `${trace.plannedVisits.length} programadas · ${trace.visits.length} registros del período`, records: trace.visits, route: 'inspecciones' },
    { title: 'Hallazgo', icon: WarningCircleIcon, value: trace.findings.length, unit: 'relacionados', note: 'Vinculados a estas visitas; estados actuales, no producción del período.', records: trace.findings, route: 'hallazgos' },
    { title: 'Corrección', icon: WrenchIcon, value: trace.pendingCorrections.length, unit: 'por verificar', note: 'Pendientes con acción y evidencia de corrección al corte. Siguen activos.', records: trace.pendingCorrections, route: 'hallazgos' },
    { title: 'Cierre verificado', icon: SealCheckIcon, value: trace.verifiedClosures.length, unit: 'acreditados', note: 'Cerrados con respaldo y transición comentada de un inspector al corte.', records: trace.verifiedClosures, route: 'hallazgos' },
  ];
  return (
    <Panel title="De la visita al cierre" description="Visitas del 01–08 octubre 2026 y sus registros relacionados al corte del 08/10. No es un embudo ni una serie histórica; las cantidades no se suman.">
      <ol className="overview-trace">
        {stages.map(({ title, icon: Icon, value, unit, note, records, route }, index) => (
          <li key={title}>
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon aria-hidden="true" className="size-5 text-muted-foreground" /><span className="text-xs text-muted-foreground">0{index + 1}</span>{title}</h3>
            <p className="flex flex-wrap items-baseline gap-2"><strong className="text-3xl font-semibold tracking-tight tabular-nums">{value}</strong><span className="text-sm text-muted-foreground">{unit}</span></p>
            <p className="text-xs text-muted-foreground">{note}</p>
            {records.length ? <details className="text-xs">
              <summary className="record-link cursor-pointer py-3">Consultar {records.length} registros relacionados</summary>
              <ul className="flex flex-wrap gap-2 pt-2">{records.map(record => <li key={record.id}><Link className="record-link inline-flex min-h-10 items-center px-2" href={`/${route}/${record.id}`}>{record.code}</Link></li>)}</ul>
            </details> : <p className="text-xs text-muted-foreground">Sin registros que acrediten esta etapa.</p>}
          </li>
        ))}
      </ol>
    </Panel>
  );
}
