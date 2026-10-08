import { ClipboardTextIcon, LinkSimpleIcon, MagnifyingGlassIcon, SparkleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ANALYSIS_STAGES, type RunState } from '@/lib/analysis-run';

export function AnalysisEmpty({ scope, coverage, onStart, disabled }: {
  scope: string; coverage: string; onStart: () => void; disabled: boolean;
}) {
  return <section className="flex min-h-96 flex-col items-center justify-center gap-6 rounded-xl border bg-card px-6 py-12 text-center" aria-labelledby="analysis-empty-title">
    <div className="relative flex size-28 items-center justify-center rounded-3xl bg-muted text-muted-foreground" aria-hidden="true">
      <ClipboardTextIcon size={64} weight="light" />
      <span className="absolute -right-3 bottom-2 rounded-xl border bg-card p-3"><MagnifyingGlassIcon size={28} /></span>
      <span className="absolute -left-3 top-3 rounded-lg border bg-card p-2"><LinkSimpleIcon size={20} /></span>
    </div>
    <div className="flex max-w-lg flex-col gap-3"><h2 id="analysis-empty-title" className="text-2xl font-semibold tracking-tight">De las visitas a las prioridades</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Revisa severidad, plazos y fuentes para identificar qué requiere atención en {scope}.</p>
      <p className="text-sm font-medium tabular-nums">{coverage}</p>
    </div>
    <Button className="analysis-action" onClick={onStart} disabled={disabled}><SparkleIcon data-icon="inline-start" />Analizar registros</Button>
    <p className="text-xs text-muted-foreground">Lectura simulada de los registros · sin modificar datos</p>
  </section>;
}

export function AnalysisProgress({ state, onCancel }: { state: RunState; onCancel: () => void }) {
  const caption = ANALYSIS_STAGES[Math.min(state.stage, 3)];
  return <section className="flex flex-col gap-4 rounded-xl border bg-card p-6" aria-label="Progreso del análisis simulado">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1"><p role="status" aria-live="polite" aria-atomic="true" className="font-medium">{caption}</p>
        <p className="text-xs text-muted-foreground">Etapa {state.stage + 1} de 4 · reglas deterministas sobre esta copia de registros</p></div>
      <Button variant="outline" onClick={onCancel}>Cancelar análisis</Button>
    </div>
    <div role="progressbar" aria-label="Etapas del análisis simulado" aria-valuemin={0} aria-valuemax={4} aria-valuenow={state.stage} aria-valuetext={caption} className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div className="analysis-progress-accent h-full origin-left" style={{ transform: `scaleX(${(state.stage + 1) / 4})` }} />
    </div>
    <ol className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-4" aria-hidden="true">{ANALYSIS_STAGES.map((stage, index) => <li key={stage} className={index <= state.stage ? 'font-medium text-foreground' : ''}>{index < state.stage ? '✓ ' : `${index + 1}. `}{stage}</li>)}</ol>
  </section>;
}
