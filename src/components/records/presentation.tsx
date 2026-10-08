import type { ReactNode } from 'react';
import { CalendarCheckIcon, CheckCircleIcon, ClockIcon, CircleIcon, WrenchIcon, WarningIcon, BuildingsIcon, FilesIcon } from '@phosphor-icons/react';
import { cn } from 'cn';
import { Badge as PrimitiveBadge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty as EmptyRoot, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

export const date = (value: string) => value.split('-').reverse().join('/');
export const time = (value: string) => new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Santiago' }).format(new Date(value));

export function Heading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div data-slot="page-heading" className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      </div>
      {children}
    </div>
  );
}

const danger = new Set(['Crítica', 'Vencido']);
const warning = new Set(['Alta', 'Vence hoy']);
const success = new Set(['Cerrado', 'Completada', 'Finalizado']);
const information = new Set(['En corrección']);

export function Badge({ children }: { children: ReactNode }) {
  const text = typeof children === 'string' ? children.replace(/^Severidad /, '') : '';
  const tone = danger.has(text) ? 'danger' : warning.has(text) ? 'warning' : success.has(text) ? 'success' : information.has(text) ? 'information' : 'neutral';
  const tones = {
    danger: 'bg-destructive/10 text-destructive',
    warning: 'bg-warning-surface text-warning',
    success: 'bg-success-surface text-success',
    information: 'bg-correction-surface text-correction',
    neutral: 'bg-muted text-muted-foreground',
  };
  const Icon = danger.has(text) || text === 'Alta' ? WarningIcon : text === 'Vence hoy' || text === 'Pendiente de verificación' ? ClockIcon : text === 'En corrección' ? WrenchIcon : text === 'Programada' || text === 'Completada' ? CalendarCheckIcon : success.has(text) ? CheckCircleIcon : CircleIcon;
  const label = ['Crítica', 'Alta', 'Media', 'Baja'].includes(text) ? `Severidad ${text}` : text;
  return <PrimitiveBadge aria-label={label || undefined} variant={tone === 'danger' ? 'destructive' : 'secondary'} data-tone={tone} className={cn('px-2 py-1 text-xs tracking-normal normal-case', tones[tone])}><Icon aria-hidden="true" />{children}</PrimitiveBadge>;
}

export function Empty({ children = 'No hay registros para estos filtros.' }: { children?: ReactNode }) {
  return <EmptyRoot><EmptyHeader><EmptyTitle>Sin registros</EmptyTitle><EmptyDescription>{children}</EmptyDescription></EmptyHeader></EmptyRoot>;
}

export function Panel({ title, description, children, footer, legacy = false }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode; legacy?: boolean }) {
  const Icon = title === 'Contexto de obra' ? BuildingsIcon : title.includes('documentos') || title.includes('Documentos') ? FilesIcon : title.includes('visita') || title.includes('Visitas') ? CalendarCheckIcon : title.includes('cierre') || title.includes('Cronología') ? ClockIcon : null;
  return (
    <section className="min-w-0">
      <Card size="sm">
        <CardHeader>
          <CardTitle><h2 className="flex items-center gap-2">{Icon ? <Icon aria-hidden="true" /> : null}{title}</h2></CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent><div className={legacy ? 'legacy-content' : 'flex flex-col gap-4'}>{children}</div></CardContent>
        {footer ? <CardFooter>{footer}</CardFooter> : null}
      </Card>
    </section>
  );
}
