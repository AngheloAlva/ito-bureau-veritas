'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FunnelSimpleIcon } from '@phosphor-icons/react/dist/csr/FunnelSimple';
import { decompositionTree, type DecompositionDetail, type DecompositionNode, type PortfolioFilter, type PortfolioView } from '@/lib/portfolio-analytics';
import { toneClasses } from '@/lib/tones';
import { PORTFOLIO } from '@/data/portfolio';
import { ChartCard } from './card-shell';

const NODE_H = 56, GAP = 8, STRIDE = NODE_H + GAP, GUTTER = 36;
const COLUMN_TITLES = ['Proyectos', 'Estado', 'Situación del hito', 'Hito', 'Detalle'];
const fmtDate = (iso: string) => iso.split('-').reverse().join('/');

function NodeButton({ node, parentCount, selected, onSelect, onFilter }: {
  node: DecompositionNode; parentCount: number; selected: boolean; onSelect: () => void; onFilter: () => void;
}) {
  const t = toneClasses(node.tone);
  const isMs = node.level === 'milestone';
  const pct = parentCount ? Math.max(4, Math.round((node.count / parentCount) * 100)) : 0;
  return (
    <div className="relative" style={{ height: NODE_H }}>
      <button
        type="button" aria-pressed={selected} aria-expanded={node.children ? selected : undefined}
        onClick={onSelect}
        className={`group relative flex size-full flex-col justify-center overflow-hidden rounded-xl border bg-card py-1.5 pl-3 pr-10 text-left outline-none transition-[box-shadow,border-color,background-color] duration-150 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${selected ? 'border-copper bg-copper-surface/60 ring-2 ring-copper/40' : 'border-border'}`}
      >
        <span className="flex items-baseline justify-between gap-2">
          <span className={`truncate text-sm font-medium ${selected ? 'text-copper' : ''}`}>{node.label}</span>
          {!isMs && <span className="shrink-0 text-sm font-semibold tabular-nums">{node.count}</span>}
        </span>
        {isMs
          ? <span className="truncate text-xs text-muted-foreground">{node.sublabel}</span>
          : <span className="mt-1.5 h-1.5 w-full rounded-full bg-muted"><span className={`block h-full rounded-full ${t.solid}`} style={{ width: `${pct}%` }} /></span>}
        {isMs && <span className={`absolute inset-y-0 left-0 w-1 ${t.solid}`} aria-hidden="true" />}
      </button>
      {node.level !== 'root' && (
        <button
          type="button" onClick={onFilter} aria-label={`Aplicar filtro: ${node.label}`} title="Aplicar como filtro al tablero"
          className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-copper-surface hover:text-copper focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none"
        ><FunnelSimpleIcon size={15} aria-hidden="true" /></button>
      )}
    </div>
  );
}

function Connector({ fromIndex, toCount }: { fromIndex: number; toCount: number }) {
  const h = Math.max(fromIndex + 1, toCount) * STRIDE;
  const py = fromIndex * STRIDE + NODE_H / 2;
  return (
    <svg width={GUTTER} height={h} className="tree-col-in shrink-0" aria-hidden="true">
      {Array.from({ length: toCount }, (_, j) => {
        const cy = j * STRIDE + NODE_H / 2, m = GUTTER / 2;
        return <path key={j} d={`M0,${py}C${m},${py} ${m},${cy} ${GUTTER},${cy}`} fill="none" className="stroke-copper/45" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

function DetailCard({ node, onFilter }: { node: DecompositionNode; onFilter: () => void }) {
  const d = node.detail as DecompositionDetail;
  const late = d.delay > 0;
  const project = PORTFOLIO.projects.find(p => p.id === d.projectId);
  return (
    <div className="tree-col-in w-72 shrink-0 space-y-3 rounded-xl border border-copper/40 bg-card p-4 shadow-card">
      <div>
        <p className="text-sm font-semibold leading-snug">{node.label}</p>
        <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${late ? 'bg-tone-red-bg text-tone-red-fg' : 'bg-tone-green-bg text-tone-green-fg'}`}>
          {late ? `${d.delay} d de atraso` : `${-d.delay} d de holgura`}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
        <div><dt className="text-xs text-muted-foreground">Fecha planificada</dt><dd className="font-medium tabular-nums">{fmtDate(d.plannedEnd)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Fecha de corte</dt><dd className="font-medium tabular-nums">{fmtDate(d.ref)}</dd></div>
        <div className="col-span-2"><dt className="text-xs text-muted-foreground">Responsable</dt><dd className="font-medium">{d.responsible}</dd></div>
        <div className="col-span-2"><dt className="text-xs text-muted-foreground">Detalle</dt><dd>{d.note}</dd></div>
        <div className="col-span-2"><dt className="text-xs text-muted-foreground">Proyecto</dt><dd className="font-medium">{project?.code} · {d.projectName}</dd></div>
      </dl>
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={onFilter} className="rounded-full bg-copper px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-copper/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Aplicar como filtro</button>
        {project?.operational && <Link href={`/proyectos/${d.projectId}`} className="rounded-full border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">Ver proyecto</Link>}
      </div>
    </div>
  );
}

export function DecompositionTree({ view, setFilter }: { view: PortfolioView; setFilter: (p: Partial<PortfolioFilter>) => void }) {
  const root = decompositionTree(view);
  const [path, setPath] = useState<string[]>([]);

  // Resolve the selected path against the current tree (stale ids simply stop the walk).
  const chain: DecompositionNode[] = [root];
  for (const id of path) {
    const next = chain[chain.length - 1].children?.find(c => c.id === id);
    if (!next) break;
    chain.push(next);
  }
  const select = (depth: number, id: string) => setPath(p => (p[depth] === id ? p.slice(0, depth) : [...p.slice(0, depth), id]));
  const last = chain[chain.length - 1];
  const scroller = useRef<HTMLDivElement>(null);
  const depthKey = chain.length;
  useEffect(() => {
    const el = scroller.current;
    if (!el || depthKey < 2) return;
    // Reveal only the newest column with the least movement, so the root column stays visible whenever the path fits.
    const col = el.querySelector<HTMLElement>(`[data-col="${depthKey - 1}"]`);
    const x0 = el.scrollLeft;
    col?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'auto' });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && el.scrollLeft !== x0) { const to = el.scrollLeft; el.scrollLeft = x0; el.scrollTo({ left: to, behavior: 'smooth' }); }
  }, [depthKey]);
  const indexIn = (depth: number) => (depth === 0 ? 0 : (chain[depth - 1].children ?? []).indexOf(chain[depth]));

  return (
    <ChartCard title="Árbol de descomposición" subtitle="Seleccione un elemento para abrir el siguiente nivel; use el embudo para filtrar todo el tablero." hint={null}>
      {view.projects.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No hay proyectos en esta vista.</p> : (
        <div ref={scroller} className="-mx-1 overflow-x-auto px-1 pb-3" tabIndex={0} role="region" aria-label="Árbol de descomposición (desplazable)">
          <div className="flex min-w-max items-start">
            <div className="w-56 shrink-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{COLUMN_TITLES[0]}</p>
              <NodeButton node={root} parentCount={root.count} selected onSelect={() => setPath([])} onFilter={() => undefined} />
            </div>
            {chain.map((node, depth) => {
              const kids = node.children ?? [];
              if (!kids.length) return null;
              const sel = chain[depth + 1];
              return (
                <div key={node.id} className="flex items-start">
                  <div className="mt-6"><Connector fromIndex={indexIn(depth)} toCount={kids.length} /></div>
                  <div data-col={depth + 1} className="tree-col-in w-56 shrink-0 sm:w-60">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{COLUMN_TITLES[depth + 1]}</p>
                    <div className="flex flex-col" style={{ gap: GAP }}>
                      {kids.map(k => (
                        <NodeButton key={k.id} node={k} parentCount={node.level === 'root' ? node.count : kids.reduce((a, c) => a + c.count, 0)} selected={sel?.id === k.id}
                          onSelect={() => select(depth, k.id)} onFilter={() => setFilter(k.filter)} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            {last.detail && (
              <div className="flex items-start">
                <div className="mt-6"><Connector fromIndex={indexIn(chain.length - 1)} toCount={1} /></div>
                <div data-col={chain.length}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{COLUMN_TITLES[4]}</p>
                  <DetailCard node={last} onFilter={() => setFilter(last.filter)} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
