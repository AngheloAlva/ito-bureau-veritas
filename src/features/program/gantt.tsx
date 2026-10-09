'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { CaretRightIcon } from '@phosphor-icons/react';
import { REFERENCE_DATE } from '@/domain/types';
import { daysBetween, addDays, HEALTH_TONE, type GanttRow, type GanttMilestone } from '@/lib/portfolio-analytics';
import { milestoneStatusTone, toneClasses, type Tone } from '@/lib/tones';
import { monthTicks, weekTicks, xForDate, spanWidth } from '@/lib/gantt-scale';
import { cn } from '@/lib/utils';

export type GanttScale = 'mes' | 'trimestre';
const PX_PER_DAY: Record<GanttScale, number> = { mes: 5.2, trimestre: 1.7 };
const LEFT = 300;
const ROW_H = 40;
const SUB_H = 34;

const fmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const fmtDate = (d: string) => fmt.format(new Date(`${d}T00:00:00Z`)).replace(/\./g, '');
const monthName = new Intl.DateTimeFormat('es-CL', { month: 'long', timeZone: 'UTC' });
const monthShort = new Intl.DateTimeFormat('es-CL', { month: 'short', timeZone: 'UTC' });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Tip = {
  code?: string; title: string; description?: string; status: string; tone: Tone; plannedStart: string; plannedEnd: string;
  actualStart?: string; actualEnd?: string; progress?: number; responsible?: string; delay?: number;
};

function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  const t = toneClasses(tone);
  return <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', t.bg, t.fg)}><span aria-hidden="true" className={cn('size-1.5 rounded-full', t.solid)} />{children}</span>;
}

function TipCard({ tip, pos }: { tip: Tip; pos: { x: number; y: number } }) {
  const w = 320;
  const left = Math.max(8, Math.min(pos.x + 14, (typeof window === 'undefined' ? 1200 : window.innerWidth) - w - 8));
  const flip = typeof window !== 'undefined' && pos.y > window.innerHeight - 260;
  const style: CSSProperties = { left, width: w, top: flip ? undefined : pos.y + 16, bottom: flip ? window.innerHeight - pos.y + 16 : undefined };
  return (
    <div role="tooltip" style={style} className="pointer-events-none fixed z-50 flex flex-col gap-2.5 rounded-xl border bg-popover p-3.5 text-xs text-popover-foreground shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-muted-foreground">{tip.code ?? 'Hito'}</span>
        <Chip tone={tip.tone}>{tip.status}</Chip>
      </div>
      <p className="text-sm leading-snug font-semibold">{tip.title}</p>
      {tip.description ? <p className="text-muted-foreground">{tip.description}</p> : null}
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 tabular-nums">
        <dt className="text-muted-foreground">Planificado</dt><dd>{fmtDate(tip.plannedStart)} – {fmtDate(tip.plannedEnd)}</dd>
        <dt className="text-muted-foreground">Real</dt><dd>{tip.actualStart ? `${fmtDate(tip.actualStart)} – ${tip.actualEnd ? fmtDate(tip.actualEnd) : 'en curso'}` : 'Sin iniciar'}</dd>
        {tip.responsible ? <><dt className="text-muted-foreground">Responsable</dt><dd>{tip.responsible}</dd></> : null}
        {tip.delay && tip.delay > 0 ? <><dt className="text-muted-foreground">Desvío</dt><dd className="font-medium text-tone-red-fg">{tip.delay} d de atraso</dd></> : null}
      </dl>
      {tip.progress != null ? (
        <div className="flex items-center gap-2"><span className="text-muted-foreground">Progreso</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className={cn('block h-full rounded-full', toneClasses(tip.tone).solid)} style={{ width: `${tip.progress}%` }} /></span>
          <span className="font-semibold tabular-nums">{tip.progress}%</span></div>
      ) : null}
    </div>
  );
}

function Bars({ plannedStart, plannedEnd, actualStart, actualEnd, tone, outlineOnly, origin, ppd, h, label, delay }: {
  plannedStart: string; plannedEnd: string; actualStart?: string; actualEnd?: string; tone: Tone; outlineOnly?: boolean;
  origin: string; ppd: number; h: number; label?: string; delay?: number;
}) {
  const t = toneClasses(tone);
  const px = xForDate(plannedStart, origin, ppd), pw = spanWidth(plannedStart, plannedEnd, ppd);
  const end = actualEnd ?? REFERENCE_DATE;
  const ax = actualStart ? xForDate(actualStart, origin, ppd) : 0;
  const aw = actualStart ? spanWidth(actualStart, end < actualStart ? actualStart : end, ppd) : 0;
  const barLeft = actualStart ? Math.min(px, ax) : px;
  const barEnd = actualStart ? Math.max(px + pw, ax + aw) : px + pw;
  return (
    <>
      <span aria-hidden="true" className="absolute rounded-md border border-dashed border-foreground/35 bg-foreground/[0.04]" style={{ left: px, width: pw, top: (h - 22) / 2, height: 22 }} />
      {actualStart && !outlineOnly ? <span aria-hidden="true" className={cn('absolute rounded-md', t.solid)} style={{ left: ax, width: aw, top: (h - 12) / 2, height: 12 }} /> : null}
      {label ? <span className="absolute text-[11px] font-semibold tabular-nums text-muted-foreground" style={{ left: barLeft - 4, transform: 'translateX(-100%)', top: h / 2 - 8 }}>{label}</span> : null}
      {delay && delay > 0 ? <span className="absolute rounded bg-tone-red-bg px-1 text-[10px] leading-4 font-semibold text-tone-red-fg tabular-nums" style={{ left: barEnd + 5, top: h / 2 - 8 }}>+{delay} d</span> : null}
    </>
  );
}

export function GanttChart({ rows, scale, expandable = true, initialExpanded = [], label = 'Programa de trabajo' }: {
  rows: GanttRow[]; scale: GanttScale; expandable?: boolean; initialExpanded?: string[]; label?: string;
}) {
  const ppd = PX_PER_DAY[scale];
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initialExpanded));
  const [tip, setTip] = useState<{ tip: Tip; pos: { x: number; y: number } } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const { origin, end } = useMemo(() => {
    let min = REFERENCE_DATE, max = REFERENCE_DATE;
    for (const r of rows) for (const d of [r.plannedStart, r.actualStart, r.plannedEnd, r.actualEnd ?? r.plannedEnd]) { if (d < min) min = d; if (d > max) max = d; }
    for (const r of rows) for (const m of r.milestones) for (const d of [m.plannedStart, m.plannedEnd, m.actualStart ?? m.plannedStart, m.actualEnd ?? m.plannedEnd]) { if (d < min) min = d; if (d > max) max = d; }
    const months = monthTicks(min, addDays(max, 45));
    return { origin: months[0].start, end: addDays(months[months.length - 1].start, months[months.length - 1].days - 1) };
  }, [rows]);
  const months = useMemo(() => monthTicks(origin, end), [origin, end]);
  const weeks = useMemo(() => (scale === 'mes' ? weekTicks(origin, end) : []), [origin, end, scale]);
  const totalW = xForDate(end, origin, ppd) + ppd;
  const todayX = xForDate(REFERENCE_DATE, origin, ppd) + ppd / 2;
  const years = useMemo(() => {
    const out: { year: number; start: number; w: number }[] = [];
    for (const m of months) { const x = xForDate(m.start, origin, ppd), w = m.days * ppd; const last = out[out.length - 1]; if (last && last.year === m.year) last.w += w; else out.push({ year: m.year, start: x, w }); }
    return out;
  }, [months, origin, ppd]);

  useEffect(() => {
    const el = scroller.current; if (!el) return;
    el.scrollLeft = Math.max(0, todayX - (el.clientWidth - LEFT) / 3);
  }, [todayX, scale]);

  const toggle = (id: string) => setExpanded(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const show = (t: Tip) => (e: React.MouseEvent | React.FocusEvent) => {
    if ('clientX' in e) setTip({ tip: t, pos: { x: e.clientX, y: e.clientY } });
    else { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTip({ tip: t, pos: { x: r.left + 120, y: r.top + r.height / 2 } }); }
  };
  const hide = () => setTip(null);

  const grid = (
    <>
      {months.map((m, i) => i % 2 ? <span key={m.start} aria-hidden="true" className="absolute inset-y-0 bg-muted/40" style={{ left: xForDate(m.start, origin, ppd), width: m.days * ppd }} /> : null)}
      <span aria-hidden="true" className="absolute inset-y-0 w-px bg-copper/70" style={{ left: todayX }} />
    </>
  );

  return (
    <div className="relative">
      <div ref={scroller} role="group" aria-label={label} className="max-h-[640px] overflow-auto rounded-xl border bg-card shadow-card">
        <div style={{ width: LEFT + totalW, minWidth: '100%' }}>
          <div className="sticky top-0 z-30 flex border-b bg-card" style={{ height: 52 }}>
            <div className="sticky left-0 z-40 flex shrink-0 items-end border-r bg-card px-4 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase" style={{ width: LEFT }}>Proyecto</div>
            <div className="relative" style={{ width: totalW }}>
              {years.map(y => <span key={y.year} className="absolute top-0 h-6 border-l px-2 text-[11px] leading-6 font-semibold text-muted-foreground" style={{ left: y.start, width: y.w }}><span className="sticky left-[308px]">{y.year}</span></span>)}
              {months.map(m => (
                <span key={m.start} className="absolute top-6 h-[28px] truncate border-l px-1.5 text-[11px] leading-7 text-muted-foreground" style={{ left: xForDate(m.start, origin, ppd), width: m.days * ppd }}>
                  {scale === 'mes' ? cap(monthName.format(new Date(`${m.start}T00:00:00Z`))) : cap(monthShort.format(new Date(`${m.start}T00:00:00Z`)).replace('.', ''))}
                </span>
              ))}
              {weeks.map(w => <span key={w} aria-hidden="true" className="absolute top-[42px] h-2.5 w-px bg-border" style={{ left: xForDate(w, origin, ppd) }} />)}
              <span className="absolute top-1 z-10 -translate-x-1/2 rounded-full bg-copper px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white" style={{ left: todayX }}>Corte 08 oct</span>
            </div>
          </div>
          {rows.map(r => {
            const open = expanded.has(r.projectId);
            const tone = HEALTH_TONE[r.health];
            const tipP: Tip = { code: r.code, title: r.name, status: r.health, tone, plannedStart: r.plannedStart, plannedEnd: r.plannedEnd, actualStart: r.actualStart, actualEnd: r.actualEnd, progress: r.progress };
            return (
              <div key={r.projectId} className="border-b last:border-b-0">
                <div className="group flex" style={{ height: ROW_H }} onMouseMove={show(tipP)} onMouseLeave={hide}>
                  <button type="button" aria-expanded={expandable ? open : undefined} disabled={!expandable || !r.milestones.length} onClick={() => toggle(r.projectId)} onFocus={show(tipP)} onBlur={hide}
                    className="sticky left-0 z-20 flex shrink-0 items-center gap-2 border-r bg-card px-3 text-left outline-none group-hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset" style={{ width: LEFT }}>
                    {expandable ? <CaretRightIcon aria-hidden="true" className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90')} /> : null}
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-[13px] font-medium" title={r.name}><span className="font-mono text-[11px] text-muted-foreground">{r.code}</span> {r.name}</span>
                      <span className="truncate text-[11px] text-muted-foreground">{r.clientShort}</span>
                    </span>
                    <Chip tone={tone}>{r.health}</Chip>
                  </button>
                  <div className="relative" style={{ width: totalW }}>{grid}
                    <Bars plannedStart={r.plannedStart} plannedEnd={r.plannedEnd} actualStart={r.actualStart} actualEnd={r.actualEnd} tone={tone} origin={origin} ppd={ppd} h={ROW_H} label={`${r.progress}%`} />
                  </div>
                </div>
                {open ? r.milestones.map(m => <MilestoneRow key={m.id} m={m} origin={origin} ppd={ppd} totalW={totalW} grid={grid} show={show} hide={hide} />) : null}
              </div>
            );
          })}
        </div>
      </div>
      {tip ? <TipCard tip={tip.tip} pos={tip.pos} /> : null}
    </div>
  );
}

function MilestoneRow({ m, origin, ppd, totalW, grid, show, hide }: { m: GanttMilestone; origin: string; ppd: number; totalW: number; grid: ReactNode; show: (t: Tip) => (e: React.MouseEvent | React.FocusEvent) => void; hide: () => void }) {
  const tone = milestoneStatusTone[m.status];
  const delay = m.status === 'Pendiente' ? 0 : daysBetween(m.plannedEnd, m.actualEnd ?? REFERENCE_DATE);
  const tp: Tip = { title: `${m.seq}. ${m.name}`, status: m.status, tone, plannedStart: m.plannedStart, plannedEnd: m.plannedEnd, actualStart: m.actualStart, actualEnd: m.actualEnd, responsible: m.responsible, delay };
  return (
    <div className="group flex bg-muted/20" style={{ height: SUB_H }} onMouseMove={show(tp)} onMouseLeave={hide}>
      <div tabIndex={0} role="group" aria-label={`Hito ${m.seq}: ${m.name}, ${m.status}`} onFocus={show(tp)} onBlur={hide}
        className="sticky left-0 z-20 flex shrink-0 items-center gap-2 border-r bg-card py-0 pr-3 pl-9 text-[12px] outline-none group-hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset" style={{ width: LEFT }}>
        <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', m.status === 'Pendiente' ? 'border border-tone-slate-solid' : toneClasses(tone).solid)} />
        <span className="min-w-0 flex-1 truncate" title={m.name}>{m.seq}. {m.name}</span>
        <span className="shrink-0 text-[11px] text-muted-foreground">{m.status}</span>
      </div>
      <div className="relative" style={{ width: totalW }}>{grid}
        <Bars plannedStart={m.plannedStart} plannedEnd={m.plannedEnd} actualStart={m.actualStart} actualEnd={m.actualEnd} tone={tone} origin={origin} ppd={ppd} h={SUB_H} delay={delay} />
      </div>
    </div>
  );
}

export function GanttLegend() {
  const items: [string, Tone][] = [['Completado', 'green'], ['En curso', 'blue'], ['Atrasado', 'red'], ['Pendiente', 'slate']];
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="Leyenda">
      <li className="flex items-center gap-2"><span aria-hidden="true" className="h-3.5 w-7 rounded-md border border-dashed border-foreground/35 bg-foreground/[0.04]" />Planificado</li>
      <li className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-7 rounded-md bg-foreground/60" />Real</li>
      {items.map(([n, t]) => <li key={n} className="flex items-center gap-1.5"><span aria-hidden="true" className={cn('size-2.5 rounded-full', toneClasses(t).solid)} />{n}</li>)}
      <li className="flex items-center gap-2"><span aria-hidden="true" className="h-3.5 w-0.5 bg-copper" />Corte 08 oct 2026</li>
      <li className="flex items-center gap-1.5"><span className="rounded bg-tone-red-bg px-1 text-[10px] font-semibold text-tone-red-fg">+N d</span>Días de atraso</li>
    </ul>
  );
}
