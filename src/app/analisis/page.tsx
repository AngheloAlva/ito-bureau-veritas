import { Suspense } from 'react';
import { AnalysisView } from '@/features/analysis';
export default function Page(){return <Suspense fallback={<p>Cargando alcance…</p>}><AnalysisView/></Suspense>;}
