import Link from 'next/link';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';
import { lifecycleSteps } from '@/lib/overview-charts';

import { findingStateTone, toneClasses } from '@/lib/tones';

export function Lifecycle({ byState, total, scope }: { byState: Record<string, number>; total: number; scope: string }) {
  const steps = lifecycleSteps(byState);
  return (
    <section aria-labelledby="overview-flow" className="flex flex-col gap-3">
      <div><h2 id="overview-flow" className="bv-title mb-1.5 text-sm font-semibold">Ciclo de vida del hallazgo</h2><p className="text-xs text-muted-foreground">{total} hallazgos por estado actual. Cada paso abre la tabla filtrada; no es una tendencia.</p></div>
      <ol className="grid list-none gap-2 p-0 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-stretch">
        {steps.flatMap((step, index) => {
          const tc = toneClasses(findingStateTone[step.state]);
          const card = (
            <li key={step.state} className="min-w-0">
              <Link href={`/hallazgos?${scope}state=${encodeURIComponent(step.state)}`} className={`flex h-full flex-col gap-1 rounded-xl border bg-card p-3 shadow-card transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}>
                <span className="flex items-center gap-2 text-xs text-muted-foreground"><span aria-hidden="true" className={`size-2 rounded-full ${tc.solid}`} /><span className="font-mono">0{index + 1}</span> · {step.state}</span>
                <span className={`font-mono text-2xl font-semibold tabular-nums ${tc.fg}`}>{step.count}</span>
                <span className="text-xs text-muted-foreground">{total ? Math.round(step.count / total * 100) : 0}% del alcance</span>
              </Link>
            </li>
          );
          return index < steps.length - 1 ? [card, <li key={`a${index}`} aria-hidden="true" className="hidden items-center text-muted-foreground sm:flex"><ArrowRightIcon className="size-4" /></li>] : [card];
        })}
      </ol>
    </section>
  );
}
