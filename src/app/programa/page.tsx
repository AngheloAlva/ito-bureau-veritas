import { Suspense } from 'react';
import { Program } from '@/features/program/program';

export const metadata = { title: 'Programa de trabajo' };

export default function Page() {
  return <Suspense fallback={<p>Cargando programa…</p>}><Program /></Suspense>;
}
