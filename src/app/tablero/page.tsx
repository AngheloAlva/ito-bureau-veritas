import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Dashboard } from '@/features/dashboard';

export const metadata: Metadata = { title: 'Tablero ejecutivo' };

export default function Page() {
  return <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando tablero…</p>}><Dashboard /></Suspense>;
}
