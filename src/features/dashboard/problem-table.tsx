'use client';

import { useState } from 'react';
import Link from 'next/link';
import { problemProjects, HEALTH_TONE, type PortfolioView } from '@/lib/portfolio-analytics';
import type { Tone } from '@/lib/tones';
import { STATUS_ICON, StatusChip } from './status-chip';
import { ChartCard } from './card-shell';

const MAX = 8;
function daysPill(d: number): { tone: Tone; text: string; icon: typeof STATUS_ICON[string] } {
  if (d > 30) return { tone: 'red', text: `${d} d`, icon: STATUS_ICON['Más de 30 días'] };
  if (d > 15) return { tone: 'orange', text: `${d} d`, icon: STATUS_ICON.Atrasado };
  if (d > 0) return { tone: 'amber', text: `${d} d`, icon: STATUS_ICON.Atrasado };
  return { tone: 'sky', text: 'En riesgo', icon: STATUS_ICON['En riesgo'] };
}

export function ProblemTable({ view, projectId, onPick }: { view: PortfolioView; projectId?: string; onPick: (id: string) => void }) {
  const rows = problemProjects(view);
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, MAX);
  return (
    <ChartCard title="Proyectos con problemas" subtitle="Hitos atrasados o por vencer, ordenados por días sin cerrar." hint={null}>
      {rows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No hay proyectos con problemas en esta vista.</p> : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                {['Proyecto', 'Cliente', 'Problema', 'Días sin cerrar', 'Responsable', 'Estado', ''].map(h => <th key={h} scope="col" className="px-2 py-2 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map(r => {
                const pill = daysPill(r.daysOpen), sel = projectId === r.projectId;
                return (
                  <tr key={r.projectId} className={`border-b border-border/60 transition-colors hover:bg-muted/60 motion-reduce:transition-none ${sel ? 'bg-copper-surface' : ''}`}>
                    <td className="px-2 py-2.5">
                      <button type="button" aria-pressed={sel} onClick={() => onPick(r.projectId)} className="rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="block text-xs text-muted-foreground tabular-nums">{r.code}</span>
                        <span className="font-medium">{r.name}</span>
                      </button>
                    </td>
                    <td className="px-2 py-2.5">{r.clientShort}</td>
                    <td className="max-w-72 px-2 py-2.5 text-muted-foreground">{r.problem}</td>
                    <td className="px-2 py-2.5"><StatusChip tone={pill.tone} icon={pill.icon}>{pill.text}</StatusChip></td>
                    <td className="px-2 py-2.5">{r.responsible}</td>
                    <td className="px-2 py-2.5"><StatusChip tone={HEALTH_TONE[r.health]} icon={STATUS_ICON[r.health]}>{r.health}</StatusChip></td>
                    <td className="px-2 py-2.5 text-right">{r.operational && <Link href={`/proyectos/${r.projectId}`} className="whitespace-nowrap text-xs font-semibold text-copper underline-offset-4 hover:underline">Ver ficha</Link>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length > MAX && (
            <button type="button" onClick={() => setAll(a => !a)} className="mt-3 rounded-full border px-4 py-1.5 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
              {all ? 'Mostrar menos' : `Mostrar todos (${rows.length})`}
            </button>
          )}
        </div>
      )}
    </ChartCard>
  );
}
