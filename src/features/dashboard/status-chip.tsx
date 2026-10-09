import type { ComponentType, ReactNode } from 'react';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowsClockwise';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { CircleDashedIcon } from '@phosphor-icons/react/dist/csr/CircleDashed';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/csr/WarningCircle';
import { WarningIcon } from '@phosphor-icons/react/dist/csr/Warning';
import { WarningOctagonIcon } from '@phosphor-icons/react/dist/csr/WarningOctagon';
import { toneClasses, type Tone } from '@/lib/tones';

type Icon = ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>;

/** Shared status → icon mapping (same one used across the app). */
export const STATUS_ICON: Record<string, Icon> = {
  Completado: CheckCircleIcon, 'En curso': ArrowsClockwiseIcon, Atrasado: WarningCircleIcon, Pendiente: CircleDashedIcon,
  'En riesgo': WarningIcon, 'Más de 30 días': WarningOctagonIcon,
};

/** Rounded status chip: tone background, icon (decorative) and always-visible text. */
export function StatusChip({ tone, icon: Icon, children, className = '' }: { tone: Tone; icon: Icon; children: ReactNode; className?: string }) {
  const t = toneClasses(tone);
  return (
    <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${t.bg} ${t.fg} ${className}`}>
      <Icon size={13} aria-hidden="true" />{children}
    </span>
  );
}
