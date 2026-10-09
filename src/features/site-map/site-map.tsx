'use client';

import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { useDemo } from '@/components/demo-provider';
import { Heading } from '@/components/records/presentation';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PORTFOLIO } from '@/data/portfolio';
import { isOverdue } from '@/domain/core';
import type { Data } from '@/domain/types';
import type { Milestone, ProjectHealth } from '@/domain/portfolio';
import { formatDate } from '@/lib/format';
import { milestoneDelay } from '@/lib/portfolio-analytics';
import { SITE_COMPONENTS, componentFindings, componentStatus, type ComponentStatus, type SiteComponent } from '@/lib/site-map';
import { findingStateTone, milestoneStatusTone, projectHealthTone, severityTone, toneClasses, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { BasinArt, GalleryArt, GaugeArt, INK, PlantArt, Plate, PumpArt, SiteDefs, TankArt, ValveArt } from './art';

type Layers = { findings: boolean; milestones: boolean; flow: boolean };
const STATUS_TEXT: Record<ComponentStatus, string> = { critical: 'punto crítico', warning: 'requiere atención', ok: 'sin observaciones' };
const STATUS_TONE: Record<ComponentStatus, Tone> = { critical: 'red', warning: 'amber', ok: 'green' };
const ZONES = [
  { projectId: 'p1', x: 140, w: 380, short: 'Estación de bombeo EB-01' },
  { projectId: 'p3', x: 545, w: 305, short: 'Conducción de agua industrial' },
  { projectId: 'p2', x: 870, w: 165, short: 'Galería de servicios' },
] as const;
const ZONE_TOP = 142, ZONE_H = 295, PIPE_Y = 430;
// Marker anchor (centre x, y) per component.
const ANCHOR: Record<string, [number, number]> = {
  j101: [200, 322], j102: [285, 294], j103: [370, 322], tk101: [462, 262],
  v301: [600, 350], v302: [792, 350], pi310: [685, 232], pl300: [700, 514], gal201: [945, 316],
};

function currentMilestone(milestones: Milestone[]): Milestone | undefined {
  const sorted = [...milestones].sort((a, b) => a.seq - b.seq);
  return sorted.find(m => m.status === 'En curso' || m.status === 'Atrasado') ?? sorted.find(m => m.status === 'Pendiente') ?? sorted.at(-1);
}
const delayText = (m: Milestone) => { const d = milestoneDelay(m); return d > 0 ? `+${d} d` : `${-d} d`; };
const trunc = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function projectInfo(data: Data, projectId: string) {
  const live = data.projects.find(p => p.id === projectId);
  const port = PORTFOLIO.projects.find(p => p.id === projectId);
  const milestone = currentMilestone(PORTFOLIO.milestones.filter(m => m.projectId === projectId));
  const active = SITE_COMPONENTS.filter(c => c.projectId === projectId).reduce((n, c) => n + componentFindings(data, c.id).length, 0);
  return { live, port, milestone, active, health: (port?.health ?? 'En curso') as ProjectHealth };
}

function Pipe({ d, flow }: { d: string; flow: boolean }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth="17" />
      <path d={d} stroke={flow ? '#27b5a5' : '#dbe6f3'} strokeWidth="10" />
      <path d={d} stroke="#ffffff" strokeOpacity={flow ? 0.85 : 0} strokeWidth="2.6" strokeDasharray="3 17" className={flow ? 'sm-flow' : undefined} />
    </g>
  );
}

function Marker({ status, x, y }: { status: ComponentStatus; x: number; y: number }) {
  if (status === 'ok') return null;
  if (status === 'warning') {
    return (
      <g transform={`translate(${x} ${y})`} aria-hidden="true">
        <circle r="9" fill="#fff" stroke="#d99a1b" strokeWidth="1.5" /><circle r="5" fill="#e0a21b" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <rect x="-60" y="-11" width="120" height="22" rx="11" fill="#c0392b" filter="url(#sm-card-shadow)" />
      <circle cx="-46" cy="0" r="4" fill="#fff" />
      <circle cx="-46" cy="0" r="4" fill="none" stroke="#fff" strokeWidth="1.5" className="sm-pulse" />
      <text x="-36" y="3.4" fontSize="9" fontWeight="700" letterSpacing="1" fill="#fff">PUNTO CRÍTICO</text>
    </g>
  );
}

function Hotspot({ component, status, count, selectedId, onSelect, hitbox, layers, children }: {
  component: SiteComponent; status: ComponentStatus; count: number; selectedId: string | null; onSelect: (id: string) => void;
  hitbox: [number, number, number, number]; layers: Layers; children: ReactNode;
}) {
  const [x, y, w, h] = hitbox;
  const select = () => onSelect(component.id);
  const onKey = (e: KeyboardEvent<SVGGElement>) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } };
  const project = SITE_COMPONENTS.find(c => c.id === component.id)!.projectId.toUpperCase().replace('P', 'P-00');
  const [ax, ay] = ANCHOR[component.id];
  return (
    <g>
      <g
        id={`sm-c-${component.id}`} role="button" tabIndex={0} onClick={select} onKeyDown={onKey}
        aria-pressed={selectedId === component.id}
        aria-label={`${component.name}, proyecto ${project}: ${STATUS_TEXT[status]}, ${count === 1 ? '1 hallazgo activo' : `${count} hallazgos activos`}. Abrir detalle.`}
        className={cn('sm-comp', selectedId && selectedId !== component.id && 'sm-dim')}
      >
        <rect x={x} y={y} width={w} height={h} rx="10" fill="transparent" />
        {children}
        <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx="12" fill="none" stroke="#1d3b6e" strokeWidth="2.5" strokeDasharray="5 4" className="sm-ring" />
      </g>
      {layers.findings && <g className={cn('sm-marker', selectedId && selectedId !== component.id && 'sm-dim')}><Marker status={status} x={ax} y={ay} /></g>}
    </g>
  );
}

function ZoneCard({ zone, data, dim, layers }: { zone: (typeof ZONES)[number]; data: Data; dim: boolean; layers: Layers }) {
  const { live, port, milestone, active, health } = projectInfo(data, zone.projectId);
  const t = projectHealthTone[health];
  const chipW = health.length * 5.4 + 18;
  const { x, w } = zone;
  return (
    <g className={cn('sm-zone', dim && 'sm-dim')}>
      <rect x={x} y={ZONE_TOP} width={w} height={ZONE_H} rx="22" fill="#ffffff" fillOpacity="0.55" stroke="#c4d1e2" strokeWidth="1.4" strokeDasharray="7 6" />
      <g filter="url(#sm-card-shadow)">
        <rect x={x} y="34" width={w} height="96" rx="14" fill="#fff" stroke="#d5deea" />
      </g>
      <rect x={x} y="34" width="5" height="96" rx="2.5" fill="#1d3b6e" />
      <text x={x + 18} y="58" fontSize="14" fontWeight="700" letterSpacing="1.6" fill={INK}>{live?.code ?? zone.projectId.toUpperCase()}</text>
      <g transform={`translate(${x + w - chipW - 14} 44)`}>
        <rect width={chipW} height="20" rx="10" style={{ fill: `var(--tone-${t}-bg)` }} />
        <text x={chipW / 2} y="13.5" textAnchor="middle" fontSize="9.5" fontWeight="700" letterSpacing="0.6" style={{ fill: `var(--tone-${t}-fg)` }}>{health.toUpperCase()}</text>
      </g>
      <text x={x + 18} y="76" fontSize="11" fill="#566782">{zone.short}</text>
      <text x={x + 18} y="98" fontSize="8.5" fontWeight="600" letterSpacing="1.2" fill="#6b7b93">AVANCE FÍSICO</text>
      <text x={x + w - 16} y="99" textAnchor="end" fontSize="14" fontWeight="700" fill={INK}>{live?.physicalProgress ?? port?.progress ?? 0} %</text>
      <text x={x + 18} y="119" fontSize="8.5" fontWeight="600" letterSpacing="1.2" fill="#6b7b93">HALLAZGOS ACTIVOS</text>
      <text x={x + w - 16} y="120" textAnchor="end" fontSize="14" fontWeight="700" fill={active > 0 ? '#b0301f' : INK}>{active}</text>
      {layers.milestones && milestone && (() => {
        const d = milestoneDelay(milestone);
        const late = d > 0 && milestone.status !== 'Completado';
        const col = late ? 'red' : 'green';
        const pw = delayText(milestone).length * 6 + 16;
        return (
          <g transform={`translate(${x} 458)`}>
            <line x1="22" x2="22" y1="-18" y2="0" stroke={INK} strokeWidth="2" />
            <g filter="url(#sm-card-shadow)"><rect width={w} height="52" rx="12" fill="#fff" stroke="#d5deea" /></g>
            <rect width="5" height="52" rx="2.5" style={{ fill: `var(--tone-${col}-solid)` }} />
            <text x="18" y="21" fontSize="8.5" fontWeight="700" letterSpacing="1.2" fill="#6b7b93">HITO EN CURSO</text>
            <g transform={`translate(${w - pw - 12} 9)`}>
              <rect width={pw} height="18" rx="9" style={{ fill: `var(--tone-${col}-bg)` }} />
              <text x={pw / 2} y="12.5" textAnchor="middle" fontSize="10" fontWeight="700" style={{ fill: `var(--tone-${col}-fg)` }}>{delayText(milestone)}</text>
            </g>
            <text x="18" y="40" fontSize="11" fontWeight="600" fill={INK}>{trunc(milestone.name, Math.floor((w - 32) / 5.8))}<title>{milestone.name}</title></text>
          </g>
        );
      })()}
    </g>
  );
}

function Diagram({ data, selectedId, onSelect, layers }: { data: Data; selectedId: string | null; onSelect: (id: string) => void; layers: Layers }) {
  const info = useMemo(() => Object.fromEntries(SITE_COMPONENTS.map(c => [c.id, { status: componentStatus(data, c.id), count: componentFindings(data, c.id).length }])), [data]);
  const comp = (id: string) => SITE_COMPONENTS.find(c => c.id === id)!;
  const props = (id: string, hitbox: [number, number, number, number]) => ({ component: comp(id), ...info[id], selectedId, onSelect, hitbox, layers });
  const dimPlain = selectedId !== null;
  return (
    <svg viewBox={`0 0 1200 ${layers.milestones ? 530 : 470}`} role="group" aria-labelledby="sm-title sm-desc" className="block h-auto w-full min-w-[960px] select-none font-sans">
      <title id="sm-title">Diagrama del sistema de agua industrial</title>
      <desc id="sm-desc">Captación, estación de bombeo, conducción de agua industrial, galería de servicios y planta concentradora, con los equipos de cada proyecto.</desc>
      <SiteDefs />
      {ZONES.map(z => <ZoneCard key={z.projectId} zone={z} data={data} dim={dimPlain && comp(selectedId!).projectId !== z.projectId} layers={layers} />)}

      <g transform="translate(0 -85)">
      <g aria-hidden="true">
        <Pipe d={`M95 ${PIPE_Y} H520`} flow={layers.flow} />
        <Pipe d={`M880 ${PIPE_Y} H1075`} flow={layers.flow} />
        {[200, 285, 370].map(x => <Pipe key={x} d={`M${x + 24} ${PIPE_Y} V396`} flow={layers.flow} />)}
        <Pipe d={`M685 ${PIPE_Y} V386`} flow={layers.flow} />
      </g>
      <g aria-hidden="true" className={cn(dimPlain && 'sm-dim-soft')}>
        <g transform="translate(65 452)"><BasinArt /></g>
        <Plate x={65} y={484}>Captación</Plate>
        <g transform="translate(1115 452)"><PlantArt /></g>
        <Plate x={1115} y={484}>Planta concentradora</Plate>
      </g>

      {/* P-001 */}
      {[['j101', 200], ['j102', 285], ['j103', 370]].map(([id, x]) => (
        <Hotspot key={id} {...props(id as string, [(x as number) - 44, 342, 96, 74])}>
          <g transform={`translate(${x} 412)`}><PumpArt /></g>
          <Plate x={x as number} y={466}>{comp(id as string).label}</Plate>
        </Hotspot>
      ))}
      <Hotspot {...props('tk101', [420, 284, 84, 150])}>
        <g transform="translate(462 420)"><TankArt /></g>
        <Plate x={462} y={466}>TK-101</Plate>
      </Hotspot>

      {/* P-003 */}
      <Hotspot {...props('pl300', [525, 405, 350, 50])}>
        <Pipe d={`M520 ${PIPE_Y} H880`} flow={layers.flow} />
        <rect x="525" y="405" width="350" height="50" fill="transparent" />
        <Plate x={700} y={496}>PL-300 · Línea</Plate>
      </Hotspot>
      <Hotspot {...props('v301', [584, 366, 52, 90])}>
        <g transform={`translate(610 ${PIPE_Y})`}><ValveArt /></g><Plate x={610} y={466}>V-301</Plate>
      </Hotspot>
      <Hotspot {...props('v302', [734, 366, 52, 90])}>
        <g transform={`translate(760 ${PIPE_Y})`}><ValveArt /></g><Plate x={760} y={466}>V-302</Plate>
      </Hotspot>
      <Hotspot {...props('pi310', [655, 252, 60, 180])}>
        <g transform="translate(685 398)"><GaugeArt /></g><Plate x={685} y={466}>PI-310</Plate>
      </Hotspot>

      {/* P-002 */}
      <Hotspot {...props('gal201', [872, 332, 160, 130])}>
        <g transform="translate(950 452)"><GalleryArt /></g>
        <Plate x={950} y={484}>GAL-201</Plate>
      </Hotspot>
      </g>
    </svg>
  );
}

function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  const c = toneClasses(tone);
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap', c.bg, c.fg)}>{children}</span>;
}
const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-3 border-t px-6 py-5">
    <h3 className="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{title}</h3>
    {children}
  </section>
);

function DetailPanel({ data, component, onClose }: { data: Data; component: SiteComponent | null; onClose: () => void }) {
  const open = component !== null;
  const c = component ?? SITE_COMPONENTS[0];
  const { live, port, milestone, health } = projectInfo(data, c.projectId);
  const findings = componentFindings(data, c.id);
  const status = componentStatus(data, c.id);
  const visit = [...data.inspections].filter(i => i.projectId === c.projectId).sort((a, b) => b.date.localeCompare(a.date))[0];
  const real = live?.physicalProgress ?? port?.progress ?? 0;
  const planned = port?.plannedProgress ?? 0;
  const mDelay = milestone ? milestoneDelay(milestone) : 0;
  const mLate = mDelay > 0 && milestone?.status !== 'Completado';
  return (
    <Sheet open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-[420px]">
        <SheetHeader className="gap-2 p-6 pr-14">
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Equipo · {live?.code} {live?.name}</p>
          <SheetTitle className="bv-title text-2xl tracking-tight">{c.name}</SheetTitle>
          <SheetDescription className="sr-only">Detalle del equipo seleccionado en el mapa de faena.</SheetDescription>
          <div className="mt-1 flex flex-wrap gap-2">
            <Chip tone={projectHealthTone[health]}>Proyecto · {health}</Chip>
            <Chip tone={STATUS_TONE[status]}>{status === 'critical' ? 'Punto crítico' : status === 'warning' ? 'Atención' : 'Sin observaciones'}</Chip>
          </div>
        </SheetHeader>
        <Section title={`Hallazgos activos · ${findings.length}`}>
          {findings.length === 0 ? <p className="text-sm text-muted-foreground">Este equipo no tiene hallazgos activos.</p> : (
            <ul className="flex flex-col gap-2">
              {findings.map(f => (
                <li key={f.id}>
                  <Link href={`/hallazgos/${f.id}`} className="block rounded-xl border bg-card p-3 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring">
                    <div className="flex items-center justify-between gap-2 text-xs"><span className="font-semibold tracking-wide">{f.code}</span><span className={cn('tabular-nums', isOverdue(f) ? 'font-semibold text-tone-red-fg' : 'text-muted-foreground')}>{isOverdue(f) ? 'Vencido · ' : 'Plazo '}{formatDate(f.dueDate)}</span></div>
                    <p className="mt-1 text-sm leading-snug font-medium">{f.title}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5"><Chip tone={severityTone[f.severity]}>{f.severity}</Chip><Chip tone={findingStateTone[f.state]}>{f.state}</Chip></div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
        {milestone && (
          <Section title="Hito en curso">
            <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold">{milestone.name}</p><Chip tone={mLate ? 'red' : 'green'}>{mLate ? `Atraso +${mDelay} d` : `Holgura ${-mDelay} d`}</Chip></div>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div><dt className="text-muted-foreground">Término planificado</dt><dd className="mt-0.5 font-medium tabular-nums">{formatDate(milestone.plannedEnd)}</dd></div>
              <div><dt className="text-muted-foreground">Responsable</dt><dd className="mt-0.5 font-medium">{milestone.responsible}</dd></div>
            </dl>
            <div className="flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className={cn('h-full rounded-full', toneClasses(milestoneStatusTone[milestone.status]).solid)} style={{ width: `${milestone.progress}%` }} /></div><span className="text-xs font-semibold tabular-nums">{milestone.progress} %</span></div>
          </Section>
        )}
        <Section title="Avance físico">
          <div className="flex items-baseline justify-between"><span className="text-4xl font-semibold tracking-tight tabular-nums">{real} %</span><span className="text-xs text-muted-foreground">Planificado {planned} %</span></div>
          <div className="relative h-2.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${real}%` }} /><span className="absolute -top-1 h-[18px] w-0.5 rounded bg-copper" style={{ left: `${planned}%` }} aria-hidden="true" /></div>
          <p className="text-xs text-muted-foreground">{real >= planned ? 'Avance en línea con lo planificado.' : `${planned - real} puntos bajo lo planificado.`}</p>
        </Section>
        {visit && (
          <Section title="Última visita">
            <Link href={`/inspecciones/${visit.id}`} className="block rounded-xl border bg-card p-3 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring">
              <div className="flex justify-between text-xs"><span className="font-semibold tracking-wide">{visit.code}</span><span className="text-muted-foreground tabular-nums">{formatDate(visit.date)}</span></div>
              <p className="mt-1 text-sm font-medium">{visit.activity}</p>
            </Link>
          </Section>
        )}
        <div className="mt-auto border-t p-6">
          <Link href={`/proyectos/${c.projectId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">Ver ficha del proyecto <ArrowRightIcon aria-hidden="true" /></Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LayerToggle({ layers, setLayers }: { layers: Layers; setLayers: (l: Layers) => void }) {
  const items: [keyof Layers, string][] = [['findings', 'Hallazgos'], ['milestones', 'Hitos'], ['flow', 'Flujo']];
  return (
    <div role="group" aria-label="Capas del mapa" className="inline-flex w-fit rounded-full border bg-card p-0.5 shadow-xs">
      {items.map(([k, label]) => (
        <button key={k} type="button" aria-pressed={layers[k]} onClick={() => setLayers({ ...layers, [k]: !layers[k] })}
          className={cn('min-h-9 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring', layers[k] ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
          {label}
        </button>
      ))}
    </div>
  );
}

const LEGEND: [string, ReactNode][] = [
  ['Flujo activo', <span key="f" className="h-2.5 w-7 rounded-full border border-[#1B2B44] bg-[#27b5a5]" />],
  ['Punto crítico', <span key="c" className="size-3 rounded-full bg-[#c0392b]" />],
  ['Atención', <span key="a" className="size-3 rounded-full bg-[#e0a21b]" />],
  ['Sin observaciones', <span key="o" className="size-3 rounded-full border border-[#97a9c0] bg-[#dbe6f3]" />],
];

export function SiteMap() {
  const { data } = useDemo();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layers, setLayers] = useState<Layers>({ findings: true, milestones: false, flow: true });
  const selected = SITE_COMPONENTS.find(c => c.id === selectedId) ?? null;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1"><Heading eyebrow="Control operacional · corte 08 oct 2026" title="Mapa de faena" /></div>
        <Badge variant="secondary">Ilustrativo · datos ficticios</Badge>
      </div>
      <p className="max-w-2xl text-sm text-muted-foreground">Vista esquemática de los proyectos en terreno. Seleccione un equipo para ver hallazgos, hitos y avance.</p>
      <LayerToggle layers={layers} setLayers={setLayers} />
      <div className="sm-canvas overflow-x-auto rounded-3xl border bg-card p-4 shadow-card">
        <Diagram data={data} selectedId={selectedId} onSelect={setSelectedId} layers={layers} />
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground" aria-label="Leyenda">
        {LEGEND.map(([label, mark]) => <li key={label} className="flex items-center gap-2">{mark}{label}</li>)}
      </ul>
      <DetailPanel data={data} component={selected} onClose={() => { const id = selectedId; setSelectedId(null); if (id) setTimeout(() => document.getElementById(`sm-c-${id}`)?.focus(), 60); }} />
    </div>
  );
}
