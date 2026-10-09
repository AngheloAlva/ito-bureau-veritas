'use client';

import { useState } from 'react';
import Link from 'next/link';
import { problemProjects, HEALTH_TONE, type PortfolioView } from '@/lib/portfolio-analytics';
import { toneClasses, type Tone } from '@/lib/tones';
import { ChartCard } from './card-shell';

const MAX = 8;
function daysPill(d: number): { tone: Tone; text: string } {
  if (d > 30) return { tone: 'red', text: `${d} d` };
  if (d > 15) return { tone: 'orange', text: `${d} d` };
  if (d > 0) return { tone: 'amber', text: `${d} d` };
  return { tone: 'sky', text: 'En riesgo' };
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
                    <td className="px-2 py-2.5"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${toneClasses(pill.tone).bg} ${toneClasses(pill.tone).fg}`}>{pill.text}</span></td>
                    <td className="px-2 py-2.5">{r.responsible}</td>
                    <td className="px-2 py-2.5"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses(HEALTH_TONE[r.health]).bg} ${toneClasses(HEALTH_TONE[r.health]).fg}`}>{r.health}</span></td>
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
