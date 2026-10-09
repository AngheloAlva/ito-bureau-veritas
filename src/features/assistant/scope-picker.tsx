'use client';

import { CheckCircleIcon, StackIcon } from '@phosphor-icons/react';
import { PORTFOLIO } from '@/data/portfolio';
import { cn } from 'cn';
import { projectHealthTone, toneClasses } from '@/lib/tones';

export const SCOPE_OPTIONS = PORTFOLIO.projects.filter(p => p.operational);

export function scopeLabel(scope: string): string {
  const p = SCOPE_OPTIONS.find(x => x.id === scope);
  return p ? `${p.code} · ${p.name}` : 'Cartera completa';
}

/** Visible, card-style project picker. `value` is '' for the full portfolio. */
export function ScopePicker({ value, onChange, label = 'Alcance del análisis', compact = false }: { value: string; onChange: (id: string) => void; label?: string; compact?: boolean }) {
  const options = [{ id: '', title: 'Cartera completa', sub: `${PORTFOLIO.projects.length} proyectos`, health: null as null | (typeof SCOPE_OPTIONS)[number]['health'] },
    ...SCOPE_OPTIONS.map(p => ({ id: p.id, title: `${p.code}`, sub: p.name, health: p.health }))];
  return <div role="radiogroup" aria-label={label} className={cn('grid gap-2', compact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1')}>
    {options.map(o => {
      const selected = o.id === value;
      const tone = o.health ? toneClasses(projectHealthTone[o.health]) : null;
      return <button key={o.id || 'all'} type="button" role="radio" aria-checked={selected} onClick={() => onChange(o.id)}
        className={cn('flex min-h-14 items-center gap-3 rounded-lg border bg-card p-3 text-left transition-[border-color,box-shadow,background-color] outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          selected ? 'border-primary bg-primary/5 shadow-card ring-1 ring-primary/30' : 'border-border hover:border-primary/40 hover:bg-muted/50')}>
        <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')} aria-hidden="true">
          {selected ? <CheckCircleIcon size={18} weight="fill" /> : <StackIcon size={18} />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold">{o.title}</span>
          <span className="text-xs leading-tight text-muted-foreground">{o.sub}</span>
        </span>
        {o.health && tone ? <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', tone.bg, tone.fg)}>{o.health}</span> : null}
      </button>;
    })}
  </div>;
}
