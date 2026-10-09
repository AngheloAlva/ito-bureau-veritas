'use client';

import { useState } from 'react';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import { LinkSimpleIcon } from '@phosphor-icons/react/dist/csr/LinkSimple';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { MAX_CUSTOM_CHARTS, type ChartSpec, type CustomChart } from '@/lib/chart-builder';
import { ChartBuilderDialog } from './chart-builder-dialog';
import { MyViews } from './my-views';
import { useCustomCharts } from './use-custom-charts';
import { PORTFOLIO } from '@/data/portfolio';
import { describeFilter, HEALTH_TONE, SITUATION_TONE } from '@/lib/portfolio-analytics';
import type { FilterKey, PortfolioFilter } from '@/lib/portfolio-analytics';
import { toneClasses, type Tone } from '@/lib/tones';
import { ClientBars } from './client-bars';
import { DecompositionTree } from './decomposition-tree';
import { DurationHistogram } from './duration-histogram';
import { HealthDonut } from './health-donut';
import { Kpis } from './kpis';
import { ProblemTable } from './problem-table';
import { ProgressCurve } from './progress-curve';
import { SituationBars } from './situation-bars';
import { usePortfolioFilter } from './use-portfolio-filter';

const chipTone = (key: FilterKey, f: PortfolioFilter): Tone => {
  if (key === 'health' && f.health) return HEALTH_TONE[f.health];
  if (key === 'situation' && f.situation) return SITUATION_TONE[f.situation];
  return key === 'bucket' ? 'teal' : key === 'clientId' ? 'violet' : 'copper';
};

function CopyLink() {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setDone(true); setTimeout(() => setDone(false), 2000); } catch { setDone(false); }
  };
  return (
    <button type="button" onClick={copy} className="inline-flex min-h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium shadow-card transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none">
      {done ? <CheckIcon size={16} aria-hidden="true" /> : <LinkSimpleIcon size={16} aria-hidden="true" />}
      <span aria-live="polite">{done ? 'Enlace copiado' : 'Copiar enlace de esta vista'}</span>
    </button>
  );
}

export function Dashboard() {
  const { filter, view, setFilter, toggle, remove, clear } = usePortfolioFilter();
  const chips = describeFilter(filter, PORTFOLIO);
  const { charts, write } = useCustomCharts();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState<CustomChart | null>(null);
  const atLimit = (charts?.length ?? 0) >= MAX_CUSTOM_CHARTS;
  const submit = (spec: ChartSpec, title: string) => {
    const list = charts ?? [];
    if (editing) write(list.map(c => (c.id === editing.id ? { ...c, spec, title } as CustomChart : c)));
    else write([...list, { id: crypto.randomUUID(), title, spec, createdAt: new Date().toISOString() }]);
    setBuilderOpen(false);
  };
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cartera de proyectos · corte 08 oct 2026</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="bv-title font-heading text-3xl font-semibold tracking-tight">Tablero ejecutivo</h1>
            <span className="rounded-full bg-tone-amber-bg px-2.5 py-0.5 text-xs font-semibold text-tone-amber-fg">Simulado · datos ficticios</span>
          </div>
          <p className="text-sm text-muted-foreground">Haga clic en cualquier elemento para filtrar todo el tablero.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => { setEditing(null); setBuilderOpen(true); }} disabled={atLimit} title={atLimit ? `Máximo ${MAX_CUSTOM_CHARTS} vistas` : undefined}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-copper px-4 text-sm font-semibold text-white shadow-card transition hover:bg-copper/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 motion-reduce:transition-none">
            <PlusIcon size={16} aria-hidden="true" />Construir gráfico
          </button>
          <CopyLink />
        </div>
      </header>

      <section aria-label="Filtros activos" className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl bg-card px-4 py-2.5 shadow-card ring-1 ring-foreground/5">
        {chips.length === 0 ? <span className="text-sm text-muted-foreground">Sin filtros · cartera completa</span> : (
          <>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filtros</span>
            {chips.map(c => {
              const t = toneClasses(chipTone(c.key, filter));
              return (
                <span key={c.key} className={`inline-flex items-center gap-1 rounded-full py-1 pl-3 pr-1 text-sm font-medium ${t.bg} ${t.fg}`}>
                  {c.label}
                  <button type="button" onClick={() => remove(c.key)} aria-label={`Quitar filtro ${c.label}`} className="flex size-6 items-center justify-center rounded-full hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-ring"><XIcon size={13} aria-hidden="true" /></button>
                </span>
              );
            })}
            <button type="button" onClick={clear} className="ml-auto rounded-full px-3 py-1 text-sm font-semibold text-copper hover:bg-copper-surface focus-visible:outline-2 focus-visible:outline-ring">Limpiar filtros</button>
          </>
        )}
      </section>

      <Kpis view={view} />
      <MyViews charts={charts} filter={filter} toggle={toggle}
        onEdit={c => { setEditing(c); setBuilderOpen(true); }} onRemove={id => write((charts ?? []).filter(c => c.id !== id))} />
      <DecompositionTree view={view} setFilter={setFilter} />
      <div className="grid gap-5 lg:grid-cols-3">
        <HealthDonut filter={filter} toggle={toggle} />
        <DurationHistogram filter={filter} toggle={toggle} />
        <SituationBars filter={filter} toggle={toggle} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <ClientBars filter={filter} toggle={toggle} />
        <ProgressCurve view={view} />
      </div>
      <ProblemTable view={view} projectId={filter.projectId} onPick={id => toggle('projectId', id)} />
      <ChartBuilderDialog open={builderOpen} onOpenChange={setBuilderOpen} filter={filter}
        editing={editing && editing.kind !== 'snapshot' ? { spec: editing.spec, title: editing.title } : null} onSubmit={submit} />
    </div>
  );
}
