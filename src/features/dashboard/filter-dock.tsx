'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { BuildingsIcon } from '@phosphor-icons/react/dist/csr/Buildings';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import { DotsSixIcon } from '@phosphor-icons/react/dist/csr/DotsSix';
import { FlagIcon } from '@phosphor-icons/react/dist/csr/Flag';
import { FunnelSimpleIcon } from '@phosphor-icons/react/dist/csr/FunnelSimple';
import { GaugeIcon } from '@phosphor-icons/react/dist/csr/Gauge';
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { TimerIcon } from '@phosphor-icons/react/dist/csr/Timer';
import { UsersThreeIcon } from '@phosphor-icons/react/dist/csr/UsersThree';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DURATION_BUCKETS, MILESTONE_SITUATIONS, PROJECT_HEALTHS } from '@/domain/portfolio';
import { PORTFOLIO } from '@/data/portfolio';
import { describeFilter, HEALTH_TONE, SITUATION_TONE, type FilterKey, type PortfolioFilter } from '@/lib/portfolio-analytics';
import { toneClasses, type Tone } from '@/lib/tones';
import { toneVar } from './chart-kit';
import { STATUS_ICON } from './status-chip';

export const DOCK_KEY = 'ito-dashboard:filter-dock:v1';
type Corner = 'br' | 'bl' | 'tr' | 'tl';
const CORNERS: Corner[] = ['br', 'bl', 'tl', 'tr'];
const MARGIN = 20;
const EVENT = 'ito-filter-dock-change';

const subscribe = (cb: () => void) => {
  window.addEventListener('storage', cb); window.addEventListener(EVENT, cb);
  return () => { window.removeEventListener('storage', cb); window.removeEventListener(EVENT, cb); };
};
const readCorner = (): Corner => {
  try { const v = JSON.parse(window.localStorage.getItem(DOCK_KEY) ?? 'null') as { corner?: string } | null; return CORNERS.includes(v?.corner as Corner) ? (v!.corner as Corner) : 'br'; } catch { return 'br'; }
};
const writeCorner = (corner: Corner) => {
  try { window.localStorage.setItem(DOCK_KEY, JSON.stringify({ corner })); } catch { /* storage unavailable: position stays for this session only */ }
  window.dispatchEvent(new Event(EVENT));
};

type Dim = { key: FilterKey; label: string; icon: typeof GaugeIcon; tone: Tone };
const DIMS: Dim[] = [
  { key: 'health', label: 'Estado del proyecto', icon: GaugeIcon, tone: 'blue' },
  { key: 'clientId', label: 'Cliente', icon: UsersThreeIcon, tone: 'violet' },
  { key: 'situation', label: 'Situación del hito', icon: FlagIcon, tone: 'teal' },
  { key: 'bucket', label: 'Tramo de duración', icon: TimerIcon, tone: 'sky' },
  { key: 'projectId', label: 'Proyecto', icon: BuildingsIcon, tone: 'copper' },
];
const dimOf = (k: FilterKey) => DIMS.find(d => d.key === k);

type Option = { value: string; label: string; hint?: string; tone?: Tone };
function optionsFor(key: FilterKey): Option[] {
  switch (key) {
    case 'health': return PROJECT_HEALTHS.map(h => ({ value: h, label: h, tone: HEALTH_TONE[h] }));
    case 'clientId': return PORTFOLIO.clients.map(c => ({ value: c.id, label: c.name, hint: c.area }));
    case 'situation': return MILESTONE_SITUATIONS.map(s => ({ value: s, label: s, tone: SITUATION_TONE[s] }));
    case 'bucket': return DURATION_BUCKETS.map(b => ({ value: b, label: b }));
    case 'projectId': return PORTFOLIO.projects.map(p => ({ value: p.id, label: p.name, hint: p.code }));
    default: return [];
  }
}

const chipTone = (key: FilterKey, f: PortfolioFilter): Tone => {
  if (key === 'health' && f.health) return HEALTH_TONE[f.health];
  if (key === 'situation' && f.situation) return SITUATION_TONE[f.situation];
  return dimOf(key)?.tone ?? 'slate';
};

function AddFilter({ filter, setFilter, onOpenChange, corner }: { filter: PortfolioFilter; setFilter: (p: Partial<PortfolioFilter>) => void; onOpenChange: (o: boolean) => void; corner: Corner }) {
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(true);
  const [dim, setDim] = useState<Dim | null>(null);
  const change = (o: boolean) => { if (o) setWide(window.matchMedia('(min-width: 768px)').matches); setOpen(o); onOpenChange(o); if (!o) setDim(null); };
  const current = dim ? (filter as Record<string, string | undefined>)[dim.key] : undefined;
  const row = 'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none';
  return (
    <Popover open={open} onOpenChange={change}>
      <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-card px-3 text-xs font-semibold outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">
        <PlusIcon size={13} aria-hidden="true" />Agregar filtro
      </PopoverTrigger>
      <PopoverContent side={wide ? (corner.endsWith('r') ? 'left' : 'right') : 'top'} align="end" sideOffset={10} className="w-72 gap-1 p-1.5">
        {!dim ? (
          <div role="group" aria-label="Elegir dimensión">
            <p className="px-2.5 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filtrar por</p>
            {DIMS.map(d => {
              const active = (filter as Record<string, string | undefined>)[d.key];
              const t = toneClasses(d.tone);
              return (
                <button key={d.key} type="button" className={row} onClick={() => setDim(d)}>
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${t.bg} ${t.fg}`} aria-hidden="true"><d.icon size={15} /></span>
                  <span className="flex-1">{d.label}</span>
                  {active && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Activo</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div role="group" aria-label={`Valores de ${dim.label}`}>
            <button type="button" className={`${row} font-semibold`} onClick={() => setDim(null)}><ArrowLeftIcon size={14} aria-hidden="true" />{dim.label}</button>
            <div className="max-h-64 overflow-y-auto overscroll-contain pt-0.5">
              {optionsFor(dim.key).map(o => (
                <button key={o.value} type="button" aria-pressed={current === o.value} className={row}
                  onClick={() => { setFilter({ [dim.key]: o.value } as Partial<PortfolioFilter>); change(false); }}>
                  {o.tone ? <span className="size-2.5 shrink-0 rounded-full" style={{ background: toneVar(o.tone) }} aria-hidden="true" /> : <span className="size-2.5 shrink-0" aria-hidden="true" />}
                  <span className="flex-1 truncate">{o.label}</span>
                  {o.hint && <span className="text-xs text-muted-foreground tabular-nums">{o.hint}</span>}
                  {current === o.value && <CheckIcon size={14} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

const POS: Record<Corner, string> = {
  br: 'md:right-5 md:bottom-5', bl: 'md:left-[var(--dock-left,1.25rem)] md:bottom-5', tr: 'md:right-5 md:top-5', tl: 'md:left-[var(--dock-left,1.25rem)] md:top-5',
};
const ORIGIN: Record<Corner, string> = { br: 'origin-bottom-right', bl: 'origin-bottom-left', tr: 'origin-top-right', tl: 'origin-top-left' };

/** Floating, draggable, collapsible filter panel. Position (nearest corner) persists in localStorage. */
export function FilterDock({ filter, setFilter, remove, clear }: {
  filter: PortfolioFilter; setFilter: (p: Partial<PortfolioFilter>) => void; remove: (k: FilterKey) => void; clear: () => void;
}) {
  const chips = describeFilter(filter, PORTFOLIO);
  const corner = useSyncExternalStore(subscribe, readCorner, () => 'br' as Corner);
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [drag, setDrag] = useState<{ dx: number; dy: number; active: boolean }>({ dx: 0, dy: 0, active: false });
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{ px: number; py: number; left: number; top: number } | null>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const [settling, setSettling] = useState(false);

  // Left corners sit inside the content area (right of the sidebar), also when the sidebar is collapsed.
  useEffect(() => {
    const el = ref.current, main = el?.closest('main');
    if (!el || !main) return;
    const set = () => el.style.setProperty('--dock-left', `${main.getBoundingClientRect().left + MARGIN}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(main);
    window.addEventListener('resize', set);
    return () => { ro.disconnect(); window.removeEventListener('resize', set); };
  }, []);

  const collapse = useCallback(() => { setOpen(false); requestAnimationFrame(() => pillRef.current?.focus()); }, []);

  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const natural = (c: Corner, w: number, h: number) => ({
    x: c === 'br' || c === 'tr' ? window.innerWidth - w - MARGIN : (ref.current?.closest('main')?.getBoundingClientRect().left ?? 0) + MARGIN,
    y: c === 'br' || c === 'bl' ? window.innerHeight - h - MARGIN : MARGIN,
  });
  const onDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (isMobile() || e.button !== 0 || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    start.current = { px: e.clientX, py: e.clientY, left: r.left, top: r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    setSettling(false);
    setDrag({ dx: 0, dy: 0, active: true });
  };
  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const s = start.current, el = ref.current;
    if (!s || !el) return;
    const { offsetWidth: w, offsetHeight: h } = el;
    const nx = Math.min(Math.max(s.left + e.clientX - s.px, 8), window.innerWidth - w - 8);
    const ny = Math.min(Math.max(s.top + e.clientY - s.py, 8), window.innerHeight - h - 8);
    // The offset is relative to the current corner anchor: compare against the un-dragged natural position.
    const nat = natural(corner, w, h);
    setDrag({ dx: nx - nat.x, dy: ny - nat.y, active: true });
  };
  const onUp = (e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!start.current || !el) return;
    start.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const { offsetWidth: w, offsetHeight: h } = el;
    const cur = natural(corner, w, h);
    const x = cur.x + drag.dx, y = cur.y + drag.dy;
    const next: Corner = `${y + h / 2 < window.innerHeight / 2 ? 't' : 'b'}${x + w / 2 < window.innerWidth / 2 ? 'l' : 'r'}` as Corner;
    const nat = natural(next, w, h);
    // Re-anchor to the nearest corner while keeping the card where the user dropped it, then glide in.
    setDrag({ dx: x - nat.x, dy: y - nat.y, active: false });
    writeCorner(next);
    if (reduced()) { setDrag({ dx: 0, dy: 0, active: false }); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => { setSettling(true); setDrag({ dx: 0, dy: 0, active: false }); }));
  };
  const onHandleKey = (e: KeyboardEvent<HTMLElement>) => {
    const move: Record<string, (c: Corner) => Corner> = {
      ArrowLeft: c => `${c[0]}l` as Corner, ArrowRight: c => `${c[0]}r` as Corner,
      ArrowUp: c => `t${c[1]}` as Corner, ArrowDown: c => `b${c[1]}` as Corner,
    };
    if (move[e.key]) { e.preventDefault(); writeCorner(move[e.key](corner)); }
  };
  // Escape collapses the panel (unless the "Agregar filtro" popover is open and takes the key first).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape' && !popoverOpen && !e.defaultPrevented) collapse(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, popoverOpen, collapse]);

  const count = chips.length;
  const style = { transform: `translate3d(${drag.dx}px, ${drag.dy}px, 0)`, transition: settling && !drag.active ? 'transform 220ms cubic-bezier(0.23, 1, 0.32, 1)' : 'none' };

  return (
    <div
      ref={ref} data-corner={corner} role="region" aria-label="Panel de filtros"
      onTransitionEnd={() => setSettling(false)}
      className={`fixed z-30 max-md:inset-x-3 max-md:bottom-3 ${POS[corner]} ${drag.active ? 'cursor-grabbing select-none' : ''}`}
      style={style}
    >
      {!open ? (
        <div className="flex justify-end md:block">
          <div className="inline-flex items-center rounded-full bg-card shadow-lg ring-1 ring-foreground/10">
            <span
              role="button" tabIndex={0} aria-label="Mover panel de filtros. Use las flechas para cambiar de esquina."
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onHandleKey}
              className="hidden h-10 w-7 cursor-grab touch-none items-center justify-center rounded-l-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:flex"
            ><DotsSixIcon size={16} weight="bold" aria-hidden="true" /></span>
            <button ref={pillRef} type="button" aria-expanded="false" onClick={() => setOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full pl-4 pr-4 text-sm font-semibold outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring md:rounded-l-none md:pl-1.5 motion-reduce:transition-none">
              <FunnelSimpleIcon size={15} aria-hidden="true" />
              Filtros{count > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-copper px-1.5 text-xs font-semibold text-white tabular-nums">{count}</span>}
            </button>
          </div>
        </div>
      ) : (
        <div className={`w-full rounded-2xl bg-card shadow-xl ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none md:w-[23rem] ${ORIGIN[corner]}`}>
          <div className="flex items-center gap-1 border-b px-2 py-1.5">
            <span
              role="button" tabIndex={0} aria-label="Mover panel de filtros. Use las flechas para cambiar de esquina."
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onHandleKey}
              className="hidden h-8 w-7 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:flex"
            ><DotsSixIcon size={16} weight="bold" aria-hidden="true" /></span>
            <h2 className="flex-1 pl-1 text-sm font-semibold md:pl-0">Filtros{count > 0 && <span className="ml-1.5 text-muted-foreground tabular-nums">· {count}</span>}</h2>
            <button type="button" onClick={collapse} aria-label="Contraer panel de filtros" title="Contraer (Esc)"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"><MinusIcon size={15} aria-hidden="true" /></button>
          </div>
          <div className="space-y-3 p-3">
            {chips.length === 0 ? <p className="text-sm text-muted-foreground">Sin filtros · cartera completa.</p> : (
              <ul className="flex flex-wrap gap-1.5" aria-label="Filtros activos">
                {chips.map(c => {
                  const tone = chipTone(c.key, filter);
                  const t = toneClasses(tone);
                  const Icon = c.key === 'health' && filter.health ? STATUS_ICON[filter.health] : dimOf(c.key)?.icon ?? FlagIcon;
                  return (
                    <li key={c.key} className={`inline-flex max-w-full items-center gap-1.5 rounded-full py-0.5 pl-2.5 pr-0.5 text-xs font-medium ${t.bg} ${t.fg}`}>
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: toneVar(tone) }} aria-hidden="true" />
                      <Icon size={13} aria-hidden="true" />
                      <span className="truncate">{c.label}</span>
                      <button type="button" onClick={() => remove(c.key)} aria-label={`Quitar filtro ${c.label}`}
                        className="flex size-6 shrink-0 items-center justify-center rounded-full outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"><XIcon size={12} aria-hidden="true" /></button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex items-center justify-between gap-2">
              <AddFilter filter={filter} setFilter={setFilter} onOpenChange={setPopoverOpen} corner={corner} />
              {count > 0 && <button type="button" onClick={clear} className="rounded-full px-3 py-1.5 text-xs font-semibold text-copper outline-none transition-colors hover:bg-copper-surface focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">Limpiar</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
