'use client';

import { useState } from 'react';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import { LinkSimpleIcon } from '@phosphor-icons/react/dist/csr/LinkSimple';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { MAX_CUSTOM_CHARTS, type ChartSpec, type CustomChart } from '@/lib/chart-builder';
import { ChartBuilderDialog } from './chart-builder-dialog';
import { MyViews } from './my-views';
import { useCustomCharts } from './use-custom-charts';
import { FilterDock } from './filter-dock';
import { ClientBars } from './client-bars';
import { DecompositionTree } from './decomposition-tree';
import { DurationHistogram } from './duration-histogram';
import { HealthDonut } from './health-donut';
import { Kpis } from './kpis';
import { ProblemTable } from './problem-table';
import { ProgressCurve } from './progress-curve';
import { SituationBars } from './situation-bars';
import { usePortfolioFilter } from './use-portfolio-filter';

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
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 pb-20 md:pb-0">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cartera de proyectos · corte 08 oct 2026</p>
          <h1 className="bv-title font-heading text-3xl font-semibold tracking-tight">Tablero ejecutivo</h1>
          <p className="text-sm text-muted-foreground">Haga clic en cualquier elemento para filtrar todo el tablero; administre los filtros desde el panel flotante.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => { setEditing(null); setBuilderOpen(true); }} disabled={atLimit} title={atLimit ? `Máximo ${MAX_CUSTOM_CHARTS} vistas` : undefined}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-copper px-4 text-sm font-semibold text-white shadow-card transition hover:bg-copper/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 motion-reduce:transition-none">
            <PlusIcon size={16} aria-hidden="true" />Construir gráfico
          </button>
          <CopyLink />
        </div>
      </header>

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
      <FilterDock filter={filter} setFilter={setFilter} remove={remove} clear={clear} />
      <ChartBuilderDialog open={builderOpen} onOpenChange={setBuilderOpen} filter={filter}
        editing={editing && editing.kind !== 'snapshot' ? { spec: editing.spec, title: editing.title } : null} onSubmit={submit} />
    </div>
  );
}
