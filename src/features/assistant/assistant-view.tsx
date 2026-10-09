'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpIcon, CheckIcon, SparkleIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Heading } from '@/components/records/presentation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PORTFOLIO } from '@/data/portfolio';
import { INTENT_PROMPTS, buildAnswer, matchIntent, type Artifact } from '@/lib/assistant-intents';
import { applyPortfolioFilter } from '@/lib/portfolio-analytics';
import { cn } from 'cn';
import { ArtifactView } from './artifacts';
import { SCOPE_OPTIONS, ScopePicker, scopeLabel } from './scope-picker';

type Message = { id: number; role: 'user' | 'assistant' | 'system'; text: string; artifact?: Artifact; followUps?: string[] };
type Live = { phase: 'thinking'; steps: string[]; step: number } | { phase: 'streaming'; text: string } | null;

const WELCOME = 'Hola, soy el asistente de análisis de ITO. Puedo resumir la cartera, detectar riesgos y generar gráficos. Elija una pregunta o escriba la suya.';
const PROMPTS = Object.values(INTENT_PROMPTS);
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Avatar() {
  return <span className="grid size-8 shrink-0 place-items-center rounded-full bg-copper-surface text-copper" aria-hidden="true"><SparkleIcon size={16} weight="fill" /></span>;
}

function Chips({ items, onPick, disabled }: { items: string[]; onPick: (t: string) => void; disabled: boolean }) {
  return <ul className="flex flex-wrap gap-2" aria-label="Preguntas sugeridas">{items.map(t => <li key={t}>
    <button type="button" disabled={disabled} onClick={() => onPick(t)} className="rounded-full border bg-card px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors outline-none hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50">{t}</button></li>)}</ul>;
}

export function AssistantView() {
  const demo = useDemo();
  const params = useSearchParams();
  const raw = params.get('alcance') ?? '';
  const scope = SCOPE_OPTIONS.some(p => p.id === raw) ? raw : '';
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: 'assistant', text: WELCOME, followUps: PROMPTS.slice(0, 4) }]);
  const [live, setLive] = useState<Live>(null);
  const [draft, setDraft] = useState('');
  const idRef = useRef(1);
  const alive = useRef(true);
  const logRef = useRef<HTMLDivElement>(null);
  const busy = live !== null;

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { const el = logRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' }); }, [messages, live]);

  const changeScope = useCallback((id: string) => {
    if (id === scope) return;
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('alcance', id); else url.searchParams.delete('alcance');
    window.history.pushState(null, '', url);
    setMessages(m => [...m, { id: idRef.current++, role: 'system', text: `Alcance cambiado a ${scopeLabel(id)}.` }]);
  }, [scope]);

  const ask = useCallback(async (input: string) => {
    const text = input.trim();
    if (!text || busy) return;
    setDraft('');
    setMessages(m => [...m, { id: idRef.current++, role: 'user', text }]);
    const intent = matchIntent(text);
    const ctx = { data: demo.data, portfolio: PORTFOLIO, scope };
    const answer = buildAnswer(intent, ctx);
    const motion = !reducedMotion();
    setLive({ phase: 'thinking', steps: [], step: 0 });
    if (motion) {
      const n = applyPortfolioFilter(PORTFOLIO, scope ? { projectId: scope } : {}).milestones.length;
      const steps = intent === 'unknown' ? ['Interpretando su consulta…'] : [`Leyendo ${n} hitos…`, 'Cruzando hallazgos y plazos…', ...(answer.artifact ? ['Generando gráfico…'] : ['Redactando respuesta…'])];
      for (let i = 0; i < steps.length; i++) {
        if (!alive.current) return;
        setLive({ phase: 'thinking', steps, step: i });
        await sleep(400);
      }
      const words = answer.text.split(' ');
      for (let i = 1; i <= words.length; i++) {
        if (!alive.current) return;
        setLive({ phase: 'streaming', text: words.slice(0, i).join(' ') });
        await sleep(20);
      }
    }
    if (!alive.current) return;
    setLive(null);
    setMessages(m => [...m, { id: idRef.current++, role: 'assistant', ...answer }]);
  }, [busy, demo.data, scope]);

  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')?.id;

  return <div className="flex flex-col gap-6">
    <Heading eyebrow="Preguntas y gráficos bajo demanda" title="Asistente de análisis"><Badge variant="secondary">Simulado</Badge></Heading>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card size="sm" className="gap-0 py-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
          <p className="text-sm"><span className="text-muted-foreground">Analizando: </span><strong className="font-semibold">{scopeLabel(scope)}</strong></p>
          <p className="text-xs text-muted-foreground">Datos al 08/10/2026</p>
        </div>
        <div ref={logRef} role="log" aria-live="polite" aria-label="Conversación con el asistente" className="flex h-[min(34rem,calc(100dvh-22rem))] min-h-80 flex-col gap-5 overflow-y-auto bg-muted/30 px-5 py-5">
          {messages.map(m => m.role === 'system'
            ? <p key={m.id} className="self-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{m.text}</p>
            : m.role === 'user'
              ? <div key={m.id} className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.text}</div>
              : <div key={m.id} className="flex max-w-full gap-3 self-start">
                <Avatar />
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="w-fit max-w-prose rounded-2xl rounded-tl-sm border bg-card px-4 py-2.5 text-sm leading-relaxed shadow-card">{m.text}</div>
                  {m.artifact ? <ArtifactView artifact={m.artifact} /> : null}
                  {m.id === lastAssistant && m.followUps ? <div className="flex flex-col gap-1.5"><p className="text-xs text-muted-foreground">{m.id === 0 ? 'Sugerencias' : 'Puede continuar con'}</p><Chips items={m.followUps} onPick={t => void ask(t)} disabled={busy} /></div> : null}
                </div>
              </div>)}
          {live ? <div className="flex gap-3 self-start"><Avatar />
            {live.phase === 'thinking'
              ? <ul className="flex flex-col gap-1.5 rounded-2xl rounded-tl-sm border bg-card px-4 py-3 text-xs text-muted-foreground shadow-card" aria-label="El asistente está analizando">
                {live.steps.slice(0, live.step + 1).map((s, i) => <li key={s} className={cn('flex items-center gap-2', i === live.step && 'animate-pulse text-foreground')}>
                  {i < live.step ? <CheckIcon size={12} weight="bold" className="text-tone-green-solid" aria-hidden="true" /> : <span className="size-1.5 rounded-full bg-copper" aria-hidden="true" />}{s}</li>)}</ul>
              : <div className="w-fit max-w-prose rounded-2xl rounded-tl-sm border bg-card px-4 py-2.5 text-sm leading-relaxed shadow-card">{live.text}</div>}
          </div> : null}
        </div>
        <form className="flex flex-col gap-2 border-t px-5 py-4" onSubmit={e => { e.preventDefault(); void ask(draft); }}>
          <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-1 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
            <Textarea value={draft} onChange={e => setDraft(e.target.value)} disabled={busy} rows={1} aria-label="Escriba su pregunta" placeholder="Escriba su pregunta, por ejemplo: ¿qué proyectos están en riesgo?"
              className="max-h-32 min-h-0 flex-1 border-0 py-2.5 focus-visible:border-0"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void ask(draft); } }} />
            <Button type="submit" size="icon-sm" className="mb-1 rounded-full" disabled={busy || !draft.trim()} aria-label="Enviar pregunta"><ArrowUpIcon weight="bold" /></Button>
          </div>
          <p className="text-xs text-muted-foreground">Respuestas simuladas con reglas deterministas sobre datos ficticios. No se envía información a servicios externos.</p>
        </form>
      </Card>
      <aside className="flex flex-col gap-6 lg:sticky lg:top-6" aria-label="Opciones del asistente">
        <section className="flex flex-col gap-3"><h2 className="text-sm font-semibold">Alcance</h2><ScopePicker value={scope} onChange={changeScope} /></section>
        <section className="flex flex-col gap-3"><h2 className="text-sm font-semibold">Preguntas sugeridas</h2>
          <ul className="flex flex-col gap-1.5">{PROMPTS.map(t => <li key={t}><button type="button" disabled={busy} onClick={() => void ask(t)} className="flex w-full items-start gap-2 rounded-lg border bg-card px-3 py-2 text-left text-xs font-medium transition-colors outline-none hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"><SparkleIcon size={14} className="mt-0.5 shrink-0 text-copper" aria-hidden="true" />{t}</button></li>)}</ul>
        </section>
      </aside>
    </div>
  </div>;
}
