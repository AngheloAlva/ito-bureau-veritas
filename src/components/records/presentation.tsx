import type { ReactNode } from 'react';
import { CalendarCheckIcon, ClockIcon, BuildingsIcon, FilesIcon } from '@phosphor-icons/react';
import { cn } from 'cn';
import { StatusBadge, statusBadgeProps } from '@/components/shared/status-badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty as EmptyRoot, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

export { formatDate as date, formatDateTime as time } from '@/lib/format';

export function Heading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div data-slot="page-heading" className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
        <h1 className="bv-title text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  const text = typeof children === 'string' ? children.replace(/^Severidad /, '') : '';
  const { tone, icon } = statusBadgeProps(text);
  const label = ['Crítica', 'Alta', 'Media', 'Baja'].includes(text) ? `Severidad ${text}` : text;
  return <StatusBadge aria-label={label || undefined} tone={tone} icon={icon}>{children}</StatusBadge>;
}

export function Empty({ children = 'No hay registros para estos filtros.' }: { children?: ReactNode }) {
  return <EmptyRoot><EmptyHeader><EmptyTitle>Sin registros</EmptyTitle><EmptyDescription>{children}</EmptyDescription></EmptyHeader></EmptyRoot>;
}

export function Panel({ title, description, children, footer, legacy = false, rule = false }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode; legacy?: boolean; rule?: boolean }) {
  const Icon = title === 'Contexto de obra' ? BuildingsIcon : title.includes('documentos') || title.includes('Documentos') ? FilesIcon : title.includes('visita') || title.includes('Visitas') ? CalendarCheckIcon : title.includes('cierre') || title.includes('Cronología') ? ClockIcon : null;
  return (
    <section className="min-w-0">
      <Card size="sm">
        <CardHeader>
          <CardTitle><h2 className={cn('flex items-center gap-2', rule && 'bv-title')}>{Icon ? <Icon aria-hidden="true" /> : null}{title}</h2></CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent><div className={legacy ? 'legacy-content' : 'flex flex-col gap-4'}>{children}</div></CardContent>
        {footer ? <CardFooter>{footer}</CardFooter> : null}
      </Card>
    </section>
  );
}
