'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowSquareOutIcon, CheckIcon, CopyIcon } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import type { Artifact } from '@/lib/assistant-intents';
import { toneClasses } from '@/lib/tones';
import { cn } from 'cn';

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return <Button type="button" variant="outline" size="sm" onClick={() => { void navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); }); }}>
    {done ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}{done ? 'Copiado' : 'Copiar texto'}
  </Button>;
}

function Frame({ title, href, copy, children }: { title: string; href?: string; copy?: string; children: ReactNode }) {
  return <Card size="sm" className="animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
    <div className="flex flex-col gap-4 px-(--card-spacing)">
      <div className="flex flex-col gap-0.5"><h3 className="text-sm font-semibold">{title}</h3><p className="text-xs text-muted-foreground">Generado por el asistente · simulado</p></div>
      {children}
      {href || copy ? <div className="flex flex-wrap gap-2">
        {href ? <Link href={href} className={buttonVariants({ variant: 'outline', size: 'sm' })}><ArrowSquareOutIcon data-icon="inline-start" />Abrir en el tablero</Link> : null}
        {copy ? <CopyButton text={copy} /> : null}
      </div> : null}
    </div>
  </Card>;
}

function Kpis({ a }: { a: Extract<Artifact, { kind: 'kpis' }> }) {
  return <Frame title="Resumen ejecutivo" href={a.dashboardHref}>
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {a.items.map(i => { const t = toneClasses(i.tone); return <div key={i.label} className={cn('flex flex-col gap-1 rounded-lg border p-3', t.bg, t.border)}>
        <dt className="text-xs text-muted-foreground">{i.label}</dt><dd className={cn('text-2xl font-semibold tabular-nums', t.fg)}>{i.value}</dd><dd className="text-xs text-muted-foreground">{i.hint}</dd></div>; })}
    </dl>
  </Frame>;
}

function Bar({ a }: { a: Extract<Artifact, { kind: 'bar' }> }) {
  const max = Math.max(1, ...a.series.map(s => s.value));
  const copy = a.series.map(s => `${s.label}: ${s.value} ${a.unit}`).join('\n');
  const label = (s: (typeof a.series)[number]) => s.href ? <Link href={s.href} className="underline-offset-2 hover:underline focus-visible:underline">{s.label}</Link> : s.label;
  if (a.orientation === 'vertical') return <Frame title={a.title} href={a.dashboardHref} copy={copy}>
    <ul className="flex h-44 items-end gap-3">{a.series.map(s => <li key={s.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 text-xs">
      <span className="font-semibold tabular-nums">{s.value} {a.unit}</span>
      <span className={cn('w-full rounded-t-md', toneClasses(s.tone).solid)} style={{ height: `${Math.max(4, s.value / max * 100)}%` }} />
      <span className="truncate text-muted-foreground">{label(s)}</span></li>)}</ul>
  </Frame>;
  return <Frame title={a.title} href={a.dashboardHref}>
    <ul className="flex flex-col gap-2.5">{a.series.map(s => { const t = toneClasses(s.tone); return <li key={s.label} className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-3 text-xs">
      <span className="truncate font-medium">{label(s)}</span>
      <span className="h-3 overflow-hidden rounded-full bg-muted"><span className={cn('block h-full rounded-full', t.solid)} style={{ width: `${Math.max(s.value ? 3 : 0, s.value / max * 100)}%` }} /></span>
      <span className={cn('text-right font-semibold tabular-nums', t.fg)}>{s.value} {a.unit}</span></li>; })}</ul>
  </Frame>;
}

function Donut({ a }: { a: Extract<Artifact, { kind: 'donut' }> }) {
  const total = a.series.reduce((n, s) => n + s.value, 0);
  const R = 52, C = 2 * Math.PI * R;
  let offset = 0;
  return <Frame title={a.title} href={a.dashboardHref}>
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="size-36 shrink-0" role="img" aria-label={`${a.title}: ${a.series.map(s => `${s.label} ${s.value}`).join(', ')}`}>
        <circle cx="70" cy="70" r={R} fill="none" strokeWidth="18" className="stroke-muted" />
        {total ? a.series.map(s => { const len = s.value / total * C; const el = s.value ? <circle key={s.label} cx="70" cy="70" r={R} fill="none" strokeWidth="18" strokeLinecap="butt" className={toneClasses(s.tone).stroke}
          strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" /> : null; offset += len; return el; }) : null}
        <text x="70" y="68" textAnchor="middle" className="fill-foreground text-[26px] font-semibold">{total}</text>
        <text x="70" y="86" textAnchor="middle" className="fill-muted-foreground text-[10px]">activos</text>
      </svg>
      <ul className="flex min-w-40 flex-1 flex-col gap-2 text-sm">{a.series.map(s => <li key={s.label} className="flex items-center gap-2">
        <span className={cn('size-3 rounded-full', toneClasses(s.tone).solid)} aria-hidden="true" /><span className="flex-1">{s.label}</span>
        <span className="font-semibold tabular-nums">{s.value}</span><span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{total ? Math.round(s.value / total * 100) : 0}%</span></li>)}</ul>
    </div>
  </Frame>;
}

function Line({ a }: { a: Extract<Artifact, { kind: 'line' }> }) {
  const W = 560, H = 210, L = 34, Rr = 14, T = 14, B = 28;
  const n = a.points.length;
  const max = Math.max(1, ...a.points.map(p => Math.max(p.planned, p.actual ?? 0)));
  const x = (i: number) => L + (n > 1 ? i / (n - 1) : 0) * (W - L - Rr);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const planned = a.points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.planned).toFixed(1)}`).join(' ');
  const act = a.points.map((p, i) => ({ p, i })).filter(({ p }) => p.actual !== null);
  const actual = act.map(({ p, i }, k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.actual ?? 0).toFixed(1)}`).join(' ');
  const lastAct = act[act.length - 1];
  const ticks = [0, 0.5, 1].map(f => Math.round(max * f));
  return <Frame title={a.title} href={a.dashboardHref}>
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${a.title}. Último real: ${lastAct?.p.actual ?? 0} de ${lastAct?.p.planned ?? 0} programados.`}>
      {ticks.map(t => <g key={t}><line x1={L} x2={W - Rr} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="3 4" /><text x={L - 6} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">{t}</text></g>)}
      {a.points.map((p, i) => i % Math.ceil(n / 6) === 0 ? <text key={p.label} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">{p.label}</text> : null)}
      <path d={planned} fill="none" strokeWidth="2" strokeDasharray="5 4" className="stroke-muted-foreground" />
      {actual ? <path d={actual} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-tone-blue-solid" /> : null}
      {lastAct ? <><circle cx={x(lastAct.i)} cy={y(lastAct.p.actual ?? 0)} r="5" className="fill-tone-blue-solid stroke-card" strokeWidth="2" />
        <text x={x(lastAct.i)} y={y(lastAct.p.actual ?? 0) - 10} textAnchor="middle" className="fill-tone-blue-fg text-[11px] font-semibold">{lastAct.p.actual}</text></> : null}
    </svg>
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
      <li className="flex items-center gap-2"><span className="h-0 w-5 border-t-2 border-dashed border-muted-foreground" aria-hidden="true" />Programado{lastAct ? `: ${lastAct.p.planned}` : ''}</li>
      <li className="flex items-center gap-2"><span className="h-0.5 w-5 rounded bg-tone-blue-solid" aria-hidden="true" />Real{lastAct ? `: ${lastAct.p.actual}` : ''}</li>
    </ul>
  </Frame>;
}

function Table({ a }: { a: Extract<Artifact, { kind: 'table' }> }) {
  const tsv = [a.columns.join('\t'), ...a.rows.map(r => r.cells.join('\t'))].join('\n');
  return <Frame title={a.title} href={a.dashboardHref} copy={tsv}>
    <div className="overflow-x-auto rounded-lg border"><table className="w-full text-left text-xs">
      <thead className="bg-muted/60 text-muted-foreground"><tr>{a.columns.map(c => <th key={c} scope="col" className="px-3 py-2 font-semibold">{c}</th>)}</tr></thead>
      <tbody>{a.rows.map((r, i) => <tr key={i} className="border-t">{r.cells.map((c, j) => <td key={j} className="px-3 py-2 align-top">{j === 0 && r.href ? <Link href={r.href} className="font-semibold text-primary underline-offset-2 hover:underline">{c}</Link> : c}</td>)}</tr>)}</tbody>
    </table></div>
  </Frame>;
}

function Draft({ a }: { a: Extract<Artifact, { kind: 'draft' }> }) {
  return <Frame title={a.title} href={a.dashboardHref} copy={a.body}>
    <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/40 p-4 font-sans text-xs leading-relaxed whitespace-pre-wrap">{a.body}</pre>
  </Frame>;
}

export function ArtifactView({ artifact }: { artifact: Artifact }) {
  switch (artifact.kind) {
    case 'kpis': return <Kpis a={artifact} />;
    case 'bar': return <Bar a={artifact} />;
    case 'donut': return <Donut a={artifact} />;
    case 'line': return <Line a={artifact} />;
    case 'table': return <Table a={artifact} />;
    case 'draft': return <Draft a={artifact} />;
  }
}
