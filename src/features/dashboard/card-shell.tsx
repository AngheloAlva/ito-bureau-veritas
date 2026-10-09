import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

/** Consistent card header: title, one-line subtitle and optional "Filtrado por" hint. */
export function ChartCard({ title, subtitle, hint, className, children }: {
  title: string; subtitle: string; hint?: string | null; className?: string; children: ReactNode;
}) {
  return (
    <Card className={`[--card-spacing:--spacing(5)] ${className ?? ''}`}>
      <div className="px-(--card-spacing)">
        <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        <p className="mt-1 min-h-4 text-xs font-medium text-copper">{hint ? `Filtrado por ${hint}` : ''}</p>
      </div>
      <div className="min-w-0 flex-1 px-(--card-spacing)">{children}</div>
    </Card>
  );
}

export const dim = (selected: boolean, any: boolean) => (any && !selected ? 'opacity-35' : 'opacity-100');
