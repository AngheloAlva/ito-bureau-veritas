export type Tone = 'green' | 'blue' | 'red' | 'amber' | 'orange' | 'violet' | 'sky' | 'slate' | 'teal' | 'copper';

export const findingStateTone = {
  Abierto: 'orange',
  'En corrección': 'violet',
  'Pendiente de verificación': 'sky',
  Cerrado: 'green',
} as const satisfies Record<'Abierto' | 'En corrección' | 'Pendiente de verificación' | 'Cerrado', Tone>;

export const severityTone = {
  Baja: 'slate',
  Media: 'amber',
  Alta: 'orange',
  Crítica: 'red',
} as const satisfies Record<'Baja' | 'Media' | 'Alta' | 'Crítica', Tone>;

export const projectHealthTone = {
  Completado: 'green',
  'En curso': 'blue',
  Atrasado: 'red',
} as const satisfies Record<'Completado' | 'En curso' | 'Atrasado', Tone>;

export const milestoneStatusTone = {
  Completado: 'green',
  'En curso': 'blue',
  Atrasado: 'red',
  Pendiente: 'slate',
} as const satisfies Record<'Completado' | 'En curso' | 'Atrasado' | 'Pendiente', Tone>;

export type ToneClasses = { fg: string; bg: string; solid: string; border: string; fill: string; stroke: string };

// Full literal class names so Tailwind can detect them.
const classes: Record<Tone, ToneClasses> = {
  green: { fg: 'text-tone-green-fg', bg: 'bg-tone-green-bg', solid: 'bg-tone-green-solid', border: 'border-tone-green-solid/30', fill: 'fill-tone-green-solid', stroke: 'stroke-tone-green-solid' },
  blue: { fg: 'text-tone-blue-fg', bg: 'bg-tone-blue-bg', solid: 'bg-tone-blue-solid', border: 'border-tone-blue-solid/30', fill: 'fill-tone-blue-solid', stroke: 'stroke-tone-blue-solid' },
  red: { fg: 'text-tone-red-fg', bg: 'bg-tone-red-bg', solid: 'bg-tone-red-solid', border: 'border-tone-red-solid/30', fill: 'fill-tone-red-solid', stroke: 'stroke-tone-red-solid' },
  amber: { fg: 'text-tone-amber-fg', bg: 'bg-tone-amber-bg', solid: 'bg-tone-amber-solid', border: 'border-tone-amber-solid/30', fill: 'fill-tone-amber-solid', stroke: 'stroke-tone-amber-solid' },
  orange: { fg: 'text-tone-orange-fg', bg: 'bg-tone-orange-bg', solid: 'bg-tone-orange-solid', border: 'border-tone-orange-solid/30', fill: 'fill-tone-orange-solid', stroke: 'stroke-tone-orange-solid' },
  violet: { fg: 'text-tone-violet-fg', bg: 'bg-tone-violet-bg', solid: 'bg-tone-violet-solid', border: 'border-tone-violet-solid/30', fill: 'fill-tone-violet-solid', stroke: 'stroke-tone-violet-solid' },
  sky: { fg: 'text-tone-sky-fg', bg: 'bg-tone-sky-bg', solid: 'bg-tone-sky-solid', border: 'border-tone-sky-solid/30', fill: 'fill-tone-sky-solid', stroke: 'stroke-tone-sky-solid' },
  slate: { fg: 'text-tone-slate-fg', bg: 'bg-tone-slate-bg', solid: 'bg-tone-slate-solid', border: 'border-tone-slate-solid/30', fill: 'fill-tone-slate-solid', stroke: 'stroke-tone-slate-solid' },
  teal: { fg: 'text-tone-teal-fg', bg: 'bg-tone-teal-bg', solid: 'bg-tone-teal-solid', border: 'border-tone-teal-solid/30', fill: 'fill-tone-teal-solid', stroke: 'stroke-tone-teal-solid' },
  copper: { fg: 'text-tone-copper-fg', bg: 'bg-tone-copper-bg', solid: 'bg-tone-copper-solid', border: 'border-tone-copper-solid/30', fill: 'fill-tone-copper-solid', stroke: 'stroke-tone-copper-solid' },
};

export const toneClasses = (tone: Tone): ToneClasses => classes[tone];
