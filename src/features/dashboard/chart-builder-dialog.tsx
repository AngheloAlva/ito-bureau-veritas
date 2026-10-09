'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CHART_TYPES, DIMENSIONS, METRICS, describeSpec, isCompatible,
  type ChartSpec, type ChartTypeId, type DimensionId, type MetricId,
} from '@/lib/chart-builder';
import type { PortfolioFilter } from '@/lib/portfolio-analytics';
import { CustomChartView } from './custom-chart';
import { specPoints } from './spec-points';

const selectCls = 'h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

function Form({ initial, initialTitle, filter, submitLabel, onSubmit, onCancel }: {
  initial: ChartSpec; initialTitle?: string; filter: PortfolioFilter; submitLabel: string;
  onSubmit: (spec: ChartSpec, title: string) => void; onCancel: () => void;
}) {
  const [spec, setSpec] = useState<ChartSpec>(initial);
  const [custom, setCustom] = useState<string | null>(initialTitle ?? null);
  const title = custom ?? describeSpec(spec);
  const compat = isCompatible(spec);
  const { points, unit } = specPoints(spec, filter);
  return (
    <>
      <div className="grid gap-5 md:grid-cols-[16rem_1fr]">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">Métrica
            <select className={selectCls} value={spec.metric} onChange={e => setSpec({ ...spec, metric: e.target.value as MetricId })}>
              {METRICS.map(m => <option key={m.id} value={m.id}>{m.label}{m.unit ? ` (${m.unit})` : ''}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">Dimensión
            <select className={selectCls} value={spec.dimension} onChange={e => setSpec({ ...spec, dimension: e.target.value as DimensionId })}>
              {DIMENSIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </label>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium">Tipo de gráfico</legend>
            <div role="radiogroup" aria-label="Tipo de gráfico" className="grid grid-cols-2 gap-1.5">
              {CHART_TYPES.map(c => (
                <button key={c.id} type="button" role="radio" aria-checked={spec.chart === c.id} onClick={() => setSpec({ ...spec, chart: c.id as ChartTypeId })}
                  className={`min-h-10 rounded-lg border px-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${spec.chart === c.id ? 'border-copper bg-copper-surface text-copper' : 'hover:bg-muted'}`}>{c.label}</button>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1.5 text-sm font-medium">Título
            <input className={selectCls} value={title} maxLength={80} onChange={e => setCustom(e.target.value)} />
          </label>
        </div>
        <div className="min-w-0 rounded-xl border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vista previa · {title || 'Sin título'}</p>
          {compat.ok ? <CustomChartView chart={spec.chart} points={points} unit={unit} ariaLabel={title} />
            : <p role="status" className="rounded-lg bg-tone-amber-bg p-3 text-sm text-tone-amber-fg">{compat.reason}</p>}
          <p className="mt-3 text-xs text-muted-foreground">La vista previa respeta los filtros activos del tablero.</p>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="button" disabled={!compat.ok || !title.trim()} onClick={() => onSubmit(spec, title.trim())}>{submitLabel}</Button>
      </DialogFooter>
    </>
  );
}

export function ChartBuilderDialog({ open, onOpenChange, filter, editing, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; filter: PortfolioFilter;
  editing?: { spec: ChartSpec; title: string } | null; onSubmit: (spec: ChartSpec, title: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar gráfico' : 'Construir gráfico'}</DialogTitle>
          <DialogDescription>Combine una métrica, una dimensión y un tipo de gráfico para agregarlo a «Mis vistas».</DialogDescription>
        </DialogHeader>
        <Form
          initial={editing?.spec ?? { metric: 'delayedMilestones', dimension: 'client', chart: 'hbar' }} initialTitle={editing?.title}
          filter={filter} submitLabel={editing ? 'Guardar cambios' : 'Agregar al tablero'} onSubmit={onSubmit} onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
