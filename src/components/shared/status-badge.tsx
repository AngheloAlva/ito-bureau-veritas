import type { ComponentType, ReactNode } from 'react';
import {
  ArrowDownIcon, ArrowsClockwiseIcon, ArrowUpIcon, CalendarBlankIcon, CheckCircleIcon, CircleDashedIcon, CircleIcon,
  ClockIcon, MinusIcon, WarningCircleIcon, WarningIcon, WarningOctagonIcon, WrenchIcon,
} from '@phosphor-icons/react';
import { cn } from 'cn';
import { toneClasses, type Tone } from '@/lib/tones';

type PhosphorIcon = ComponentType<{ className?: string; size?: number | string; 'aria-hidden'?: boolean | 'true' | 'false'; weight?: 'regular' | 'bold' | 'fill' }>;
export type StatusBadgeProps = { tone: Tone; icon?: PhosphorIcon; children: ReactNode; size?: 'sm' | 'md'; className?: string; 'aria-label'?: string };

/** Consistent status pill: tone bg + fg, 12px medium, identifying icon. */
export function StatusBadge({ tone, icon: Icon, children, size = 'md', className, ...rest }: StatusBadgeProps) {
  const c = toneClasses(tone);
  return (
    <span data-slot="status-badge" data-tone={tone} {...rest}
      className={cn('inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-medium whitespace-nowrap', size === 'sm' ? 'py-0.5' : 'py-1', c.bg, c.fg, className)}>
      {Icon ? <Icon aria-hidden="true" className={size === 'sm' ? 'size-3' : 'size-3.5'} /> : null}
      {children}
    </span>
  );
}

const HEALTH: Record<string, { tone: Tone; icon: PhosphorIcon }> = {
  Completado: { tone: 'green', icon: CheckCircleIcon },
  'En curso': { tone: 'blue', icon: ArrowsClockwiseIcon },
  Atrasado: { tone: 'red', icon: WarningCircleIcon },
  Pendiente: { tone: 'slate', icon: CircleDashedIcon },
  'En riesgo': { tone: 'amber', icon: WarningIcon },
};
export const healthBadgeProps = (health: string) => HEALTH[health] ?? { tone: 'slate' as Tone, icon: CircleDashedIcon };
export const milestoneBadgeProps = healthBadgeProps;

const OTHER: Record<string, { tone: Tone; icon: PhosphorIcon }> = {
  Abierto: { tone: 'orange', icon: CircleIcon },
  'En corrección': { tone: 'violet', icon: WrenchIcon },
  'Pendiente de verificación': { tone: 'sky', icon: ClockIcon },
  Cerrado: { tone: 'green', icon: CheckCircleIcon },
  Baja: { tone: 'slate', icon: ArrowDownIcon },
  Media: { tone: 'amber', icon: MinusIcon },
  Alta: { tone: 'orange', icon: ArrowUpIcon },
  Crítica: { tone: 'red', icon: WarningOctagonIcon },
  Programada: { tone: 'blue', icon: CalendarBlankIcon },
  Completada: { tone: 'green', icon: CheckCircleIcon },
  Finalizado: { tone: 'green', icon: CheckCircleIcon },
  Vencido: { tone: 'red', icon: WarningCircleIcon },
  'Vence hoy': { tone: 'amber', icon: ClockIcon },
  'En ejecución': { tone: 'teal', icon: ArrowsClockwiseIcon },
};
export const statusBadgeProps = (label: string) => OTHER[label] ?? HEALTH[label] ?? { tone: 'slate' as Tone, icon: CircleIcon };
