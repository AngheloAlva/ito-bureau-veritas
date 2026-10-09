'use client';

import Link from 'next/link';
import { CalendarCheckIcon, WarningCircleIcon, ClockCountdownIcon, SirenIcon } from '@phosphor-icons/react';
import type { indicators } from '@/domain/core';
import { toneClasses } from '@/lib/tones';
import { useCountUp } from '@/lib/use-count-up';

type Tone = 'blue' | 'orange' | 'red' | 'copper';
function Tile({ count, label, note, href, icon: Icon, tone }: { count: number; label: string; note: string; href: string; icon: typeof ClockCountdownIcon; tone: Tone }) {
  const shown = useCountUp(count);
  const t = toneClasses(tone);
  return (
    <li className="min-w-0">
      <Link href={href} className="group relative flex h-full min-h-32 flex-col gap-3 overflow-hidden rounded-xl border bg-card p-4 shadow-card transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <span className="flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
          {label}
          <span aria-hidden="true" className={`flex size-9 items-center justify-center rounded-xl ${t.bg} ${t.fg}`}><Icon className="size-4" /></span>
        </span>
        <span className="sr-only">{count}</span>
        <span aria-hidden="true" className={`font-mono text-4xl font-semibold tabular-nums tracking-tight ${t.fg}`}>{shown}</span>
        <span className="text-xs text-muted-foreground">{note}</span>
      </Link>
    </li>
  );
}

export function OperationalMetrics({ stats, scope }: { stats: ReturnType<typeof indicators>; scope: string }) {
  const period = `from=2026-10-01&to=2026-10-08`;
  return (
    <ul aria-label="Indicadores del alcance" className="grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4">
      <Tile count={stats.inspections} label="Inspecciones del período" note="Visitas del 01 al 08 oct. 2026" href={`/inspecciones?${scope}${period}`} icon={CalendarCheckIcon} tone="blue" />
      <Tile count={stats.active} label="Hallazgos activos" note={`De ${stats.total} registrados · incluye por verificar`} href={`/hallazgos?${scope}active=1`} icon={WarningCircleIcon} tone="orange" />
      <Tile count={stats.overdue} label="Hallazgos vencidos" note="Activos con plazo anterior al 08/10" href={`/hallazgos?${scope}due=overdue`} icon={ClockCountdownIcon} tone="red" />
      <Tile count={stats.criticalActive} label="Críticos activos" note="Pueden estar también vencidos" href={`/hallazgos?${scope}active=1&severity=Cr%C3%ADtica`} icon={SirenIcon} tone="copper" />
    </ul>
  );
}
