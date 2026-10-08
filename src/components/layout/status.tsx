'use client';

import { useDemo } from '@/components/demo-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export function DemoStatus() {
  const demo = useDemo();
  return (
    <div className="no-print flex flex-col gap-3 empty:hidden">
      {demo.error ? <Alert variant="destructive" role="alert"><AlertTitle>El cambio no se pudo completar</AlertTitle><AlertDescription>{demo.error}</AlertDescription></Alert> : null}
      {demo.storageError ? <Alert variant="destructive" role="alert"><AlertTitle>Almacenamiento local</AlertTitle><AlertDescription>{demo.storageError}</AlertDescription></Alert> : null}
      {demo.notice ? <Alert role="status"><AlertTitle>Cambio en la demostración</AlertTitle><AlertDescription>{demo.notice}</AlertDescription></Alert> : null}
    </div>
  );
}

export function RecordsLoading() {
  return (
    <section aria-busy="true" className="flex flex-col gap-6">
      <p role="status" className="text-sm text-muted-foreground">Cargando registros ficticios…</p>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </section>
  );
}
