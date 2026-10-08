'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowLeftIcon, ArrowSquareOutIcon } from '@phosphor-icons/react';
import { useDemo } from '@/components/demo-provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function LoadingDetail() { return <p role="status" className="text-sm text-muted-foreground">Cargando detalle…</p>; }
const FindingDetail = dynamic(() => import('@/features/findings/detail').then(module => module.FindingDetail), { loading: LoadingDetail });
const InspectionDetail = dynamic(() => import('@/features/inspections/detail').then(module => module.InspectionDetail), { loading: LoadingDetail });

type RecordSelection = { kind: 'finding' | 'inspection'; id: string };
const PreviewContext = createContext<((record: RecordSelection) => void) | null>(null);

/** Route anchors remain anchors; quick inspection is always an explicit button. */
export function RecordLink({ kind, id, children, fullPage = false }: RecordSelection & { children: ReactNode; fullPage?: boolean }) {
  const navigate = useContext(PreviewContext);
  const triggerId = useId();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<RecordSelection>({ kind, id });
  const [previous, setPrevious] = useState<RecordSelection | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { data } = useDemo();
  useEffect(() => {
    if (open) titleRef.current?.focus({ preventScroll: true });
  }, [open, selection.kind, selection.id]);
  const href = `/${kind === 'finding' ? 'hallazgos' : 'inspecciones'}/${id}`;
  if (fullPage) return <Link className="record-link" href={href}>{children}</Link>;
  if (navigate) return <button type="button" className="record-link record-trigger" onClick={() => navigate({ kind, id })}>{children}</button>;
  const record = selection.kind === 'finding'
    ? data.findings.find(item => item.id === selection.id)
    : data.inspections.find(item => item.id === selection.id);
  function select(next: RecordSelection) {
    if (next.kind === selection.kind && next.id === selection.id) return;
    setPrevious(selection);
    setSelection(next);
    bodyRef.current?.scrollTo({ top: 0 });
  }
  return <Dialog open={open} triggerId={triggerId} onOpenChange={value => {
    setOpen(value);
    if (value) { setSelection({ kind, id }); setPrevious(null); }
  }}>
    <DialogTrigger id={triggerId} render={<button type="button" className="record-link record-trigger" />}>{children}</DialogTrigger>
    <DialogContent className="flex max-h-[calc(100dvh-2rem)] min-w-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
      <DialogHeader className="shrink-0 border-b px-4 py-4 pr-16 sm:px-6 sm:pr-16">
        <DialogTitle ref={titleRef} tabIndex={-1}>{selection.kind === 'finding' ? 'Hallazgo' : 'Inspección'} · {record?.code ?? 'Registro no disponible'}</DialogTitle>
        <DialogDescription>Consulta contextual · el proyecto y sus filtros se mantienen al cerrar.</DialogDescription>
        <nav aria-label="Navegación de consulta" className="flex flex-wrap items-center gap-3">
          {previous ? <Button type="button" variant="ghost" size="sm" onClick={() => {
            setSelection(previous); setPrevious(null); bodyRef.current?.scrollTo({ top: 0 });
          }}><ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />Volver al registro anterior</Button> : null}
          <Link className="record-link inline-flex min-h-10 items-center gap-2 text-xs" href={`/${selection.kind === 'finding' ? 'hallazgos' : 'inspecciones'}/${selection.id}`}><ArrowSquareOutIcon aria-hidden="true" />Abrir página completa</Link>
        </nav>
      </DialogHeader>
      <div ref={bodyRef} className="record-preview-body min-h-0 min-w-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
        <PreviewContext.Provider value={select}>
          {open ? selection.kind === 'finding' ? <FindingDetail key={`finding-${selection.id}`} id={selection.id} /> : <InspectionDetail key={`inspection-${selection.id}`} id={selection.id} /> : null}
        </PreviewContext.Provider>
      </div>
    </DialogContent>
  </Dialog>;
}

export function useRecordPreview() { return useContext(PreviewContext); }
