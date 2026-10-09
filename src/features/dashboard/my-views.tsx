'use client';

import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { metricUnit, type CustomChart, type SnapshotArtifact } from '@/lib/chart-builder';
import type { PortfolioFilter } from '@/lib/portfolio-analytics';
import { CustomChartView, type ChartPoint, type LineSeries } from './custom-chart';
import { specPoints } from './spec-points';
import type { ToggleFn } from './types';

function snapshotProps(a: SnapshotArtifact): { chart: 'bar' | 'hbar' | 'donut' | 'line'; points: ChartPoint[]; unit?: string; series?: LineSeries[]; seriesLabels?: string[] } {
  if (a.kind === 'line') {
    return {
      chart: 'line', points: a.points.map(p => ({ key: p.label, label: p.label, value: p.actual ?? p.planned })),
      series: [{ name: 'Programado', values: a.points.map(p => p.planned), dashed: true }, { name: 'Real', values: a.points.map(p => p.actual) }],
      seriesLabels: ['Programado (línea punteada)', 'Real (línea continua)'],
    };
  }
  const points = a.series.map(s => ({ key: s.label, label: s.label, value: s.value, tone: s.tone }));
  if (a.kind === 'donut') return { chart: 'donut', points };
  return { chart: a.orientation === 'horizontal' ? 'hbar' : 'bar', points, unit: a.unit };
}

function ViewCard({ chart, filter, toggle, onEdit, onRemove }: {
  chart: CustomChart; filter: PortfolioFilter; toggle: ToggleFn; onEdit: () => void; onRemove: () => void;
}) {
  const snap = chart.kind === 'snapshot';
  return (
    <Card className="[--card-spacing:--spacing(5)]">
      <div className="flex items-start justify-between gap-3 px-(--card-spacing)">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold">{chart.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{snap ? 'Fijado desde el asistente · instantánea' : 'Creado por usted'}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {!snap && <Button type="button" variant="ghost" size="sm" onClick={onEdit} aria-label={`Editar ${chart.title}`}><PencilSimpleIcon data-icon="inline-start" />Editar</Button>}
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Quitar ${chart.title}`}><TrashIcon data-icon="inline-start" />Quitar</Button>
        </div>
      </div>
      <div className="min-w-0 flex-1 px-(--card-spacing)">
        {chart.kind === 'snapshot'
          ? <CustomChartView {...snapshotProps(chart.artifact)} ariaLabel={chart.title} />
          : (() => { const { points, unit } = specPoints(chart.spec, filter, toggle); return <CustomChartView chart={chart.spec.chart} points={points} unit={unit || metricUnit(chart.spec.metric)} ariaLabel={chart.title} />; })()}
      </div>
    </Card>
  );
}

export function MyViews({ charts, filter, toggle, onEdit, onRemove }: {
  charts: CustomChart[] | null; filter: PortfolioFilter; toggle: ToggleFn; onEdit: (c: CustomChart) => void; onRemove: (id: string) => void;
}) {
  if (!charts || charts.length === 0) return null;
  return (
    <section aria-labelledby="mis-vistas" className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <h2 id="mis-vistas" className="font-heading text-xl font-semibold">Mis vistas</h2>
        <p className="text-sm text-muted-foreground">Gráficos propios guardados en este navegador. Respetan los filtros activos.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {charts.map(c => <ViewCard key={c.id} chart={c} filter={filter} toggle={toggle} onEdit={() => onEdit(c)} onRemove={() => onRemove(c.id)} />)}
      </div>
    </section>
  );
}
