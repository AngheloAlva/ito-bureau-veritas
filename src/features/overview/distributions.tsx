import Link from 'next/link';
import { Empty, Panel } from '@/components/records/presentation';
import { SEVERITIES } from '@/domain/types';
import type { projectBreakdown } from '@/lib/overview-charts';

const sevColor: Record<string, string> = { Baja: 'bg-muted-foreground/40', Media: 'bg-brand-sky', Alta: 'bg-warning', Crítica: 'bg-destructive' };

export function SeverityChart({ counts, total, scope }: { counts: Record<string, number>; total: number; scope: string }) {
  const summary = SEVERITIES.map(s => `${s}: ${counts[s] ?? 0}`).join(', ');
  return (
    <Panel rule title="Por severidad" description={`${total} hallazgos · distribución actual`}>
      {total ? <>
        <div role="img" aria-label={`Hallazgos por severidad. ${summary}. Total ${total}.`} className="flex gap-0.5">
          {SEVERITIES.map(s => counts[s] ? (
            <div key={s} className="flex min-w-6 flex-col items-center gap-1" style={{ flex: `${counts[s]} 1 0%` }}>
              <span className="font-mono text-xs font-semibold tabular-nums">{counts[s]}</span>
              <span className={`h-4 w-full rounded-sm ${sevColor[s]}`} />
            </div>
          ) : null)}
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
          {SEVERITIES.map(s => <li key={s}><Link href={`/hallazgos?${scope}severity=${encodeURIComponent(s)}`} className="record-link flex min-h-9 items-center gap-2 text-sm"><span aria-hidden="true" className={`size-2.5 rounded-sm ${sevColor[s]}`} />{s}</Link></li>)}
        </ul>
      </> : <Empty>Sin hallazgos en este alcance.</Empty>}
    </Panel>
  );
}

export function ProjectChart({ rows }: { rows: ReturnType<typeof projectBreakdown> }) {
  const max = Math.max(1, ...rows.map(r => r.active + r.closed));
  const summary = rows.map(r => `${r.code}: ${r.active} activos, ${r.closed} cerrados`).join('; ');
  return (
    <Panel rule title="Por proyecto" description="Activos frente a cerrados · conteo actual">
      {rows.some(r => r.active + r.closed) ? <>
        <ul role="img" aria-label={`Hallazgos por proyecto. ${summary}.`} className="flex list-none flex-col gap-3 p-0">
          {rows.map(r => (
            <li key={r.id} className="flex flex-col gap-1">
              <Link href={`/hallazgos?project=${encodeURIComponent(r.id)}`} className="record-link flex min-h-8 items-baseline justify-between gap-3 text-sm"><span><span className="font-mono text-xs">{r.code}</span> <span className="text-muted-foreground">{r.name}</span></span><span className="font-mono tabular-nums">{r.active + r.closed}</span></Link>
              <div aria-hidden="true" className="flex gap-0.5" style={{ width: `${(r.active + r.closed) / max * 100}%` }}>
                {[{ n: r.active, c: 'bg-primary' }, { n: r.closed, c: 'bg-success' }].map(({ n, c }) => n ? <div key={c} className="flex min-w-6 flex-col items-center gap-0.5" style={{ flex: `${n} 1 0%` }}><span className="font-mono text-xs font-semibold tabular-nums">{n}</span><span className={`h-2.5 w-full rounded-sm ${c}`} /></div> : null)}
              </div>
            </li>
          ))}
        </ul>
        <p aria-hidden="true" className="flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-primary" />Activos</span><span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-success" />Cerrados</span></p>
      </> : <Empty>Sin hallazgos en este alcance.</Empty>}
    </Panel>
  );
}
