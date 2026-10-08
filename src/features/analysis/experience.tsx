'use client';

import { CheckIcon, SparkleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ANALYSIS_STAGES, type RunState } from '@/lib/analysis-run';
import { useCountUp } from '@/lib/use-count-up';

export interface ScopeCounts { inspections: number; findings: number; evidence: number; active: number; overdue: number; groups: number }

export function AnalysisEmpty({ scope, counts, onStart, disabled }: {
  scope: string; counts: ScopeCounts; onStart: () => void; disabled: boolean;
}) {
  const items = [['Inspecciones', counts.inspections], ['Hallazgos', counts.findings], ['Evidencias', counts.evidence]] as const;
  return <section className="grid gap-8 rounded-sm border bg-card p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] md:p-10" aria-labelledby="analysis-empty-title">
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col gap-3">
        <h2 id="analysis-empty-title" className="bv-title text-2xl font-semibold tracking-tight">De los registros a las prioridades</h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">El análisis lee las inspecciones, cruza severidad y plazos de cada hallazgo, revisa si tiene evidencias y agrupa lo pendiente por proyecto y especialidad. No modifica ningún registro.</p>
      </div>
      <dl className="flex flex-wrap gap-x-8 gap-y-3">{items.map(([label, value]) => <div key={label} className="flex flex-col"><dt className="text-xs text-muted-foreground">{label} en alcance</dt><dd className="font-mono text-2xl font-semibold tabular-nums">{value}</dd></div>)}</dl>
      <p className="text-sm"><span className="text-muted-foreground">Alcance:</span> <span className="font-medium">{scope}</span></p>
      <div className="flex flex-col items-start gap-2">
        <Button size="lg" className="analysis-action h-11 px-6 text-base" onClick={onStart} disabled={disabled}><SparkleIcon data-icon="inline-start" />Analizar registros</Button>
        <p className="text-xs text-muted-foreground">Análisis simulado para demostración · reglas deterministas</p>
      </div>
    </div>
    <div data-slot="analysis-illustration" className="hidden min-h-48 md:block" aria-hidden="true" />
  </section>;
}

function StepCount({ value }: { value: number }) {
  const shown = useCountUp(value, 420);
  return <span className="font-mono tabular-nums">{shown}</span>;
}

export function AnalysisProgress({ state, counts, onCancel }: { state: RunState; counts: ScopeCounts; onCancel: () => void }) {
  const caption = ANALYSIS_STAGES[Math.min(state.stage, 3)];
  const detail = [
    <><StepCount value={counts.inspections} /> inspecciones</>,
    <><StepCount value={counts.active} /> activos · <StepCount value={counts.overdue} /> vencidos</>,
    <><StepCount value={counts.evidence} /> evidencias</>,
    <><StepCount value={counts.groups} /> grupos</>,
  ];
  return <section className="analysis-scan relative flex flex-col gap-5 overflow-hidden rounded-sm border bg-card p-6" aria-label="Progreso del análisis simulado">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p role="status" aria-live="polite" aria-atomic="true" className="font-medium">{caption}…</p>
      <Button variant="outline" onClick={onCancel}>Cancelar análisis</Button>
    </div>
    <ol className="flex flex-col gap-2 text-sm">{ANALYSIS_STAGES.map((stage, index) => index <= state.stage ? <li key={stage} className="flex items-center gap-3">
      <span className={`flex size-5 items-center justify-center rounded-full ${index < state.stage ? 'bg-success-surface text-success' : 'bg-primary/10 text-primary'}`} aria-hidden="true">{index < state.stage ? <CheckIcon size={12} weight="bold" /> : <span className="size-1.5 rounded-full bg-current" />}</span>
      <span className={index < state.stage ? 'text-muted-foreground' : 'font-medium'}>{stage}</span>
      <span className="ml-auto text-xs text-muted-foreground">{detail[index]}</span>
    </li> : <li key={stage} className="flex items-center gap-3 text-muted-foreground/60"><span className="size-5 rounded-full border border-dashed" aria-hidden="true" />{stage}</li>)}</ol>
    <div className="relative flex flex-col gap-3" aria-hidden="true">
      <div className="h-16 rounded-sm bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2"><div className="h-24 rounded-sm bg-muted" /><div className="h-24 rounded-sm bg-muted" /></div>
      <div className="analysis-scan-line" />
    </div>
  </section>;
}
