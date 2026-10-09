import { Suspense } from 'react';
import { AnalysisView } from '@/features/analysis';

export const metadata = { title: 'Análisis IA' };

export default function Page() {
  return <Suspense fallback={<p>Cargando análisis…</p>}><AnalysisView /></Suspense>;
}
