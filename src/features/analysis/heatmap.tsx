import type { Data } from '@/domain/types';
import { concentrationMatrix } from '@/domain/analysis-matrix';
import { Panel } from '@/components/records/presentation';

function tint(count: number, max: number) {
  const ratio = max ? count / max : 0;
  const pct = Math.round(10 + ratio * 50);
  return { backgroundColor: `color-mix(in srgb, var(--brand-blue) ${pct}%, transparent)`, color: pct > 45 ? '#fff' : 'var(--brand-blue)' };
}

export function ConcentrationHeatmap({ data, projectId }: { data: Data; projectId?: string }) {
  const matrix = concentrationMatrix(data, projectId);
  const cell = (pid: string, specialty: string) => matrix.cells.find(c => c.projectId === pid && c.specialty === specialty);
  return <Panel rule title="Concentración de pendientes" description="Hallazgos activos por proyecto y especialidad. Revisar responsables y evidencias donde se acumulan.">
    {matrix.cells.length ? <>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-sm">
          <caption className="sr-only">Hallazgos activos por proyecto y especialidad, con cantidad de vencidos</caption>
          <thead><tr><th scope="col" className="p-1 text-left text-xs font-medium text-muted-foreground"><span className="sr-only">Proyecto</span></th>
            {matrix.specialties.map(s => <th key={s} scope="col" className="p-1 text-center text-xs font-medium text-muted-foreground">{s}</th>)}</tr></thead>
          <tbody>{matrix.projects.map(p => <tr key={p.id}>
            <th scope="row" className="w-64 min-w-40 p-1 text-left align-middle font-normal"><span className="block font-mono text-xs tabular-nums">{p.code}</span><span className="block max-w-56 truncate text-xs text-muted-foreground" title={p.name}>{p.name}</span></th>
            {matrix.specialties.map(s => { const c = cell(p.id, s); return c
              ? <td key={s} className="h-14 min-w-20 rounded-sm text-center align-middle" style={tint(c.active, matrix.max)}>
                <span className="block font-mono text-base font-semibold tabular-nums">{c.active}</span>
                {c.overdue ? <span className="block text-[11px] font-medium" aria-hidden="true">{c.overdue} {c.overdue === 1 ? 'vencido' : 'vencidos'}</span> : null}
                <span className="sr-only">{c.active === 1 ? ' activo' : ' activos'}{c.overdue ? `, ${c.overdue} ${c.overdue === 1 ? 'vencido' : 'vencidos'}` : ''}</span></td>
              : <td key={s} className="h-14 rounded-sm bg-muted/50 text-center align-middle text-muted-foreground"><span aria-hidden="true">·</span><span className="sr-only">Sin pendientes</span></td>; })}
          </tr>)}</tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground" aria-hidden="true">
        <span className="flex items-center gap-2">Menos<span className="h-2 w-20 rounded-sm" style={{ backgroundImage: 'linear-gradient(90deg, color-mix(in srgb, var(--brand-blue) 10%, transparent), color-mix(in srgb, var(--brand-blue) 60%, transparent))' }} />Más</span>
      </div>
    </> : <p className="text-sm text-muted-foreground">Sin pendientes activos en este alcance.</p>}
  </Panel>;
}
