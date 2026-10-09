import type { ReactNode } from 'react';
import { BuildingsIcon } from '@phosphor-icons/react/dist/csr/Buildings';
import { FlagIcon } from '@phosphor-icons/react/dist/csr/Flag';
import { UsersThreeIcon } from '@phosphor-icons/react/dist/csr/UsersThree';
import { GaugeIcon } from '@phosphor-icons/react/dist/csr/Gauge';
import { ChartPieSliceIcon } from '@phosphor-icons/react/dist/csr/ChartPieSlice';
import { WarningIcon } from '@phosphor-icons/react/dist/csr/Warning';
import { portfolioKpis, HEALTH_TONE, type PortfolioView } from '@/lib/portfolio-analytics';
import { PROJECT_HEALTHS } from '@/domain/portfolio';
import { toneClasses, type Tone } from '@/lib/tones';

function Tile({ label, tone, icon, value, sub, children }: { label: string; tone: Tone; icon: ReactNode; value: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  const t = toneClasses(tone);
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl bg-card p-4 shadow-card ring-1 ring-foreground/5">
      <div className="flex items-center gap-2.5">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${t.bg} ${t.fg}`} aria-hidden="true">{icon}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={`text-3xl font-semibold leading-none tabular-nums ${t.fg}`}>{value}</span>
        {children}
      </div>
      {sub && <p className="-mt-1 text-xs text-muted-foreground tabular-nums">{sub}</p>}
    </div>
  );
}

export function Kpis({ view }: { view: PortfolioView }) {
  const k = portfolioKpis(view);
  const done = k.byHealth.Completado;
  const r = 15, c = 2 * Math.PI * r;
  return (
    <section aria-label="Indicadores clave" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Tile label="Proyectos" tone="blue" icon={<BuildingsIcon size={18} />} value={k.projects} />
      <Tile label="Hitos" tone="teal" icon={<FlagIcon size={18} />} value={k.milestones} />
      <Tile label="Clientes" tone="violet" icon={<UsersThreeIcon size={18} />} value={k.clients} />
      <Tile label="Estado de proyectos" tone="slate" icon={<GaugeIcon size={18} />} value={<span className="sr-only">{PROJECT_HEALTHS.map(h => `${h}: ${k.byHealth[h]}`).join(', ')}</span>}>
        <div className="w-full">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            {PROJECT_HEALTHS.map(h => <span key={h} className={`${toneClasses(HEALTH_TONE[h]).solid} transition-[flex-grow] duration-300 motion-reduce:transition-none`} style={{ flexGrow: k.byHealth[h] }} />)}
          </div>
          <div className="mt-2 flex justify-between text-xs font-semibold tabular-nums">
            {PROJECT_HEALTHS.map(h => <span key={h} className={toneClasses(HEALTH_TONE[h]).fg} title={h}>{k.byHealth[h]}</span>)}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>Compl.</span><span>En curso</span><span>Atras.</span></div>
        </div>
      </Tile>
      <Tile label="Avance general" tone="green" icon={<ChartPieSliceIcon size={18} />} value={`${k.completionRate}%`} sub={`${done}/${k.projects} completados · avance físico ${k.avgProgress}%`}>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 40 40" className="size-10 -rotate-90 shrink-0" aria-hidden="true">
            <circle cx="20" cy="20" r={r} fill="none" strokeWidth="5" className="stroke-muted" />
            <circle cx="20" cy="20" r={r} fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-tone-green-solid transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none" strokeDasharray={c} strokeDashoffset={c * (1 - k.completionRate / 100)} />
          </svg>
        </div>
      </Tile>
      <Tile label="Hitos atrasados" tone="red" icon={<WarningIcon size={18} />} value={k.delayedMilestones} sub={`${k.onTimeMilestoneRate}% de hitos en plazo`} />
    </section>
  );
}
