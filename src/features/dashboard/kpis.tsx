'use client';

import type { ReactNode } from 'react';
import { BuildingsIcon } from '@phosphor-icons/react/dist/csr/Buildings';
import { FlagIcon } from '@phosphor-icons/react/dist/csr/Flag';
import { UsersThreeIcon } from '@phosphor-icons/react/dist/csr/UsersThree';
import { GaugeIcon } from '@phosphor-icons/react/dist/csr/Gauge';
import { ChartPieSliceIcon } from '@phosphor-icons/react/dist/csr/ChartPieSlice';
import { WarningIcon } from '@phosphor-icons/react/dist/csr/Warning';
import { EvilBarChart } from '@/components/evilcharts/charts/recharts-bar-chart';
import type { ChartConfig } from '@/components/evilcharts/ui/recharts-chart';
import { REFERENCE_DATE } from '@/domain/types';
import { PROJECT_HEALTHS } from '@/domain/portfolio';
import { portfolioKpis, situationDistribution, clientBreakdown, HEALTH_TONE, type PortfolioView } from '@/lib/portfolio-analytics';
import { toneClasses, type Tone } from '@/lib/tones';
import { PORTFOLIO } from '@/data/portfolio';
import { catTooltip, toneVar } from './chart-kit';

type Mini = { key: string; label: string; value: number; color: string };
const MINI_CONFIG: ChartConfig = { value: { label: 'Valor', colors: { light: ['var(--chart-1)'], dark: ['var(--chart-1)'] } } };

/** Tiny EvilCharts bar sparkline; identical 40px height in every KPI card. */
function MiniBars({ data, unit, label }: { data: Mini[]; unit: string; label: string }) {
  const rows = data.map(d => ({ ...d, __color: d.color }));
  return (
    <div role="img" aria-label={`${label}: ${data.map(d => `${d.label} ${d.value}`).join(', ')}`} className="h-10 w-full">
      <EvilBarChart data={rows} config={MINI_CONFIG} barRadius={3} className="size-full aspect-auto" barCategoryGap="14%"
        chartProps={{ accessibilityLayer: false, margin: { top: 2, right: 0, bottom: 0, left: 0 } }}>
        <EvilBarChart.XAxis dataKey="label" hide />
        <EvilBarChart.YAxis hide width={0} />
        {catTooltip(unit)}
        <EvilBarChart.Bar dataKey="value" barProps={{ minPointSize: 3 }} />
      </EvilBarChart>
    </div>
  );
}

function Tile({ label, tone, icon, value, context, children }: { label: string; tone: Tone; icon: ReactNode; value: ReactNode; context: string; children: ReactNode }) {
  const t = toneClasses(tone);
  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-card p-4 shadow-card ring-1 ring-foreground/5">
      <div className="flex items-center gap-2.5">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${t.bg} ${t.fg}`} aria-hidden="true">{icon}</span>
        <span className="truncate text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 truncate text-xs text-muted-foreground tabular-nums" title={context}>{context}</p>
      <div className="mt-3 flex h-10 items-center">{children}</div>
    </div>
  );
}

const quarterOf = (iso: string) => `T${Math.floor((Number(iso.slice(5, 7)) - 1) / 3) + 1} ${iso.slice(2, 4)}`;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function startedPerQuarter(view: PortfolioView): Mini[] {
  const c = new Map<string, number>();
  for (const p of [...view.projects].sort((a, b) => a.startDate.localeCompare(b.startDate))) c.set(quarterOf(p.startDate), (c.get(quarterOf(p.startDate)) ?? 0) + 1);
  return [...c].slice(-8).map(([label, value]) => ({ key: label, label: `Inicio ${label}`, value, color: toneVar('blue') }));
}

function closedPerMonth(view: PortfolioView): Mini[] {
  const [y0, m0] = REFERENCE_DATE.split('-').map(Number);
  return Array.from({ length: 8 }, (_, i) => {
    const idx = y0 * 12 + (m0 - 1) - (7 - i), y = Math.floor(idx / 12), m = idx % 12;
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    return { key, label: `Cierres ${MONTHS[m]} ${String(y).slice(2)}`, value: view.milestones.filter(x => x.actualEnd?.startsWith(key)).length, color: toneVar('teal') };
  });
}

export function Kpis({ view }: { view: PortfolioView }) {
  const k = portfolioKpis(view);
  const done = k.byHealth.Completado;
  const closed = view.milestones.filter(m => m.actualEnd).length;
  const clients = clientBreakdown(view, PORTFOLIO.clients).filter(r => r.total > 0);
  const sit = situationDistribution(view);
  const lateBuckets: Mini[] = (['Atraso 1–15 d', 'Atraso 16–30 d', 'Atraso > 30 d'] as const).map((s, i) => ({
    key: s, label: s, value: sit.find(x => x.situation === s)?.count ?? 0,
    color: ['var(--tone-orange-solid)', 'var(--tone-red-solid)', 'color-mix(in oklab, var(--tone-red-solid) 72%, black)'][i],
  }));
  const r = 17, c = 2 * Math.PI * r;
  return (
    <section aria-label="Indicadores clave" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Tile label="Proyectos" tone="blue" icon={<BuildingsIcon size={18} />} value={k.projects} context={`${k.byHealth['En curso']} en curso · ${k.byHealth.Atrasado} atrasados`}>
        <MiniBars data={startedPerQuarter(view)} unit="proyectos iniciados" label="Proyectos iniciados por trimestre" />
      </Tile>
      <Tile label="Hitos" tone="teal" icon={<FlagIcon size={18} />} value={k.milestones} context={`${closed} cerrados · ${view.milestones.length - closed} abiertos`}>
        <MiniBars data={closedPerMonth(view)} unit="hitos cerrados" label="Hitos cerrados por mes" />
      </Tile>
      <Tile label="Clientes" tone="violet" icon={<UsersThreeIcon size={18} />} value={k.clients} context={clients[0] ? `Mayor: ${clients[0].short} (${clients[0].total})` : 'Sin proyectos'}>
        <MiniBars data={clients.map(x => ({ key: x.clientId, label: x.short, value: x.total, color: toneVar('violet') }))} unit="proyectos" label="Proyectos por cliente" />
      </Tile>
      <Tile label="Estado" tone="slate" icon={<GaugeIcon size={18} />} value={k.byHealth.Atrasado} context={`atrasados de ${k.projects} proyectos`}>
        <div className="w-full">
          <span className="sr-only">{PROJECT_HEALTHS.map(h => `${h}: ${k.byHealth[h]}`).join(', ')}</span>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            {PROJECT_HEALTHS.map(h => <span key={h} className="min-w-0 transition-[flex-grow] duration-300 motion-reduce:transition-none" style={{ flexGrow: k.byHealth[h], background: toneVar(HEALTH_TONE[h]) }} />)}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] font-semibold tabular-nums" aria-hidden="true">
            {PROJECT_HEALTHS.map(h => <span key={h} className={toneClasses(HEALTH_TONE[h]).fg}>{k.byHealth[h]} <span className="font-normal text-muted-foreground">{h === 'Completado' ? 'compl.' : h === 'En curso' ? 'curso' : 'atras.'}</span></span>)}
          </div>
        </div>
      </Tile>
      <Tile label="Avance general" tone="green" icon={<ChartPieSliceIcon size={18} />} value={`${k.completionRate}%`} context={`${done}/${k.projects} completados`}>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="size-10 shrink-0 -rotate-90" role="img" aria-label={`${k.completionRate}% de proyectos completados`}>
            <circle cx="20" cy="20" r={r} fill="none" strokeWidth="5" className="stroke-muted" />
            <circle cx="20" cy="20" r={r} fill="none" strokeWidth="5" strokeLinecap="round" stroke={toneVar('green')} className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none" strokeDasharray={c} strokeDashoffset={c * (1 - k.completionRate / 100)} />
          </svg>
          <span className="text-xs leading-tight text-muted-foreground">Avance físico<br /><span className="text-sm font-semibold text-foreground tabular-nums">{k.avgProgress}%</span></span>
        </div>
      </Tile>
      <Tile label="Hitos atrasados" tone="red" icon={<WarningIcon size={18} />} value={k.delayedMilestones} context={`${k.onTimeMilestoneRate}% de hitos en plazo`}>
        <MiniBars data={lateBuckets} unit="hitos" label="Hitos atrasados por tramo" />
      </Tile>
    </section>
  );
}
