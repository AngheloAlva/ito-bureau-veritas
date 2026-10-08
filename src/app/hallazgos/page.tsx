import { Suspense } from 'react';
import { Findings } from '@/features/findings';
export default function Page(){return <Suspense fallback={<p>Cargando filtros…</p>}><Findings/></Suspense>;}
