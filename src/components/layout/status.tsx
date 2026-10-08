'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useDemo } from '@/components/demo-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export function DemoStatus() {
  const demo = useDemo();
  const path = usePathname();
  const [dismissed, setDismissed] = useState('');
  const shown = useRef({ text: '', at: 0 });
  // A notice belongs to the change that produced it: hide it after navigating away or after ~6s.
  useEffect(() => {
    if (!demo.notice) return;
    shown.current = { text: demo.notice, at: Date.now() };
    setDismissed('');
    const timer = setTimeout(() => setDismissed(demo.notice ?? ''), 6000);
    return () => clearTimeout(timer);
  }, [demo.notice]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    // Keep a notice that triggered the navigation itself (e.g. after creating a record).
    if (Date.now() - shown.current.at > 1500) setDismissed(shown.current.text);
  }, [path]);
  const notice = demo.notice && demo.notice !== dismissed ? demo.notice : null;
  return (
    <div className="no-print flex flex-col gap-3 empty:hidden">
      {demo.error ? <Alert variant="destructive" role="alert"><AlertTitle>El cambio no se pudo completar</AlertTitle><AlertDescription>{demo.error}</AlertDescription></Alert> : null}
      {demo.storageError ? <Alert variant="destructive" role="alert"><AlertTitle>Almacenamiento local</AlertTitle><AlertDescription>{demo.storageError}</AlertDescription></Alert> : null}
      {notice ? <Alert role="status"><AlertTitle>Cambio en la demostración</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert> : null}
    </div>
  );
}

export function RecordsLoading() {
  return (
    <section aria-busy="true" className="flex flex-col gap-6">
      <p role="status" className="text-sm text-muted-foreground">Cargando registros…</p>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </section>
  );
}
