'use client';

import { CheckIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { concentrationMatrix } from '@/domain/analysis-matrix';
import { isActive, isOverdue } from '@/domain/core';
import type { Data } from '@/domain/types';
import { ANALYSIS_STAGES, type RunState } from '@/lib/analysis-run';
import { useCountUp } from '@/lib/use-count-up';

export interface ScopeCounts { inspections: number; findings: number; evidence: number; active: number; overdue: number; groups: number }

export function scopeCounts(data: Data, projectId: string): ScopeCounts {
  const inspections = data.inspections.filter(item => !projectId || item.projectId === projectId);
  const ids = new Set(inspections.map(item => item.id));
  const findings = data.findings.filter(item => ids.has(item.inspectionId));
  const findingIds = new Set(findings.map(item => item.id));
  return {
    inspections: inspections.length, findings: findings.length,
    evidence: data.evidence.filter(item => item.findingId && findingIds.has(item.findingId)).length,
    active: findings.filter(isActive).length, overdue: findings.filter(f => isOverdue(f)).length,
    groups: concentrationMatrix(data, projectId || undefined).cells.length,
  };
}

function StepCount({ value }: { value: number }) {
  const shown = useCountUp(value, 420);
  return <span className="font-mono tabular-nums">{shown}</span>;
}

/** Four-stage progress rendered inside an assistant chat bubble. */
export function AnalysisStages({ state, counts, onCancel }: { state: RunState; counts: ScopeCounts; onCancel: () => void }) {
  const caption = ANALYSIS_STAGES[Math.min(state.stage, 3)];
  const detail = [
    <><StepCount value={counts.inspections} /> inspecciones</>,
    <><StepCount value={counts.active} /> activos · <StepCount value={counts.overdue} /> vencidos</>,
    <><StepCount value={counts.evidence} /> evidencias</>,
    <><StepCount value={counts.groups} /> grupos</>,
  ];
  return <section className="flex w-full max-w-md flex-col gap-3 rounded-2xl rounded-tl-sm border bg-card px-4 py-3 shadow-card" aria-label="Progreso del análisis">
    <div className="flex items-center justify-between gap-3">
      <p role="status" aria-live="polite" aria-atomic="true" className="text-sm font-medium">{caption}…</p>
      <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
    </div>
    <ol className="flex flex-col gap-1.5 text-xs">{ANALYSIS_STAGES.map((stage, index) => index <= state.stage ? <li key={stage} className="flex items-center gap-2.5">
      <span className={`flex size-4 items-center justify-center rounded-full ${index < state.stage ? 'bg-success-surface text-success' : 'bg-primary/10 text-primary'}`} aria-hidden="true">{index < state.stage ? <CheckIcon size={10} weight="bold" /> : <span className="size-1.5 animate-pulse rounded-full bg-current" />}</span>
      <span className={index < state.stage ? 'text-muted-foreground' : 'font-medium'}>{stage}</span>
      <span className="ml-auto text-muted-foreground">{detail[index]}</span>
    </li> : <li key={stage} className="flex items-center gap-2.5 text-muted-foreground/60"><span className="size-4 rounded-full border border-dashed" aria-hidden="true" />{stage}</li>)}</ol>
  </section>;
}
